import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireStaffApi } from "@/lib/admin-auth";
import { PERMISSIONS } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      variations: true,
      reviews: { include: { user: { select: { name: true } } }, take: 10 },
    },
  });
  if (!product) return jsonError("Product not found", 404);
  return jsonOk(product);
}

export async function PUT(req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.EDIT_PRODUCTS);
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku,
        price: body.price != null ? Number(body.price) : undefined,
        salePrice: body.salePrice != null ? Number(body.salePrice) : body.salePrice === null ? null : undefined,
        costPrice: body.costPrice != null ? Number(body.costPrice) : undefined,
        stockQuantity: body.stockQuantity != null ? Number(body.stockQuantity) : undefined,
        categoryId: body.categoryId,
        brandId: body.brandId,
        description: body.description,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        isBestseller: body.isBestseller,
      },
      include: { images: true, category: true, brand: true },
    });
    return jsonOk(product);
  } catch {
    return jsonError("Update failed", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.DELETE_PRODUCTS);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return jsonOk({ deleted: true });
  } catch {
    return jsonError("Delete failed", 500);
  }
}
