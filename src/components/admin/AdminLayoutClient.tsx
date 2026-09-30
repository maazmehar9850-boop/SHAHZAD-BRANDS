"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
