import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, invoice: true, payments: true },
  });

  if (!order) return jsonError("Order not found", 404);
  if (session.type === "CUSTOMER" && order.userId !== session.userId) {
    return jsonError("Forbidden", 403);
  }

  return jsonOk(order);
}
