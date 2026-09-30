"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { formatMoney, formatDateTime } from "@/lib/format";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  changeDue: number;
  paymentMethod: string;
  createdAt: string;
  items: { productName: string; sku: string; quantity: number; unitPrice: number; total: number }[];
  staff: { user: { name: string } } | null;
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [storeName, setStoreName] = useState("Shahzad Brands");

  useEffect(() => {
    fetch(`/api/admin/invoices/${id}`)
      .then((r) => r.json())
      .then((json) => json.success && setInvoice(json.data));
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => json.success && setStoreName(json.data.store_name));
  }, [id]);

  if (!invoice) return <p className="p-6">Loading…</p>;

  return (
    <>
      <AdminHeader title={`Invoice ${invoice.invoiceNumber}`} />
      <div className="no-print flex gap-2 p-6 pb-0">
        <Button type="button" onClick={() => window.print()}>Print</Button>
        <a href={`/api/admin/invoices/${id}/pdf`} target="_blank" rel="noreferrer">
          <Button variant="secondary">Download PDF</Button>
        </a>
      </div>
      <div className="print-receipt mx-auto max-w-lg p-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-center text-xl font-bold text-[var(--color-primary)]">{storeName}</h2>
          <p className="text-center text-sm text-foreground/60">{formatDateTime(invoice.createdAt)}</p>
          <p className="mt-4 text-sm">
            <strong>Invoice:</strong> {invoice.invoiceNumber}
          </p>
          <p className="text-sm">
            <strong>Customer:</strong> {invoice.customerName}
            {invoice.customerPhone && ` (${invoice.customerPhone})`}
          </p>
          {invoice.staff && (
            <p className="text-sm">
              <strong>Cashier:</strong> {invoice.staff.user.name}
            </p>
          )}
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left">Item</th>
                <th className="py-1 text-right">Qty</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-dashed">
                  <td className="py-2">
                    {item.productName}
                    <span className="block text-xs text-foreground/50">{item.sku}</span>
                  </td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatMoney(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatMoney(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatMoney(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatMoney(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid ({invoice.paymentMethod})</span>
              <span>{formatMoney(invoice.amountPaid)}</span>
            </div>
            {invoice.changeDue > 0 && (
              <div className="flex justify-between">
                <span>Change</span>
                <span>{formatMoney(invoice.changeDue)}</span>
              </div>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-[var(--color-accent)]">Thank you for shopping with us!</p>
        </div>
      </div>
    </>
  );
}
