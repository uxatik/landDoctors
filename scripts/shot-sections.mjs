// Usage: node scripts/shot-sections.mjs <url> <outPrefix> <width> <height>
// Screenshots the viewport-height slices of a page so details are readable.
import { chromium } from "@playwright/test";
const [,, url, out, w, h] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += +h) {
  await p.screenshot({ path: `${out}-${i++}.png`, clip: { x: 0, y, width: +w, height: Math.min(+h, total - y) }, fullPage: true });
}
console.log(i, "slices");
await b.close();
