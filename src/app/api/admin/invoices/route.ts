import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_INVOICES);
  if (error) return error;

  const q = new URL(req.url).searchParams.get("q");
  const invoices = await prisma.invoice.findMany({
    where: q
      ? {
          OR: [
            { invoiceNumber: { contains: q } },
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
          ],
        }
      : undefined,
    include: { items: true, staff: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return jsonOk(invoices);
}
