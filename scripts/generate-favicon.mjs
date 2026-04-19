/**
 * One-shot: rasterize LCI SVG → multi-size PNG buffers → public/favicon.ico
 * Run: node scripts/generate-favicon.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = join(root, "public/brand/lci-logo-dark.svg");
const out = join(root, "public/favicon.ico");

const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer())
);

writeFileSync(out, await toIco(pngs));
console.log("Wrote", out);
