"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "0",
    categoryId: "",
    brandId: "",
    description: "",
    imageUrl: "/images/products/product-01.jpg",
  });

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/brands")]).then(async ([c, b]) => {
      const cj = await c.json();
      const bj = await b.json();
      if (cj.success) setCategories(cj.data);
      if (bj.success) setBrands(bj.data);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity),
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Product created");
    router.push("/admin/products");
  }

  return (
    <>
      <AdminHeader title="New product" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Input className="sm:col-span-2" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <Input type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Input type="number" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              <Input type="number" placeholder="Stock" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
              <select className="rounded-lg border px-3 py-2 text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select className="rounded-lg border px-3 py-2 text-sm" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                <option value="">Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <Input className="sm:col-span-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <textarea className="sm:col-span-2 min-h-[100px] rounded-lg border px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button type="submit" loading={loading}>Save product</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
