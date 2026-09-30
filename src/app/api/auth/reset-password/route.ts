import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const { token, password } = (await req.json()) as { token?: string; password?: string };
    if (!token || !password) return jsonError("Token and password are required", 400);
    if (password.length < 8) return jsonError("Password must be at least 8 characters", 400);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) return jsonError("Invalid or expired reset token", 400);

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpires: null,
      },
    });

    return jsonOk({ message: "Password updated successfully" });
  } catch {
    return jsonError("Reset failed", 500);
  }
}
