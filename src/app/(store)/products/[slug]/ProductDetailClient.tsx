"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatMoney, productEffectivePrice, discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/components/store/ProductCard";

export function ProductDetailClient({
  product,
}: {
  product: ProductCardData & { description: string | null };
}) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const unit = productEffectivePrice(product.price, product.salePrice);
  const pct = discountPercent(product.price, product.salePrice);
  const img = product.images[0]?.url ?? "";

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
      quantity: qty,
    });
    toast.success("Added to cart");
  }

  return (
    <div>
      <p className="text-sm text-foreground/50">SKU: {product.sku}</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{product.name}</h1>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-bold">{formatMoney(unit)}</span>
        {pct > 0 && (
          <>
            <span className="text-lg text-foreground/40 line-through">{formatMoney(product.price)}</span>
            <span className="rounded bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold">Save {pct}%</span>
          </>
        )}
      </div>
      {product.description && (
        <p className="mt-6 text-foreground/75 leading-relaxed">{product.description}</p>
      )}
      <p className="mt-4 text-sm">
        {product.stockQuantity > 0 ? (
          <span className="text-green-700">{product.stockQuantity} in stock</span>
        ) : (
          <span className="text-red-600">Out of stock</span>
        )}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-lg border border-[var(--color-border)]">
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center">{qty}</span>
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => Math.min(product.stockQuantity, n + 1))}
          >
            +
          </button>
        </div>
        <Button size="lg" onClick={addToCart} disabled={product.stockQuantity < 1}>
          Add to cart
        </Button>
      </div>
    </div>
  );
}
