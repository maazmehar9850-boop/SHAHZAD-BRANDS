/** Add a few extra products with local photos for testing. Run: node scripts/add-demo-products.mjs */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const extras = [
  { name: "Casual Hoodie", slug: "casual-hoodie-test", sku: "SB-T-001", price: 4900, salePrice: 4290, stock: 22, img: 1 },
  { name: "Formal Waistcoat", slug: "formal-waistcoat-test", sku: "SB-T-002", price: 7200, salePrice: null, stock: 14, img: 5 },
  { name: "Printed Scarf", slug: "printed-scarf-test", sku: "SB-T-003", price: 1900, salePrice: 1490, stock: 45, img: 8 },
  { name: "Leather Belt", slug: "leather-belt-test", sku: "SB-T-004", price: 2400, salePrice: null, stock: 38, img: 11 },
];

async function main() {
  const men = await prisma.category.findFirst({ where: { slug: "men" } });
  const brand = await prisma.brand.findFirst();
  if (!men || !brand) throw new Error("Run db:seed first");

  for (const p of extras) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    const n = String(p.img).padStart(2, "0");
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: `${p.name} — demo item for testing Shahzad Brands storefront.`,
        price: p.price,
        salePrice: p.salePrice,
        costPrice: Math.round(p.price * 0.45),
        stockQuantity: p.stock,
        brandId: brand.id,
        categoryId: men.id,
        isActive: true,
        isFeatured: p.img % 2 === 0,
        isBestseller: p.img % 3 === 0,
        images: {
          create: [
            { url: `/images/products/product-${n}.jpg`, alt: p.name, sortOrder: 0 },
            {
              url: `/images/products/product-${String((p.img % 12) + 1).padStart(2, "0")}.jpg`,
              alt: `${p.name} alternate`,
              sortOrder: 1,
            },
          ],
        },
      },
    });
    console.log("Added", p.name);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
