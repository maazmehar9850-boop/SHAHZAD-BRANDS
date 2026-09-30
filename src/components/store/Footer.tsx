import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-primary)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 lg:px-6">
        <div className="md:col-span-2">
          <div className="[&_span]:!text-white [&_a_span:first-child]:bg-white [&_a_span:first-child]:!text-[var(--color-primary)]">
            <Logo />
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/80">{settings.seo_description}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Shop
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            <li>
              <Link href="/products" className="hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?category=men" className="hover:text-white">
                Men
              </Link>
            </li>
            <li>
              <Link href="/products?category=women" className="hover:text-white">
                Women
              </Link>
            </li>
            <li>
              <Link href="/products?category=kids" className="hover:text-white">
                Kids
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              {settings.store_phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              {settings.store_email}
            </li>
            <li>{settings.store_address}</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href={settings.social_facebook} className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={settings.social_instagram} className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Shahzad Brands. All rights reserved.
      </div>
    </footer>
  );
}
