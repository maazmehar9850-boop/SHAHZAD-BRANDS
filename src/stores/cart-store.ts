"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  sku: string;
  price: number;
  salePrice: number | null;
  quantity: number;
  maxStock: number;
  savedForLater?: boolean;
};

type CartState = {
  items: CartLine[];
  couponCode: string | null;
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  toggleSaveForLater: (productId: string) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      addItem: (item) => {
        const qty = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const nextQty = Math.min(existing.quantity + qty, item.maxStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: nextQty } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(qty, item.maxStock) }],
          };
        });
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),
      toggleSaveForLater: (productId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, savedForLater: !i.savedForLater } : i
          ),
        })),
      setCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ items: [], couponCode: null }),
    }),
    { name: "shahzad-cart" }
  )
);

export function cartSubtotal(items: CartLine[]) {
  return items
    .filter((i) => !i.savedForLater)
    .reduce((sum, i) => {
      const unit = i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price;
      return sum + unit * i.quantity;
    }, 0);
}
