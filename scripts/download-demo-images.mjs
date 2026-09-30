/**
 * Download clothing / fashion photos (Pexels) into public/images for local serving.
 * Run: node scripts/download-demo-images.mjs
 */
import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "public", "images");

function pexels(id, w) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinyrgb&w=${w}`;
}

/** Apparel, racks, outfits — verified Pexels IDs */
const PRODUCT_IDS = [
  1124467, // men's shirt
  767116, // folded clothes
  1926769, // blazer / formal
  6069552, // polo / casual top
  1536619, // women's dress
  996329, // evening / fashion
  1040945, // jacket
  6069554, // ethnic / styled outfit
  355844, // kids clothing
  1884581, // winter coat
  1884584, // sportswear
  1884583, // streetwear
];

const BANNER_IDS = [298863, 996329, 767116]; // store / fashion / apparel
const CATEGORY_IDS = { men: 1124467, women: 1536619, kids: 355844 };

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "ShahzadBrands-Setup/1.0", Accept: "image/*" },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error(`${url} → file too small`);
  fs.writeFileSync(dest, buf);
  console.log("OK", path.basename(dest), `(${Math.round(buf.length / 1024)} KB)`);
}

async function main() {
  fs.mkdirSync(path.join(root, "products"), { recursive: true });
  fs.mkdirSync(path.join(root, "banners"), { recursive: true });
  fs.mkdirSync(path.join(root, "categories"), { recursive: true });

  for (let i = 0; i < PRODUCT_IDS.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    await download(pexels(PRODUCT_IDS[i], 800), path.join(root, "products", `product-${n}.jpg`));
  }

  for (let i = 0; i < BANNER_IDS.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    await download(pexels(BANNER_IDS[i], 1600), path.join(root, "banners", `banner-${n}.jpg`));
  }

  for (const [name, id] of Object.entries(CATEGORY_IDS)) {
    await download(pexels(id, 1200), path.join(root, "categories", `${name}.jpg`));
  }

  console.log("Clothing demo photos saved under public/images/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
