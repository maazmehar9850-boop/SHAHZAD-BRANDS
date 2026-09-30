"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const reports = [
  { type: "sales", title: "Sales report", desc: "Orders and revenue (CSV)" },
  { type: "products", title: "Products report", desc: "Catalog and stock levels" },
  { type: "customers", title: "Customers report", desc: "Customer accounts and order counts" },
];

export default function ReportsPage() {
  return (
    <>
      <AdminHeader title="Reports" subtitle="Export CSV data" />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.type}>
            <CardBody>
              <h2 className="font-semibold text-[var(--color-primary)]">{r.title}</h2>
              <p className="mt-1 text-sm text-foreground/60">{r.desc}</p>
              <a href={`/api/admin/reports/${r.type}`} className="mt-4 inline-block">
                <Button variant="secondary">Download CSV</Button>
              </a>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
