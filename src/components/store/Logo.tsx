import Link from "next/link";
import { theme } from "@/lib/theme";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-[var(--color-primary-foreground)]"
        style={{ background: "var(--color-primary)" }}
      >
        SB
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-semibold tracking-tight text-[var(--color-primary)]">
          {theme.brandName}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Premium Garments
        </span>
      </span>
    </Link>
  );
}
