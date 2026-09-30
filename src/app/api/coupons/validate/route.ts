import { validateCoupon } from "@/lib/coupons";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(req: Request) {
  const { code, subtotal } = (await req.json()) as { code?: string; subtotal?: number };
  if (!code || subtotal == null) return jsonError("Code and subtotal required", 400);

  const result = await validateCoupon(code, Number(subtotal));
  if (!result.valid) return jsonError(result.error, 400);

  return jsonOk({
    code: result.coupon.code,
    discount: result.discount,
    type: result.type,
  });
}
