import { theme } from "./theme";

export function formatMoney(amount: number): string {
  return `${theme.currencySymbol} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function productEffectivePrice(price: number, salePrice: number | null): number {
  return salePrice != null && salePrice < price ? salePrice : price;
}

export function discountPercent(price: number, salePrice: number | null): number {
  if (salePrice == null || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}
