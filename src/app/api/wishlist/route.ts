import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") {
    return jsonError("Sign in required", 401);
  }
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(items);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") {
    return jsonError("Sign in required", 401);
  }
  const { productId } = (await req.json()) as { productId?: string };
  if (!productId) return jsonError("productId required", 400);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.isActive) return jsonError("Product not found", 404);

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    create: { userId: session.userId, productId },
    update: {},
  });
  return jsonOk({ added: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.type !== "CUSTOMER") {
    return jsonError("Sign in required", 401);
  }
  const { productId } = (await req.json()) as { productId?: string };
  if (!productId) return jsonError("productId required", 400);

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.userId, productId },
  });
  return jsonOk({ removed: true });
}
