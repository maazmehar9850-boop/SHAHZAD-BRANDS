import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-[var(--color-primary)]">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-foreground/60">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
