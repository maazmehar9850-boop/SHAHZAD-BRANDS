"use client";

import { StoreImage } from "./StoreImage";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/image-paths";
import Link from "next/link";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatMoney, productEffectivePrice, discountPercent } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ProductQuickView } from "./ProductQuickView";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  images: { url: string; alt: string | null }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quickOpen, setQuickOpen] = useState(false);
  const unit = productEffectivePrice(product.price, product.salePrice);
  const pct = discountPercent(product.price, product.salePrice);
  const img = product.images[0]?.url ?? DEFAULT_PRODUCT_IMAGE;

  function addToCart() {
    if (product.stockQuantity < 1) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: img,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      maxStock: product.stockQuantity,
      quantity: 1,
    });
    toast.success("Added to cart");
  }

  async function toggleWishlist() {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error("Sign in to save items to your wishlist");
      return;
    }
    toast.success("Added to wishlist");
  }

  return (
    <>
      <article className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-lg">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-muted)]">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <StoreImage
              src={img}
              alt={product.images[0]?.alt ?? product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          </Link>
          {pct > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold">
              -{pct}%
            </span>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={toggleWishlist}
              className="rounded-full bg-white/95 p-2 shadow hover:bg-white"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="rounded-full bg-white/95 p-2 shadow hover:bg-white"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-[var(--color-primary)]">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-[var(--color-primary)]">{formatMoney(unit)}</span>
              {pct > 0 && (
                <span className="ml-2 text-xs text-foreground/50 line-through">
                  {formatMoney(product.price)}
                </span>
              )}
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={addToCart} aria-label="Add to cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>
      {quickOpen && (
        <ProductQuickView product={product} onClose={() => setQuickOpen(false)} onAddToCart={addToCart} />
      )}
    </>
  );
}
