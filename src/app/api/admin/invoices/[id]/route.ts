import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_INVOICES);
  if (error) return error;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      order: true,
      staff: { include: { user: { select: { name: true } } } },
    },
  });
  if (!invoice) return jsonError("Invoice not found", 404);
  return jsonOk(invoice);
}
