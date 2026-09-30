import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_CUSTOMERS);
  if (error) return error;

  const q = new URL(req.url).searchParams.get("q");
  const customers = await prisma.user.findMany({
    where: {
      type: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      addresses: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return jsonOk(customers);
}

export async function PATCH(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_CUSTOMERS);
  if (error) return error;

  const { id, name, phone, status } = await req.json();
  if (!id) return jsonError("Id required", 400);

  const user = await prisma.user.update({
    where: { id },
    data: { name, phone, status },
  });
  return jsonOk(user);
}
