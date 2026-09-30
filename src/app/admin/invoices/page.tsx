"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatMoney, formatDateTime } from "@/lib/format";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((json) => json.success && setInvoices(json.data));
  }, []);

  return (
    <>
      <AdminHeader title="Invoices" />
      <div className="p-6">
        <DataTable
          rows={invoices}
          keyFn={(i) => i.id}
          columns={[
            {
              key: "num",
              header: "Invoice",
              render: (i) => (
                <Link href={`/admin/invoices/${i.id}`} className="text-[var(--color-primary)] hover:underline">
                  {i.invoiceNumber}
                </Link>
              ),
            },
            { key: "customer", header: "Customer", render: (i) => i.customerName },
            { key: "total", header: "Total", render: (i) => formatMoney(i.total) },
            { key: "method", header: "Method", render: (i) => i.paymentMethod },
            { key: "date", header: "Date", render: (i) => formatDateTime(i.createdAt) },
          ]}
        />
      </div>
    </>
  );
}
