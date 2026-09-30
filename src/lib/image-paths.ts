/** Local product/banner assets — JPEG demo photos in public/images */
const EXT = "jpg";

export function productImagePath(index: number): string {
  const n = ((index % 12) + 1).toString().padStart(2, "0");
  return `/images/products/product-${n}.${EXT}`;
}

export const BANNER_IMAGES = [
  `/images/banners/banner-01.${EXT}`,
  `/images/banners/banner-02.${EXT}`,
  `/images/banners/banner-03.${EXT}`,
] as const;

export const CATEGORY_IMAGES = {
  men: `/images/categories/men.${EXT}`,
  women: `/images/categories/women.${EXT}`,
  kids: `/images/categories/kids.${EXT}`,
} as const;

export const DEFAULT_PRODUCT_IMAGE = `/images/products/product-01.${EXT}`;
