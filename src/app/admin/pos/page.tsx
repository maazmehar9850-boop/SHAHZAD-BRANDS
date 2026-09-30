"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMoney, productEffectivePrice } from "@/lib/format";
import { Search, Trash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
};

type Line = { productId: string; name: string; sku: string; unitPrice: number; quantity: number; max: number };

export default function PosPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/admin/products?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((json) => json.success && setResults(json.data));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function addProduct(p: Product) {
    const unit = productEffectivePrice(p.price, p.salePrice);
    setLines((prev) => {
      const ex = prev.find((l) => l.productId === p.id);
      if (ex) {
        return prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: Math.min(l.quantity + 1, l.max) }
            : l
        );
      }
      return [...prev, { productId: p.id, name: p.name, sku: p.sku, unitPrice: unit, quantity: 1, max: p.stockQuantity }];
    });
    setQ("");
    setResults([]);
  }

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const discountAmt = Math.min(Number(discount) || 0, subtotal);
  const tax = Math.round((subtotal - discountAmt) * 0.05 * 100) / 100;
  const total = subtotal - discountAmt + tax;

  async function completeSale() {
    if (!lines.length) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        customerName,
        customerPhone,
        paymentMethod,
        amountPaid: Number(amountPaid || total),
        discount: discountAmt,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(`Sale complete — ${json.data.invoiceNumber}`);
    if (json.data.changeDue > 0) toast(`Change: ${formatMoney(json.data.changeDue)}`);
    setLines([]);
    setAmountPaid("");
    window.open(`/admin/invoices/${json.data.invoiceId}`, "_blank");
  }

  return (
    <>
      <AdminHeader title="Point of Sale" subtitle="In-store billing" />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <Input className="pl-9" placeholder="Search SKU or name…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {results.length > 0 && (
            <ul className="max-h-48 overflow-auto rounded-lg border bg-white">
              {results.map((p) => (
                <li key={p.id}>
                  <button type="button" className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]" onClick={() => addProduct(p)}>
                    <span>{p.name}</span>
                    <span>{formatMoney(productEffectivePrice(p.price, p.salePrice))}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ul className="divide-y rounded-xl border bg-white">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center justify-between gap-2 p-3 text-sm">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-foreground/50">{formatMoney(l.unitPrice)} × {l.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={l.max}
                    value={l.quantity}
                    className="w-14 rounded border px-1"
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10) || 1;
                      setLines((prev) =>
                        prev.map((x) =>
                          x.productId === l.productId ? { ...x, quantity: Math.min(qty, x.max) } : x
                        )
                      );
                    }}
                  />
                  <button type="button" onClick={() => setLines((prev) => prev.filter((x) => x.productId !== l.productId))}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </li>
            ))}
            {!lines.length && <li className="p-6 text-center text-foreground/50">Scan or search products</li>}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>
          <Input type="number" placeholder="Discount (PKR)" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatMoney(tax)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatMoney(total)}</span></div>
          </div>
          <Input type="number" placeholder="Amount paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          <Button className="w-full" size="lg" loading={loading} onClick={completeSale}>
            Complete sale
          </Button>
        </div>
      </div>
    </>
  );
}
