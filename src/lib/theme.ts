/** Central brand theme — update CSS variables in globals.css to rebrand. */
export const theme = {
  brandName: process.env.NEXT_PUBLIC_STORE_NAME ?? "Shahzad Brands",
  colors: {
    primary: "var(--color-primary)",
    primaryForeground: "var(--color-primary-foreground)",
    accent: "var(--color-accent)",
    muted: "var(--color-muted)",
    border: "var(--color-border)",
    surface: "var(--color-surface)",
  },
  currency: "PKR",
  currencySymbol: "Rs.",
} as const;
