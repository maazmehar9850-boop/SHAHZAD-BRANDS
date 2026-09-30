"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Warehouse,
  Ticket,
  Receipt,
  RotateCcw,
  BarChart3,
  Settings,
  Bell,
  Wallet,
  UserCog,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/pos", label: "POS", icon: Monitor },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-white">
      <div className="border-b border-[var(--color-border)] px-4 py-5">
        <Link href="/admin" className="text-lg font-bold text-[var(--color-primary)]">
          Shahzad Admin
        </Link>
        <p className="text-xs text-foreground/50">Back office</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-foreground/70 hover:bg-[var(--color-muted)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-[var(--color-border)] p-3">
        <Link href="/" className="text-xs text-[var(--color-primary)] hover:underline">
          ← View store
        </Link>
      </div>
    </aside>
  );
}
