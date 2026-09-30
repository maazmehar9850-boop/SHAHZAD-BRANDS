import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") return jsonError("Unauthorized", 401);
  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return jsonOk(addresses);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") return jsonError("Unauthorized", 401);
  const body = await req.json();
  const { label, fullName, phone, address, city, area, postalCode, isDefault } = body as {
    label?: string;
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    area?: string;
    postalCode?: string;
    isDefault?: boolean;
  };
  if (!fullName || !phone || !address || !city) {
    return jsonError("Required fields missing", 400);
  }
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.userId },
      data: { isDefault: false },
    });
  }
  const created = await prisma.address.create({
    data: {
      userId: session.userId,
      label: label ?? "Home",
      fullName,
      phone,
      address,
      city,
      area,
      postalCode,
      isDefault: !!isDefault,
    },
  });
  return jsonOk(created, 201);
}
