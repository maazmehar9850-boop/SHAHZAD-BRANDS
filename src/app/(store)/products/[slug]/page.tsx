import { StoreImage } from "@/components/store/StoreImage";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/image-paths";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "./ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, isActive: true } });
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true },
  });
  if (!product) notFound();

  const mainImage = product.images[0]?.url ?? DEFAULT_PRODUCT_IMAGE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-muted)]">
          <StoreImage src={mainImage} alt={product.name} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 50vw" />
        </div>
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
