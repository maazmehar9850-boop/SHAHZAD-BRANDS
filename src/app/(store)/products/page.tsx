import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProductsClient } from "./ProductsClient";

export const metadata = { title: "Shop" };

export default async function ProductsPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <ProductsClient initialCategories={categories} initialBrands={brands} />
    </Suspense>
  );
}
