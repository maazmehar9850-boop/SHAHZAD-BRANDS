import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import type { ReturnStatus } from "@prisma/client";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_RETURNS);
  if (error) return error;

  const returns = await prisma.returnRequest.findMany({
    include: {
      items: { include: { product: { select: { name: true, sku: true } } } },
      order: { select: { orderNumber: true } },
      invoice: { select: { invoiceNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(returns);
}

export async function POST(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_RETURNS);
  if (error) return error;

  const { orderId, invoiceId, reason, items, refundAmount } = await req.json();
  if (!reason || !items?.length) return jsonError("Reason and items required", 400);

  const ret = await prisma.returnRequest.create({
    data: {
      orderId: orderId ?? null,
      invoiceId: invoiceId ?? null,
      reason,
      refundAmount: Number(refundAmount ?? 0),
      items: {
        create: items.map((i: { productId: string; quantity: number }) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });
  return jsonOk(ret, 201);
}

export async function PATCH(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_RETURNS);
  if (error) return error;

  const { id, status } = await req.json() as { id?: string; status?: ReturnStatus };
  if (!id || !status) return jsonError("Id and status required", 400);

  const ret = await prisma.returnRequest.update({
    where: { id },
    data: { status },
  });
  return jsonOk(ret);
}
