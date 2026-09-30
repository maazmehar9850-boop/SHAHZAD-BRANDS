"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCartStore } from "@/stores/cart-store";
import { Input } from "@/components/ui/input";

const nav = [
  { href: "/products", label: "Shop" },
  { href: "/products?featured=true", label: "Featured" },
  { href: "/products?bestseller=true", label: "Bestsellers" },
];

export function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const items = useCartStore((s) => s.items);
  const count = items.filter((i) => !i.savedForLater).reduce((n, i) => n + i.quantity, 0);

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-[var(--color-primary)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 items-center gap-2 sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
        </form>
        <div className="flex items-center gap-2">
          <Link
            href="/account/wishlist"
            className="rounded-lg p-2 text-foreground/70 hover:bg-[var(--color-muted)]"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/account/profile"
            className="rounded-lg p-2 text-foreground/70 hover:bg-[var(--color-muted)]"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-foreground/70 hover:bg-[var(--color-muted)]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-[var(--color-accent-foreground)]">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 md:hidden">
          <form onSubmit={search} className="mb-3">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </form>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
