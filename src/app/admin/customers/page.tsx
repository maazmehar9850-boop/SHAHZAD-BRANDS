"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/format";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  _count: { orders: number };
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((json) => json.success && setCustomers(json.data));
  }, []);

  return (
    <>
      <AdminHeader title="Customers" />
      <div className="p-6">
        <DataTable
          rows={customers}
          keyFn={(c) => c.id}
          columns={[
            { key: "name", header: "Name", render: (c) => c.name },
            { key: "email", header: "Email", render: (c) => c.email },
            { key: "phone", header: "Phone", render: (c) => c.phone ?? "—" },
            { key: "orders", header: "Orders", render: (c) => c._count.orders },
            { key: "joined", header: "Joined", render: (c) => formatDate(c.createdAt) },
          ]}
        />
      </div>
    </>
  );
}
