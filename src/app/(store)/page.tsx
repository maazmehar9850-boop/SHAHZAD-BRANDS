import { StoreImage } from "@/components/store/StoreImage";
import Link from "next/link";
import { ArrowRight, Star, Truck, Shield, Headphones } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [banners, featured, bestsellers, testimonials, categories] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestseller: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 4,
    }),
    prisma.testimonial.findMany({ where: { isActive: true }, take: 3 }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  const hero = banners[0];

  return (
    <div>
      <section className="store-gradient relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--color-accent)]">
              New season
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              {hero?.title ?? "Premium Garments for Every Occasion"}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/85">
              {hero?.subtitle ?? "Discover Shahzad Brands — crafted fabrics, modern cuts, and timeless elegance."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90">
                  Shop now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?featured=true">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Featured picks
                </Button>
              </Link>
            </div>
          </div>
          {hero && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
              <StoreImage src={hero.image} alt={hero.title} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Nationwide delivery", text: "Flat rate shipping across Pakistan" },
            { icon: Shield, title: "Quality guaranteed", text: "Premium fabrics & careful finishing" },
            { icon: Headphones, title: "Customer care", text: "Friendly support when you need it" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4">
              <Icon className="h-8 w-8 shrink-0 text-[var(--color-accent)]" />
              <div>
                <h3 className="font-semibold text-[var(--color-primary)]">{title}</h3>
                <p className="text-sm text-foreground/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-muted)]/50 py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">Shop by category</h2>
            <Link href="/products" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-xl"
              >
                {cat.image && (
                  <StoreImage src={cat.image} alt={cat.name} fill className="object-cover transition group-hover:scale-105" sizes="33vw" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 text-xl font-bold text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <h2 className="mb-8 text-2xl font-bold text-[var(--color-primary)]">Featured collection</h2>
        <ProductGrid products={featured} />
      </section>

      {banners.length > 1 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {banners.slice(1).map((b) => (
              <Link key={b.id} href={b.link ?? "/products"} className="group relative aspect-[21/9] overflow-hidden rounded-xl">
                <StoreImage src={b.image} alt={b.title} fill className="object-cover transition group-hover:scale-105" sizes="50vw" />
                <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-6 text-white">
                  <h3 className="text-xl font-bold">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-white/90">{b.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-2xl font-bold text-[var(--color-primary)]">Bestsellers</h2>
          <ProductGrid products={bestsellers} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--color-primary)]">What customers say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <div className="mb-3 flex gap-0.5 text-[var(--color-accent)]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground/80">&ldquo;{t.content}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-[var(--color-primary)]">
                {t.name}
                {t.role && <span className="font-normal text-foreground/50"> — {t.role}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
