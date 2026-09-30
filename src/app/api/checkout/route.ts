import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { validateCoupon } from "@/lib/coupons";
import { adjustStock } from "@/lib/inventory";
import { nextInvoiceNumber, nextOrderNumber, nextPaymentNumber } from "@/lib/numbers";
import { getSetting } from "@/lib/settings";
import { productEffectivePrice } from "@/lib/format";
import {
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  InventoryTransactionType,
} from "@prisma/client";

type CheckoutItem = { productId: string; quantity: number };

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      items,
      couponCode,
      paymentMethod,
      shippingAddress,
      shippingCity,
      shippingArea,
      shippingPostal,
      guestName,
      guestEmail,
      guestPhone,
      notes,
    } = body as {
      items: CheckoutItem[];
      couponCode?: string;
      paymentMethod?: PaymentMethodType;
      shippingAddress?: string;
      shippingCity?: string;
      shippingArea?: string;
      shippingPostal?: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      notes?: string;
    };

    if (!items?.length) return jsonError("Cart is empty", 400);
    if (!shippingAddress || !shippingCity) {
      return jsonError("Shipping address is required", 400);
    }
    if (!session && (!guestName || !guestEmail || !guestPhone)) {
      return jsonError("Guest contact details required", 400);
    }
    if (session?.type === "STAFF") {
      return jsonError("Please use a customer account for checkout", 403);
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: { take: 1 } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const line of items) {
      const product = productMap.get(line.productId);
      if (!product) return jsonError(`Product not found: ${line.productId}`, 400);
      if (product.stockQuantity < line.quantity) {
        return jsonError(`Insufficient stock for ${product.name}`, 400);
      }
      const unitPrice = productEffectivePrice(product.price, product.salePrice);
      const total = unitPrice * line.quantity;
      subtotal += total;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPrice,
        total,
      });
    }

    let discount = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal);
      if (!couponResult.valid) return jsonError(couponResult.error, 400);
      discount = couponResult.discount;
      appliedCoupon = couponResult.coupon.code;
    }

    const shippingFlat = parseFloat((await getSetting("shipping_flat")) ?? "250");
    const taxRate = parseFloat((await getSetting("tax_rate")) ?? "5") / 100;
    const shipping = subtotal >= 10000 ? 0 : shippingFlat;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * taxRate * 100) / 100;
    const total = taxable + shipping + tax;

    const method = paymentMethod ?? PaymentMethodType.COD;
    const orderNumber = await nextOrderNumber();
    const invoiceNumber = await nextInvoiceNumber();
    const paymentNumber = await nextPaymentNumber();

    const customerName = session?.name ?? guestName!;
    const customerEmail = session?.email ?? guestEmail!;
    const customerPhone = guestPhone ?? null;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          guestEmail: session ? null : guestEmail,
          guestName: session ? null : guestName,
          guestPhone: session ? null : guestPhone,
          shippingAddress,
          shippingCity,
          shippingArea: shippingArea ?? null,
          shippingPostal: shippingPostal ?? null,
          status: OrderStatus.CONFIRMED,
          paymentStatus:
            method === PaymentMethodType.COD ? PaymentStatus.PENDING : PaymentStatus.PAID,
          paymentMethod: method,
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode: appliedCoupon,
          notes: notes ?? null,
          items: { create: lineItems },
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          customerName,
          customerPhone,
          customerEmail,
          subtotal,
          discount,
          tax,
          total,
          amountPaid: method === PaymentMethodType.COD ? 0 : total,
          changeDue: 0,
          paymentMethod: method,
          paymentStatus:
            method === PaymentMethodType.COD ? PaymentStatus.PENDING : PaymentStatus.PAID,
          items: {
            create: lineItems.map((l) => ({
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
          method,
          status: method === PaymentMethodType.COD ? PaymentStatus.PENDING : PaymentStatus.PAID,
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { code: appliedCoupon },
          data: { usedCount: { increment: 1 } },
        });
      }

      return { order, invoice };
    });

    for (const line of lineItems) {
      await adjustStock({
        productId: line.productId,
        delta: -line.quantity,
        type: InventoryTransactionType.ORDER,
        reference: result.order.orderNumber,
      });
    }

    return jsonOk(
      {
        orderNumber: result.order.orderNumber,
        orderId: result.order.id,
        total,
        invoiceNumber: result.invoice.invoiceNumber,
      },
      201
    );
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_STOCK") {
      return jsonError("Insufficient stock", 400);
    }
    console.error(e);
    return jsonError("Checkout failed", 500);
  }
}
