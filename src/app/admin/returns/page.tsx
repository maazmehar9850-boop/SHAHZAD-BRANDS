"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatMoney, formatDateTime } from "@/lib/format";

type ReturnRow = {
  id: string;
  status: string;
  reason: string;
  refundAmount: number;
  createdAt: string;
  order: { orderNumber: string } | null;
};

export default function ReturnsPage() {
  const [rows, setRows] = useState<ReturnRow[]>([]);

  function load() {
    fetch("/api/admin/returns")
      .then((r) => r.json())
      .then((json) => json.success && setRows(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/returns", {
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
      <AdminHeader title="Returns" />
      <div className="p-6">
        <DataTable
          rows={rows}
          keyFn={(r) => r.id}
          columns={[
            { key: "order", header: "Order", render: (r) => r.order?.orderNumber ?? "—" },
            { key: "reason", header: "Reason", render: (r) => r.reason },
            { key: "refund", header: "Refund", render: (r) => formatMoney(r.refundAmount) },
            { key: "status", header: "Status", render: (r) => r.status },
            { key: "date", header: "Date", render: (r) => formatDateTime(r.createdAt) },
            {
              key: "act",
              header: "Actions",
              render: (r) => (
                <select className="rounded border text-xs" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {["PENDING", "APPROVED", "REJECTED", "REFUNDED"].map((s) => (
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
