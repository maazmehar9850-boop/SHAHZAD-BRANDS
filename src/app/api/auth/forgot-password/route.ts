import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) return jsonError("Email is required", 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetExpires },
      });
    }

    return jsonOk({
      message: "If an account exists, a reset link has been sent.",
      devToken: user ? undefined : undefined,
    });
  } catch {
    return jsonError("Request failed", 500);
  }
}
