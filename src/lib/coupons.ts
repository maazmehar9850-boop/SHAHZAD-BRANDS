import { prisma } from "./db";
import type { DiscountType } from "@prisma/client";

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.isActive) return { valid: false as const, error: "Invalid coupon" };
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false as const, error: "Coupon not active yet" };
  if (coupon.endsAt && coupon.endsAt < now) return { valid: false as const, error: "Coupon expired" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false as const, error: "Coupon usage limit reached" };
  }
  if (coupon.minOrder != null && subtotal < coupon.minOrder) {
    return { valid: false as const, error: `Minimum order ${coupon.minOrder} required` };
  }

  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, subtotal);

  return {
    valid: true as const,
    coupon,
    discount,
    type: coupon.type as DiscountType,
  };
}
