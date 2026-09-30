import { ProductCard, type ProductCardData } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-foreground/60">No products match your filters.</p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
