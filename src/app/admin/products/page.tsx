"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreImage } from "@/components/store/StoreImage";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  images: { url: string }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((json) => json.success && setProducts(json.data));
  }, []);

  return (
    <>
      <AdminHeader title="Products" />
      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" />
              New product
            </Button>
          </Link>
        </div>
        <DataTable
          rows={products}
          keyFn={(p) => p.id}
          columns={[
            {
              key: "img",
              header: "",
              render: (p) =>
                p.images[0] ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded">
                    <StoreImage src={p.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                ) : null,
            },
            { key: "name", header: "Name", render: (p) => p.name },
            { key: "sku", header: "SKU", render: (p) => p.sku },
            { key: "price", header: "Price", render: (p) => formatMoney(p.price) },
            { key: "stock", header: "Stock", render: (p) => p.stockQuantity },
            {
              key: "actions",
              header: "",
              render: (p) => (
                <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-[var(--color-primary)] hover:underline">
                  Edit
                </Link>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
