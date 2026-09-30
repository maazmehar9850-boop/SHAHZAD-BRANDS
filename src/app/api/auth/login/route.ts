import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { resolveStaffSession } from "@/lib/auth/staff-session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { UserType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, asStaff } = body as {
      email?: string;
      password?: string;
      asStaff?: boolean;
    };

    if (!email || !password) {
      return jsonError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.status !== "ACTIVE") {
      return jsonError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return jsonError("Invalid credentials", 401);

    if (asStaff) {
      if (user.type !== UserType.STAFF) {
        return jsonError("Staff account required", 403);
      }
      const staff = await resolveStaffSession(user.id);
      if (!staff) return jsonError("Staff profile not found", 403);

      await createSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        type: UserType.STAFF,
        roleSlug: staff.roleSlug,
        permissions: staff.permissions,
      });

      return jsonOk({
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        roleSlug: staff.roleSlug,
        permissions: staff.permissions,
      });
    }

    if (user.type === UserType.STAFF) {
      return jsonError("Use admin login for staff accounts", 403);
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      type: UserType.CUSTOMER,
    });

    return jsonOk({ id: user.id, email: user.email, name: user.name, type: user.type });
  } catch {
    return jsonError("Login failed", 500);
  }
}
