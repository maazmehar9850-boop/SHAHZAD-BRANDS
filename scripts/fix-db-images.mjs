/**
 * Point product/banner/category images to local /public JPEG demo photos.
 * Run: node scripts/fix-db-images.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EXT = "jpg";

const productImagePath = (index) =>
  `/images/products/product-${String((index % 12) + 1).padStart(2, "0")}.${EXT}`;

const BANNERS = [
  `/images/banners/banner-01.${EXT}`,
  `/images/banners/banner-02.${EXT}`,
  `/images/banners/banner-03.${EXT}`,
];

const CATEGORIES = {
  men: `/images/categories/men.${EXT}`,
  women: `/images/categories/women.${EXT}`,
  kids: `/images/categories/kids.${EXT}`,
};

async function main() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  for (let i = 0; i < products.length; i++) {
    const url = productImagePath(i);
    await prisma.productImage.updateMany({
      where: { productId: products[i].id },
      data: { url },
    });
  }

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  for (let i = 0; i < banners.length; i++) {
    await prisma.banner.update({
      where: { id: banners[i].id },
      data: { image: BANNERS[i % BANNERS.length] },
    });
  }

  for (const [slug, image] of Object.entries(CATEGORIES)) {
    await prisma.category.updateMany({ where: { slug }, data: { image } });
  }

  console.log("Updated images for", products.length, "products,", banners.length, "banners");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
