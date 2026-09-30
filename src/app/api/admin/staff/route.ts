import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth/password";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { UserType } from "@prisma/client";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_STAFF);
  if (error) return error;

  const staff = await prisma.staffProfile.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, phone: true, status: true } },
      role: true,
    },
    orderBy: { joiningDate: "desc" },
  });
  return jsonOk(staff);
}

export async function POST(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_STAFF);
  if (error) return error;

  const body = await req.json();
  const { email, password, name, phone, employeeId, roleId } = body;
  if (!email || !password || !name || !employeeId || !roleId) {
    return jsonError("Missing required fields", 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone,
      type: UserType.STAFF,
      staffProfile: {
        create: { employeeId, roleId },
      },
    },
    include: { staffProfile: { include: { role: true } } },
  });
  return jsonOk(user, 201);
}
