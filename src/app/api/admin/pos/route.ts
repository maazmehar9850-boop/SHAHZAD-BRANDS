import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { adjustStock } from "@/lib/inventory";
import { nextInvoiceNumber, nextOrderNumber, nextPaymentNumber } from "@/lib/numbers";
import { getSetting } from "@/lib/settings";
import { productEffectivePrice } from "@/lib/format";
import {
  InventoryTransactionType,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from "@prisma/client";

type PosLine = { productId: string; quantity: number };

export async function POST(req: Request) {
  const { error, session } = await requireStaffApi(PERMISSIONS.CREATE_BILLS);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      amountPaid,
      discount,
      notes,
    } = body as {
      items: PosLine[];
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      paymentMethod: PaymentMethodType;
      amountPaid: number;
      discount?: number;
      notes?: string;
    };

    if (!items?.length) return jsonError("Add at least one item", 400);
    if (!paymentMethod) return jsonError("Payment method required", 400);

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: session.userId },
    });
    if (!staff) return jsonError("Staff profile not found", 403);

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    });
    const map = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lines: {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const line of items) {
      const product = map.get(line.productId);
      if (!product) return jsonError("Product not found", 400);
      if (product.stockQuantity < line.quantity) {
        return jsonError(`Insufficient stock: ${product.name}`, 400);
      }
      const unitPrice = productEffectivePrice(product.price, product.salePrice);
      const total = unitPrice * line.quantity;
      subtotal += total;
      lines.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPrice,
        total,
      });
    }

    const discountAmt = Math.min(Number(discount ?? 0), subtotal);
    const taxRate = parseFloat((await getSetting("tax_rate")) ?? "5") / 100;
    const taxable = subtotal - discountAmt;
    const tax = Math.round(taxable * taxRate * 100) / 100;
    const total = taxable + tax;
    const paid = Number(amountPaid ?? total);
    const changeDue = Math.max(0, paid - total);

    const orderNumber = await nextOrderNumber();
    const invoiceNumber = await nextInvoiceNumber();
    const paymentNumber = await nextPaymentNumber();

    const name = customerName?.trim() || "Walk-in Customer";

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod,
          isPos: true,
          cashierId: staff.id,
          guestName: name,
          guestPhone: customerPhone ?? null,
          guestEmail: customerEmail ?? null,
          shippingAddress: "In-store pickup",
          shippingCity: "POS",
          subtotal,
          discount: discountAmt,
          shipping: 0,
          tax,
          total,
          notes: notes ?? null,
          items: { create: lines },
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          staffId: staff.id,
          customerName: name,
          customerPhone: customerPhone ?? null,
          customerEmail: customerEmail ?? null,
          subtotal,
          discount: discountAmt,
          tax,
          total,
          amountPaid: paid,
          changeDue,
          paymentMethod,
          paymentStatus: PaymentStatus.PAID,
          notes: notes ?? null,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              productName: l.productName,
              sku: l.sku,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              total: l.total,
            })),
          },
        },
      });

      await tx.payment.create({
        data: {
          paymentNumber,
          orderId: order.id,
          invoiceId: invoice.id,
          amount: total,
          method: paymentMethod,
          status: PaymentStatus.PAID,
          staffId: staff.id,
        },
      });

      return { order, invoice };
    });

    for (const line of lines) {
      await adjustStock({
        productId: line.productId,
        delta: -line.quantity,
        type: InventoryTransactionType.POS_SALE,
        reference: result.invoice.invoiceNumber,
        staffId: staff.id,
      });
    }

    return jsonOk({
      orderNumber: result.order.orderNumber,
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
      total,
      changeDue,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_STOCK") {
      return jsonError("Insufficient stock", 400);
    }
    console.error(e);
    return jsonError("POS sale failed", 500);
  }
}
