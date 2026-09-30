"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "",
    isActive: true,
    description: "",
  });

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const p = json.data;
          setForm({
            name: p.name,
            sku: p.sku,
            price: String(p.price),
            salePrice: p.salePrice != null ? String(p.salePrice) : "",
            stockQuantity: String(p.stockQuantity),
            isActive: p.isActive,
            description: p.description ?? "",
          });
        }
      });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity),
        isActive: form.isActive,
        description: form.description,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Saved");
    router.push("/admin/products");
  }

  return (
    <>
      <AdminHeader title="Edit product" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Input className="sm:col-span-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Input type="number" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <textarea className="sm:col-span-2 min-h-[100px] rounded-lg border px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button type="submit" loading={loading}>Update</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
