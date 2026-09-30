"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string; slug: string; isActive: boolean; _count?: { products: number } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => json.success && setCategories(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Category added");
      setName("");
      load();
    } else toast.error(json.error);
  }

  return (
    <>
      <AdminHeader title="Categories" />
      <div className="space-y-4 p-6">
        <form onSubmit={add} className="flex max-w-md gap-2">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit">Add</Button>
        </form>
        <DataTable
          rows={categories}
          keyFn={(c) => c.id}
          columns={[
            { key: "name", header: "Name", render: (c) => c.name },
            { key: "slug", header: "Slug", render: (c) => c.slug },
            { key: "count", header: "Products", render: (c) => c._count?.products ?? 0 },
          ]}
        />
      </div>
    </>
  );
}
