import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireStaffApi } from "@/lib/admin-auth";
import { PERMISSIONS } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.EDIT_PRODUCTS);
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      image: body.image,
      parentId: body.parentId,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    },
  });
  return jsonOk(category);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.EDIT_PRODUCTS);
  if (error) return error;
  const { id } = await params;
  await prisma.category.update({ where: { id }, data: { isActive: false } });
  return jsonOk({ deleted: true });
}
