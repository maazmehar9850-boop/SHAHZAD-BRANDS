"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatMoney } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, setCoupon, clear } = useCartStore();
  const active = items.filter((i) => !i.savedForLater);
  const subtotal = cartSubtotal(items);

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [discount, setDiscount] = useState(0);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingArea: "",
    shippingPostal: "",
    paymentMethod: "COD",
    notes: "",
  });

  useEffect(() => {
    if (!active.length) router.replace("/cart");
  }, [active.length, router]);

  async function applyCoupon() {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    setDiscount(json.data.discount);
    setCoupon(couponInput.toUpperCase());
    toast.success("Coupon applied");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: active.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: couponCode ?? undefined,
        ...form,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    clear();
    router.push(`/order-confirmation/${json.data.orderNumber}`);
  }

  const shipping = subtotal >= 10000 ? 0 : 250;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.05 * 100) / 100;
  const total = taxable + shipping + tax;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="mb-8 text-3xl font-bold text-[var(--color-primary)]">Checkout</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Shipping</h2>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Full name" required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
              <Input type="email" placeholder="Email" required value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} />
              <Input placeholder="Phone" required value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} />
              <Input placeholder="City" required value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} />
              <Input className="sm:col-span-2" placeholder="Address" required value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
              <Input placeholder="Area" value={form.shippingArea} onChange={(e) => setForm({ ...form, shippingArea: e.target.value })} />
              <Input placeholder="Postal code" value={form.shippingPostal} onChange={(e) => setForm({ ...form, shippingPostal: e.target.value })} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Payment</h2>
            </CardHeader>
            <CardBody>
              <select
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="COD">Cash on delivery</option>
                <option value="ONLINE">Online payment</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Order summary</h2>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                <Button type="button" variant="secondary" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
              <Button type="submit" className="mt-4 w-full" size="lg" loading={loading}>
                Place order
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
}
