import { prisma } from "./db";

export async function nextOrderNumber(): Promise<string> {
  const prefix = (await getSetting("order_prefix")) ?? "ORD";
  const count = await prisma.order.count();
  return `${prefix}-${String(count + 1).padStart(6, "0")}`;
}

export async function nextInvoiceNumber(): Promise<string> {
  const prefix = (await getSetting("invoice_prefix")) ?? "INV";
  const count = await prisma.invoice.count();
  return `${prefix}-${String(count + 1).padStart(6, "0")}`;
}

export async function nextPaymentNumber(): Promise<string> {
  const count = await prisma.payment.count();
  return `PAY-${String(count + 1).padStart(6, "0")}`;
}

async function getSetting(key: string) {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value;
}
