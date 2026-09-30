"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Account created!");
    router.push("/account/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Create account</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="submit" className="w-full" loading={loading}>
              Register
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground/60">
            Already have an account?{" "}
            <Link href="/account/login" className="text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
