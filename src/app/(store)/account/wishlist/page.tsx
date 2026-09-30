"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductCardData } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          router.push("/account/login?next=/account/wishlist");
          return;
        }
        setProducts(
          json.data.map(
            (row: { product: ProductCardData & { images: ProductCardData["images"] } }) => row.product
          )
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="p-8 text-center">Loading wishlist…</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Wishlist</h1>
        <Link href="/products">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-foreground/60">
          Your wishlist is empty.
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
