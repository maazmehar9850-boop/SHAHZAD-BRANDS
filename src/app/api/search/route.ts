import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-response";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return jsonOk({ products: [], categories: [] });
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: { images: { take: 1 } },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true, name: { contains: q } },
      take: 4,
    }),
  ]);

  return jsonOk({ products, categories });
}
