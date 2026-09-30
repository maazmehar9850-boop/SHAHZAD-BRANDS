import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireStaffApi } from "@/lib/admin-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const featured = searchParams.get("featured");
  const bestseller = searchParams.get("bestseller");
  const q = searchParams.get("q");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(48, parseInt(searchParams.get("limit") ?? "12", 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (featured === "true") where.isFeatured = true;
  if (bestseller === "true") where.isBestseller = true;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    };
  }

  let orderBy: { createdAt?: "desc" | "asc"; price?: "asc" | "desc"; name?: "asc" } = {
    createdAt: "desc",
  };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: true,
        brand: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return jsonOk({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.ADD_PRODUCTS);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      name,
      sku,
      price,
      salePrice,
      costPrice,
      stockQuantity,
      categoryId,
      brandId,
      description,
      isFeatured,
      isBestseller,
      imageUrl,
    } = body;

    if (!name || !sku || price == null) {
      return jsonError("Name, SKU, and price are required", 400);
    }

    const slug = slugify(name);
    const product = await prisma.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        sku,
        price: Number(price),
        salePrice: salePrice != null ? Number(salePrice) : null,
        costPrice: costPrice != null ? Number(costPrice) : null,
        stockQuantity: Number(stockQuantity ?? 0),
        categoryId: categoryId || null,
        brandId: brandId || null,
        description: description ?? null,
        isFeatured: !!isFeatured,
        isBestseller: !!isBestseller,
        images: imageUrl
          ? { create: [{ url: imageUrl, alt: name }] }
          : undefined,
      },
      include: { images: true },
    });

    return jsonOk(product, 201);
  } catch {
    return jsonError("Failed to create product", 500);
  }
}
