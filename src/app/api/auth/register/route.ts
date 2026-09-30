import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { UserType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!email || !password || !name) {
      return jsonError("Email, password, and name are required", 400);
    }
    if (password.length < 8) {
      return jsonError("Password must be at least 8 characters", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return jsonError("Email already registered", 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: phone ?? null,
        type: UserType.CUSTOMER,
        customerProfile: { create: {} },
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      type: UserType.CUSTOMER,
    });

    return jsonOk({ id: user.id, email: user.email, name: user.name }, 201);
  } catch {
    return jsonError("Registration failed", 500);
  }
}
