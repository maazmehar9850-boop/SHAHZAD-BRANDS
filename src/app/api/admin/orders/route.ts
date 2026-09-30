import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import type { OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_ORDERS);
  if (error) return error;

  const status = new URL(req.url).searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: status ? { status: status as OrderStatus } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return jsonOk(orders);
}

export async function PATCH(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_ORDERS);
  if (error) return error;

  const { id, status, paymentStatus } = await req.json();
  if (!id) return jsonError("Order id required", 400);

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
    },
  });
  return jsonOk(order);
}
