import type { InventoryTransactionType } from "@prisma/client";
import { prisma } from "./db";

export async function adjustStock(params: {
  productId: string;
  delta: number;
  type: InventoryTransactionType;
  reason?: string;
  reference?: string;
  staffId?: string;
}) {
  const { productId, delta, type, reason, reference, staffId } = params;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
    const beforeQty = product.stockQuantity;
    const afterQty = beforeQty + delta;
    if (afterQty < 0) {
      throw new Error("INSUFFICIENT_STOCK");
    }
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: afterQty },
    });
    await tx.inventoryTransaction.create({
      data: {
        productId,
        type,
        quantity: delta,
        beforeQty,
        afterQty,
        reason,
        reference,
        staffId,
      },
    });
    return afterQty;
  });
}
