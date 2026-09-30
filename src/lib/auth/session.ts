import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserType } from "@prisma/client";

const COOKIE_NAME = "sb_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-dev-secret-min-32-characters!!"
);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  type: UserType;
  roleSlug?: string;
  permissions?: string[];
};

export async function createSession(payload: SessionPayload, maxAge = 60 * 60 * 24 * 7) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
