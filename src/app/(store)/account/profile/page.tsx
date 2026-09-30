"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type User = { name: string; email: string; phone: string | null };
type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrForm, setAddrForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) router.push("/account/login");
        else setUser(json.data);
      });
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAddresses(json.data);
      });
  }, [router]);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addrForm, isDefault: addresses.length === 0 }),
    });
    const json = await res.json();
    if (json.success) {
      setAddresses((a) => [...a, json.data]);
      setAddrForm({ fullName: "", phone: "", address: "", city: "" });
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account/login");
  }

  if (!user) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">My account</h1>
        </CardHeader>
        <CardBody className="space-y-3">
          <p>
            <span className="text-foreground/50">Name:</span> {user.name}
          </p>
          <p>
            <span className="text-foreground/50">Email:</span> {user.email}
          </p>
          {user.phone && (
            <p>
              <span className="text-foreground/50">Phone:</span> {user.phone}
            </p>
          )}
          <Link href="/account/orders">
            <Button variant="secondary" className="w-full">
              My orders
            </Button>
          </Link>
          <Link href="/account/wishlist">
            <Button variant="secondary" className="w-full">
              Wishlist
            </Button>
          </Link>
          {addresses.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-semibold">Saved addresses</p>
              {addresses.map((a) => (
                <p key={a.id} className="rounded-lg bg-[var(--color-muted)] p-3 text-sm">
                  {a.fullName} · {a.phone}
                  <br />
                  {a.address}, {a.city}
                </p>
              ))}
            </div>
          )}
          <form onSubmit={saveAddress} className="space-y-2 border-t pt-4">
            <p className="text-sm font-semibold">Add address</p>
            <Input placeholder="Full name" required value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
            <Input placeholder="Phone" required value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
            <Input placeholder="Address" required value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
            <Input placeholder="City" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
            <Button type="submit" variant="outline" className="w-full">
              Save address
            </Button>
          </form>
          <Button type="button" variant="outline" className="w-full" onClick={logout}>
            Sign out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
