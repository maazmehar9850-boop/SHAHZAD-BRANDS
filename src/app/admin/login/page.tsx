"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@shahzadbrands.com");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, asStaff: true }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center store-gradient px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Staff sign in</h1>
          {params.get("error") && (
            <p className="text-sm text-red-600">Staff access only. Please sign in with a staff account.</p>
          )}
        </CardHeader>
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in to admin
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-foreground/50">
            Demo: admin@shahzadbrands.com / Admin@123
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
