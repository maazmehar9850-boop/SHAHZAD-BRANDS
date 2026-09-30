"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatMoney, formatDateTime } from "@/lib/format";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string } | null;
  guestName: string | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((json) => json.success && setOrders(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Updated");
      load();
    }
  }

  return (
    <>
      <AdminHeader title="Orders" />
      <div className="p-6">
        <DataTable
          rows={orders}
          keyFn={(o) => o.id}
          columns={[
            { key: "num", header: "Order", render: (o) => o.orderNumber },
            { key: "customer", header: "Customer", render: (o) => o.user?.name ?? o.guestName ?? "—" },
            { key: "total", header: "Total", render: (o) => formatMoney(o.total) },
            { key: "status", header: "Status", render: (o) => o.status },
            { key: "pay", header: "Payment", render: (o) => o.paymentStatus },
            { key: "date", header: "Date", render: (o) => formatDateTime(o.createdAt) },
            {
              key: "act",
              header: "Actions",
              render: (o) => (
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                >
                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
