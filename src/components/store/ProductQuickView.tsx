"use client";

import { StoreImage } from "./StoreImage";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/image-paths";
import Link from "next/link";
import { X } from "lucide-react";
import { formatMoney, productEffectivePrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "./ProductCard";

type Props = {
  product: ProductCardData;
  onClose: () => void;
  onAddToCart: () => void;
};

export function ProductQuickView({ product, onClose, onAddToCart }: Props) {
  const img = product.images[0]?.url ?? DEFAULT_PRODUCT_IMAGE;
  const unit = productEffectivePrice(product.price, product.salePrice);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 grid max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white shadow-2xl md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-1 shadow"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-square bg-[var(--color-muted)]">
          <StoreImage src={img} alt={product.name} fill className="object-cover" sizes="400px" />
        </div>
        <div className="flex flex-col p-6">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{product.name}</h2>
          <p className="mt-1 text-sm text-foreground/50">SKU: {product.sku}</p>
          <p className="mt-4 text-2xl font-bold">{formatMoney(unit)}</p>
          <p className="mt-2 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="text-green-700">In stock ({product.stockQuantity})</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button type="button" onClick={onAddToCart} disabled={product.stockQuantity < 1}>
              Add to cart
            </Button>
            <Link href={`/products/${product.slug}`}>
              <Button variant="outline" className="w-full">
                View full details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
