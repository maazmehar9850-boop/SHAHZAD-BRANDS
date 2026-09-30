import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "public", "images");

const palettes = [
  ["#1e3a5f", "#2d5a87"],
  ["#1a1a2e", "#c9a227"],
  ["#162447", "#e43f5a"],
  ["#0f3460", "#533483"],
  ["#2c3e50", "#4ca1af"],
  ["#141e30", "#243b55"],
  ["#373b44", "#4286f4"],
  ["#232526", "#414345"],
  ["#134e5e", "#71b280"],
  ["#42275a", "#734b6d"],
  ["#1f4037", "#99f2c8"],
  ["#4568dc", "#b06ab3"],
];

function svg(w, h, c1, c2, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#ffffffcc" font-family="system-ui,sans-serif" font-size="${Math.round(w / 22)}" font-weight="600">Shahzad Brands</text>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff99" font-family="system-ui,sans-serif" font-size="${Math.round(w / 32)}">${label}</text>
</svg>`;
}

fs.mkdirSync(path.join(root, "products"), { recursive: true });
fs.mkdirSync(path.join(root, "banners"), { recursive: true });
fs.mkdirSync(path.join(root, "categories"), { recursive: true });

palettes.forEach(([c1, c2], i) => {
  const n = String(i + 1).padStart(2, "0");
  fs.writeFileSync(
    path.join(root, "products", `product-${n}.svg`),
    svg(800, 1000, c1, c2, `Collection ${i + 1}`)
  );
});

["Hero", "Promo", "Season"].forEach((label, i) => {
  const [c1, c2] = palettes[i];
  fs.writeFileSync(path.join(root, "banners", `banner-${String(i + 1).padStart(2, "0")}.svg`), svg(1600, 900, c1, c2, label));
});

["Men", "Women", "Kids"].forEach((label, i) => {
  const [c1, c2] = palettes[i + 3];
  fs.writeFileSync(
    path.join(root, "categories", `${label.toLowerCase()}.svg`),
    svg(1200, 750, c1, c2, label)
  );
});

console.log("Placeholder images written to public/images/");
