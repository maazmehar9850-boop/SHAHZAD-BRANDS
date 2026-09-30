import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_PRODUCTS);
  if (error) return error;

  const q = new URL(req.url).searchParams.get("q");
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
          ],
        }
      : undefined,
    include: {
      images: { take: 1 },
      category: true,
      brand: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return jsonOk(products);
}
