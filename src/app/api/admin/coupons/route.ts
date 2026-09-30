import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_COUPONS);
  if (error) return error;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return jsonOk(coupons);
}

export async function POST(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_COUPONS);
  if (error) return error;

  const body = await req.json();
  if (!body.code || body.value == null || !body.type) {
    return jsonError("Code, type, and value required", 400);
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: String(body.code).toUpperCase(),
      type: body.type,
      value: Number(body.value),
      scope: body.scope ?? "ORDER",
      minOrder: body.minOrder != null ? Number(body.minOrder) : null,
      usageLimit: body.usageLimit != null ? Number(body.usageLimit) : null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      isActive: body.isActive ?? true,
    },
  });
  return jsonOk(coupon, 201);
}

export async function PATCH(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_COUPONS);
  if (error) return error;

  const { id, ...data } = await req.json();
  if (!id) return jsonError("Id required", 400);

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      isActive: data.isActive,
      usageLimit: data.usageLimit,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    },
  });
  return jsonOk(coupon);
}
