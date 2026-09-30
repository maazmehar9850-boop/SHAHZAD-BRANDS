import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      variations: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) return jsonError("Product not found", 404);
  return jsonOk(product);
}
