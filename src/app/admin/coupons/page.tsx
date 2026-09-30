"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "10", minOrder: "3000" });

  function load() {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((json) => json.success && setCoupons(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
      }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Coupon created");
      setForm({ ...form, code: "" });
      load();
    } else toast.error(json.error);
  }

  return (
    <>
      <AdminHeader title="Coupons" />
      <div className="space-y-4 p-6">
        <form onSubmit={create} className="flex flex-wrap gap-2">
          <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
          <Input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Button type="submit">Add coupon</Button>
        </form>
        <DataTable
          rows={coupons}
          keyFn={(c) => c.id}
          columns={[
            { key: "code", header: "Code", render: (c) => c.code },
            { key: "type", header: "Type", render: (c) => c.type },
            { key: "value", header: "Value", render: (c) => c.value },
            { key: "used", header: "Used", render: (c) => `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ""}` },
            { key: "active", header: "Active", render: (c) => (c.isActive ? "Yes" : "No") },
          ]}
        />
      </div>
    </>
  );
}
