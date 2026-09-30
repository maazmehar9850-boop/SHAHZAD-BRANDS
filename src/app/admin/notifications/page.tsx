"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  function load() {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((json) => json.success && setItems(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readAll: true }),
    });
    load();
  }

  return (
    <>
      <AdminHeader title="Notifications" />
      <div className="p-6">
        <Button variant="secondary" className="mb-4" onClick={markAllRead}>
          Mark all read
        </Button>
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${n.read ? "bg-white opacity-70" : "border-[var(--color-accent)] bg-white"}`}
            >
              <div className="flex justify-between gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                <span className="text-xs text-foreground/50">{formatDateTime(n.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/70">{n.message}</p>
              {n.link && (
                <a href={n.link} className="mt-2 inline-block text-sm text-[var(--color-primary)] hover:underline">
                  View →
                </a>
              )}
            </li>
          ))}
          {!items.length && <p className="text-foreground/50">No notifications</p>}
        </ul>
      </div>
    </>
  );
}
