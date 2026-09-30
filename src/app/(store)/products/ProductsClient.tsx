"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductCardData } from "@/components/store/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string; slug: string };
type Brand = { id: string; name: string; slug: string };

export function ProductsClient({
  initialCategories,
  initialBrands,
}: {
  initialCategories: Category[];
  initialBrands: Brand[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const q = searchParams.get("q") ?? "";
  const featured = searchParams.get("featured") ?? "";
  const bestseller = searchParams.get("bestseller") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (q) params.set("q", q);
    if (featured) params.set("featured", featured);
    if (bestseller) params.set("bestseller", bestseller);
    if (sort) params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("limit", "24");

    const res = await fetch(`/api/products?${params}`);
    const json = await res.json();
    if (json.success) {
      setProducts(json.data.items);
      setTotal(json.data.total);
    }
    setLoading(false);
  }, [category, brand, q, featured, bestseller, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/products?${p.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Shop</h1>
        <p className="text-foreground/60">{total} products</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-4 h-fit">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-foreground/50">Search</label>
            <Input
              defaultValue={q}
              placeholder="Keyword…"
              onBlur={(e) => updateParam("q", e.target.value.trim())}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-foreground/50">Category</label>
            <select
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
            >
              <option value="">All</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-foreground/50">Brand</label>
            <select
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={brand}
              onChange={(e) => updateParam("brand", e.target.value)}
            >
              <option value="">All</option>
              {initialBrands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              defaultValue={minPrice}
              onBlur={(e) => updateParam("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam("maxPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-foreground/50">Sort</label>
            <select
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/products")}
          >
            Clear filters
          </Button>
        </aside>
        <div>
          {loading ? (
            <p className="py-16 text-center text-foreground/50">Loading products…</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}
