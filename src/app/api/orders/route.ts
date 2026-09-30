import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") {
    return jsonError("Unauthorized", 401);
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(orders);
}
