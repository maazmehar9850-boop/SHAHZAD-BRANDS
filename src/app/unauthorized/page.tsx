import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-[var(--color-primary)]">403</p>
      <h1 className="mt-4 text-2xl font-semibold">Unauthorized</h1>
      <p className="mt-2 text-foreground/60">You do not have permission to view this page.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="secondary">Store home</Button>
        </Link>
        <Link href="/admin/login">
          <Button>Staff login</Button>
        </Link>
      </div>
    </div>
  );
}
