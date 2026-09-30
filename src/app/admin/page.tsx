"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable } from "@/components/admin/DataTable";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";

type Dashboard = {
  stats: {
    ordersThisMonth: number;
    revenueThisMonth: number;
    customers: number;
    products: number;
  };
  salesChart: { date: string; revenue: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string } | null;
  }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      });
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Overview of store performance" />
      <div className="space-y-6 p-6">
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Orders this month" value={data.stats.ordersThisMonth} icon={ShoppingCart} />
              <StatCard label="Revenue this month" value={formatMoney(data.stats.revenueThisMonth)} icon={DollarSign} />
              <StatCard label="Customers" value={data.stats.customers} icon={Users} />
              <StatCard label="Active products" value={data.stats.products} icon={Package} />
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <h2 className="mb-4 font-semibold text-[var(--color-primary)]">Sales (30 days)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#1e3a5f" fill="#c9a227" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h2 className="mb-3 font-semibold text-[var(--color-primary)]">Recent orders</h2>
              <DataTable
                rows={data.recentOrders}
                keyFn={(o) => o.id}
                columns={[
                  { key: "num", header: "Order", render: (o) => o.orderNumber },
                  {
                    key: "customer",
                    header: "Customer",
                    render: (o) => o.user?.name ?? "Guest",
                  },
                  { key: "total", header: "Total", render: (o) => formatMoney(o.total) },
                  { key: "status", header: "Status", render: (o) => o.status },
                  {
                    key: "date",
                    header: "Date",
                    render: (o) => formatDateTime(o.createdAt),
                  },
                ]}
              />
            </div>
          </>
        )}
        {!data && <p className="text-foreground/50">Loading dashboard…</p>}
      </div>
    </>
  );
}
