import { prisma } from "./db";

export type StoreSettings = {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_email: string;
  tax_rate: string;
  currency: string;
  invoice_prefix: string;
  shipping_flat: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  seo_description: string;
};

const defaults: StoreSettings = {
  store_name: "Shahzad Brands",
  store_address: "Main Boulevard, Lahore, Pakistan",
  store_phone: "+92 300 1234567",
  store_email: "hello@shahzadbrands.com",
  tax_rate: "5",
  currency: "PKR",
  invoice_prefix: "INV",
  shipping_flat: "250",
  social_facebook: "https://facebook.com/shahzadbrands",
  social_instagram: "https://instagram.com/shahzadbrands",
  social_twitter: "https://twitter.com/shahzadbrands",
  seo_description: "Premium fashion and garments by Shahzad Brands.",
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...defaults, ...map } as StoreSettings;
}

export async function getSetting(key: keyof StoreSettings): Promise<string> {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value ?? defaults[key];
}

export async function setSettings(data: Partial<StoreSettings>) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }
}
