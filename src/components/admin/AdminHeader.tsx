"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="no-print flex items-center justify-between border-b border-[var(--color-border)] bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-primary)]">{title}</h1>
        {subtitle && <p className="text-sm text-foreground/60">{subtitle}</p>}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </header>
  );
}
