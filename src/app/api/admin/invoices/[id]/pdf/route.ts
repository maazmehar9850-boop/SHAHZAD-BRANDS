import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { generateReceiptPdf } from "@/lib/pdf/receipt";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_INVOICES);
  if (error) return error;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, staff: { include: { user: { select: { name: true } } } } },
  });
  if (!invoice) return jsonError("Invoice not found", 404);

  const store = await getSettings();
  const pdfBytes = await generateReceiptPdf({
    store,
    invoiceNumber: invoice.invoiceNumber,
    date: formatDateTime(invoice.createdAt),
    cashierName: invoice.staff?.user.name,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone ?? undefined,
    lines: invoice.items.map((i) => ({
      name: i.productName,
      sku: i.sku,
      qty: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      total: i.total,
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    tax: invoice.tax,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    changeDue: invoice.changeDue,
    paymentMethod: invoice.paymentMethod,
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
