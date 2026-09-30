"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) router.push("/account/login");
        else setOrders(json.data);
      });
  }, [router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-primary)]">My orders</h1>
      {!orders.length ? (
        <p className="text-foreground/60">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/order-confirmation/${o.orderNumber}`} className="font-semibold text-[var(--color-primary)] hover:underline">
                        {o.orderNumber}
                      </Link>
                      <p className="text-sm text-foreground/50">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMoney(o.total)}</p>
                      <p className="text-xs uppercase text-foreground/50">{o.status}</p>
                    </div>
                  </div>
                  <ul className="mt-3 text-sm text-foreground/70">
                    {o.items.map((i, idx) => (
                      <li key={idx}>
                        {i.productName} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
