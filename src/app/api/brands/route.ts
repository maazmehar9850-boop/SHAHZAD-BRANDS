import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-response";

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return jsonOk(brands);
}
