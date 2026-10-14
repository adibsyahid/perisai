// Generates the PWA icons in public/icons/ from one shield design.
// Run once after changing the design: `node scripts/make-icons.mjs`
// The PNGs are committed, so this never runs during a Vercel build.
// sharp ships with Next.js (used for image optimisation), so no extra package.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SHIELD =
  "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z";
const CHECK = "m9 12 2 2 4-4";

// scale: how big the 24-unit shield is drawn on the 512 canvas.
// radius: corner rounding of the background (0 = full square for masks/iOS).
function iconSvg({ scale, radius }) {
  const offset = 256 - 12 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563EB"/>
      <stop offset="1" stop-color="#0B1B3F"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${SHIELD}" fill="#FFFFFF"/>
    <path d="${CHECK}" fill="none" stroke="#1D4ED8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const outputs = [
  // "any" icon: rounded tile, big shield.
  { file: "icon-192.png", size: 192, svg: iconSvg({ scale: 13, radius: 112 }) },
  { file: "icon-512.png", size: 512, svg: iconSvg({ scale: 13, radius: 112 }) },
  // Maskable: full bleed, shield kept inside the 80% safe zone.
  { file: "maskable-512.png", size: 512, svg: iconSvg({ scale: 12, radius: 0 }) },
  // iOS rounds the corners itself and dislikes transparency.
  { file: "apple-touch-icon.png", size: 180, svg: iconSvg({ scale: 12, radius: 0 }) },
];

await mkdir("public/icons", { recursive: true });
for (const { file, size, svg } of outputs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/${file}`);
}
await writeFile("src/app/icon.svg", iconSvg({ scale: 13, radius: 112 }));
console.log("Icons written to public/icons/ and src/app/icon.svg");
