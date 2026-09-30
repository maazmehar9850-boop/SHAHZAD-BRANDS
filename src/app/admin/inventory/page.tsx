"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Product = { id: string; name: string; sku: string; stockQuantity: number; lowStockThreshold: number };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjust, setAdjust] = useState<{ productId: string; delta: string; reason: string }>({
    productId: "",
    delta: "",
    reason: "",
  });

  function load() {
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((json) => json.success && setProducts(json.data.products));
  }

  useEffect(() => {
    load();
  }, []);

  async function submitAdjust(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: adjust.productId,
        delta: Number(adjust.delta),
        reason: adjust.reason,
      }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Stock updated");
      load();
    } else toast.error(json.error);
  }

  return (
    <>
      <AdminHeader title="Inventory" />
      <div className="space-y-6 p-6">
        <form onSubmit={submitAdjust} className="flex flex-wrap items-end gap-2 rounded-xl border bg-white p-4">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={adjust.productId}
            onChange={(e) => setAdjust({ ...adjust, productId: e.target.value })}
            required
          >
            <option value="">Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
          <Input type="number" placeholder="Delta (+/-)" className="w-28" value={adjust.delta} onChange={(e) => setAdjust({ ...adjust, delta: e.target.value })} required />
          <Input placeholder="Reason" className="flex-1 min-w-[160px]" value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} />
          <Button type="submit">Adjust</Button>
        </form>
        <DataTable
          rows={products}
          keyFn={(p) => p.id}
          columns={[
            { key: "sku", header: "SKU", render: (p) => p.sku },
            { key: "name", header: "Product", render: (p) => p.name },
            {
              key: "stock",
              header: "Stock",
              render: (p) => (
                <span className={p.stockQuantity <= p.lowStockThreshold ? "font-bold text-red-600" : ""}>
                  {p.stockQuantity}
                </span>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
