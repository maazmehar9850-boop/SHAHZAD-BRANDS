import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Not authenticated", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      type: true,
      addresses: { orderBy: { isDefault: "desc" } },
    },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonOk({
    ...user,
    roleSlug: session.roleSlug,
    permissions: session.permissions,
  });
}
