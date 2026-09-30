"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, asStaff: false }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Welcome back!");
    router.push("/account/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Sign in</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground/60">
            No account?{" "}
            <Link href="/account/register" className="text-[var(--color-primary)] hover:underline">
              Register
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
