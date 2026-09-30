import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { adjustStock } from "@/lib/inventory";
import { InventoryTransactionType } from "@prisma/client";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_INVENTORY);
  if (error) return error;

  const [products, recentTx] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.inventoryTransaction.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, sku: true } } },
    }),
  ]);

  return jsonOk({ products, recentTx });
}

export async function POST(req: Request) {
  const { error, session } = await requireStaffApi(PERMISSIONS.MANAGE_INVENTORY);
  if (error) return error;

  const { productId, delta, reason } = await req.json();
  if (!productId || delta == null) return jsonError("productId and delta required", 400);

  const staff = await prisma.staffProfile.findUnique({ where: { userId: session.userId } });

  try {
    const afterQty = await adjustStock({
      productId,
      delta: Number(delta),
      type: InventoryTransactionType.ADJUSTMENT,
      reason: reason ?? "Manual adjustment",
      staffId: staff?.id,
    });
    return jsonOk({ afterQty });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_STOCK") {
      return jsonError("Would result in negative stock", 400);
    }
    return jsonError("Adjustment failed", 500);
  }
}
