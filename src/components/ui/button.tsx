import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 shadow-sm",
  secondary: "bg-[var(--color-surface)] text-foreground border border-[var(--color-border)] hover:bg-[var(--color-muted)]",
  outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-muted)]",
  ghost: "hover:bg-[var(--color-muted)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
