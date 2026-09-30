import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_REPORTS);
  if (error) {
    const fallback = await requireStaffApi(PERMISSIONS.VIEW_ORDERS);
    if (fallback.error) return fallback.error;
  }

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    orderCount,
    revenueAgg,
    customerCount,
    productCount,
    lowStock,
    recentOrders,
    salesByDay,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startMonth }, paymentStatus: { not: "FAILED" } },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { type: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      take: 8,
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: days30 } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const chartMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    chartMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of salesByDay) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (chartMap.has(key)) {
      chartMap.set(key, (chartMap.get(key) ?? 0) + row.total);
    }
  }
  const salesChart = Array.from(chartMap.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }));

  return jsonOk({
    stats: {
      ordersThisMonth: orderCount,
      revenueThisMonth: revenueAgg._sum.total ?? 0,
      customers: customerCount,
      products: productCount,
    },
    lowStock,
    recentOrders,
    salesChart,
  });
}
