import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

type Params = { params: Promise<{ type: string }> };

function csvEscape(val: unknown) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireStaffApi(PERMISSIONS.VIEW_REPORTS);
  if (error) return error;

  const { type } = await params;
  let csv = "";
  let filename = "report.csv";

  if (type === "sales") {
    filename = "sales-report.csv";
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    csv = ["Order Number,Date,Status,Payment,Subtotal,Discount,Tax,Total"]
      .concat(
        orders.map((o) =>
          [
            o.orderNumber,
            o.createdAt.toISOString(),
            o.status,
            o.paymentStatus,
            o.subtotal,
            o.discount,
            o.tax,
            o.total,
          ]
            .map(csvEscape)
            .join(",")
        )
      )
      .join("\n");
  } else if (type === "products") {
    filename = "products-report.csv";
    const products = await prisma.product.findMany({ include: { category: true, brand: true } });
    csv = ["SKU,Name,Category,Brand,Price,Stock,Active"]
      .concat(
        products.map((p) =>
          [
            p.sku,
            p.name,
            p.category?.name ?? "",
            p.brand?.name ?? "",
            p.price,
            p.stockQuantity,
            p.isActive,
          ]
            .map(csvEscape)
            .join(",")
        )
      )
      .join("\n");
  } else if (type === "customers") {
    filename = "customers-report.csv";
    const users = await prisma.user.findMany({
      where: { type: "CUSTOMER" },
      include: { _count: { select: { orders: true } } },
    });
    csv = ["Name,Email,Phone,Orders,Joined"]
      .concat(
        users.map((u) =>
          [u.name, u.email, u.phone ?? "", u._count.orders, u.createdAt.toISOString()]
            .map(csvEscape)
            .join(",")
        )
      )
      .join("\n");
  } else {
    return jsonError("Unknown report type", 400);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
