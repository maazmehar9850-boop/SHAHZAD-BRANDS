import type { PaymentMethodType } from "@prisma/client";

export type PaymentMethodConfig = {
  id: PaymentMethodType;
  label: string;
  description: string;
  enabled: boolean;
  /** Gateway id for future integration (stripe, jazzcash, etc.) */
  gateway?: string;
};

const methods: PaymentMethodConfig[] = [
  { id: "COD", label: "Cash on Delivery", description: "Pay when you receive", enabled: true },
  { id: "CASH", label: "Cash", description: "In-store cash payment", enabled: true },
  { id: "CARD", label: "Card", description: "Debit/Credit card (terminal)", enabled: true, gateway: "card_terminal" },
  { id: "BANK_TRANSFER", label: "Bank Transfer", description: "Direct bank transfer", enabled: true },
  { id: "ONLINE", label: "Online Payment", description: "Payment gateway", enabled: true, gateway: "online_gateway" },
  { id: "OTHER", label: "Other", description: "Other configured method", enabled: true },
];

export function getPaymentMethods(storeOverrides?: Record<string, boolean>) {
  return methods.map((m) => ({
    ...m,
    enabled: storeOverrides?.[m.id] ?? m.enabled,
  }));
}

export function getStorefrontPaymentMethods() {
  return getPaymentMethods().filter(
    (m) => m.enabled && ["COD", "CARD", "BANK_TRANSFER", "ONLINE"].includes(m.id)
  );
}

export function getPosPaymentMethods() {
  return getPaymentMethods().filter(
    (m) => m.enabled && ["CASH", "CARD", "BANK_TRANSFER", "ONLINE", "OTHER"].includes(m.id)
  );
}

/** Placeholder for gateway integration — never store raw card data. */
export async function processGatewayPayment(_params: {
  gateway: string;
  amount: number;
  reference: string;
}): Promise<{ success: boolean; transactionRef?: string; error?: string }> {
  return { success: true, transactionRef: `GW-${Date.now()}` };
}
