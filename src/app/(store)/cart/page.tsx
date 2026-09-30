"use client";

import { StoreImage } from "@/components/store/StoreImage";
import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatMoney, productEffectivePrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const active = items.filter((i) => !i.savedForLater);
  const subtotal = cartSubtotal(items);

  if (!active.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <h1 className="mb-8 text-3xl font-bold text-[var(--color-primary)]">Shopping cart</h1>
      <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-white">
        {active.map((item) => {
          const unit = productEffectivePrice(item.price, item.salePrice);
          return (
            <li key={item.productId} className="flex gap-4 p-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-muted)]">
                <StoreImage src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <Link href={`/products/${item.slug}`} className="font-semibold hover:text-[var(--color-primary)]">
                    {item.name}
                  </Link>
                  <p className="text-sm text-foreground/50">{formatMoney(unit)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={item.maxStock}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                    className="w-16 rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                  />
                  <span className="min-w-[5rem] font-semibold">{formatMoney(unit * item.quantity)}</span>
                  <button type="button" onClick={() => removeItem(item.productId)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="text-lg">
          Subtotal: <strong>{formatMoney(subtotal)}</strong>
        </p>
        <Link href="/checkout">
          <Button size="lg">Proceed to checkout</Button>
        </Link>
      </div>
    </div>
  );
}
