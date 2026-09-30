import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const { error, session } = await requireStaffApi();
  if (error) return error;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return jsonOk(notifications);
}

export async function PATCH(req: Request) {
  const { error, session } = await requireStaffApi();
  if (error) return error;

  const { id, readAll } = await req.json();
  if (readAll) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true },
    });
    return jsonOk({ updated: true });
  }
  if (!id) return jsonError("Id required", 400);

  await prisma.notification.update({
    where: { id, userId: session.userId },
    data: { read: true },
  });
  return jsonOk({ updated: true });
}
