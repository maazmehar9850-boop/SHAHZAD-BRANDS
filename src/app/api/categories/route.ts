import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireStaffApi } from "@/lib/admin-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { children: { where: { isActive: true } }, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return jsonOk(categories);
}

export async function POST(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.EDIT_PRODUCTS);
  if (error) return error;

  const body = await req.json();
  if (!body.name) return jsonError("Name required", 400);

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug ?? slugify(body.name),
      description: body.description,
      image: body.image,
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  });
  return jsonOk(category, 201);
}
