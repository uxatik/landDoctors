// Draws the share images (Facebook / WhatsApp link previews) and the browser icons.
// Run: node scripts/make-brand-images.mjs   (then: python3 scripts/make-favicon.py)
// Output: public/og-bn.png, public/og-en.png (1200×630), app/apple-icon.png (180×180), app/icon.svg,
// and scripts/.favicon-256.png, which make-favicon.py turns into app/favicon.ico.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const font = (p) => `file://${path.join(root, p)}`;
const hind = "node_modules/@fontsource/hind-siliguri/files/hind-siliguri";

const MARK = (stroke, fill) => `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="9" fill="${fill}"/>
  <g fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round">
    <path d="M7 9.5 17 7.5l1.5 8.5L8.5 18Z"/><path d="M18.5 16 17 7.5l7.5 2.2-.7 8Z"/><path d="M8.5 18 18.5 16l5.3 1.7-.3 6.8L9 25Z"/>
  </g>
</svg>`;

const ICON_SVG = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E7563"/><stop offset="1" stop-color="#0E7490"/></linearGradient></defs>
  <rect width="32" height="32" rx="9" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round">
    <path d="M7 9.5 17 7.5l1.5 8.5L8.5 18Z"/><path d="M18.5 16 17 7.5l7.5 2.2-.7 8Z"/><path d="M8.5 18 18.5 16l5.3 1.7-.3 6.8L9 25Z"/>
  </g>
</svg>
`;

const SKETCH = `
<svg viewBox="0 0 244 184" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">
  <path d="M8 14 L92 6 L104 70 L20 82 Z"/><path d="M104 70 L92 6 L176 18 L170 88 Z"/><path d="M20 82 L104 70 L112 150 L14 158 Z"/>
  <path d="M104 70 L170 88 L196 164 L112 150 Z"/><path d="M176 18 L236 30 L230 120 L170 88 Z"/><path d="M170 88 L230 120 L236 176 L196 164 Z"/>
</svg>`;

const COPY = {
  bn: { name: "ল্যান্ডডক্টর", lead: "জমির সমস্যায়", accent: "যাচাইকৃত ভূমি বিশেষজ্ঞ", line: "দলিল যাচাই · নামজারি · জমি পরিমাপ · ওয়ারিশ ও বণ্টন", chip: "সাভার ও গাজীপুর" },
  en: { name: "LandDoctor", lead: "Verified land experts", accent: "for every land matter", line: "Deed checks · Mutation · Land survey · Inheritance", chip: "Savar and Gazipur" },
};

const og = (c, lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: Hind; font-weight: 400; src: url("${font(`${hind}-bengali-400-normal.woff2`)}"); }
@font-face { font-family: Hind; font-weight: 700; src: url("${font(`${hind}-bengali-700-normal.woff2`)}"); }
@font-face { font-family: Mona; font-weight: 400; src: url("${font("public/fonts/MonaSans-Regular.ttf")}"); }
@font-face { font-family: Mona; font-weight: 700; src: url("${font("public/fonts/MonaSans-Bold.ttf")}"); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; font-family: Mona, Hind, sans-serif; color: #fff; overflow: hidden;
  background: linear-gradient(135deg, #0E7563 0%, #0A5165 100%); position: relative; }
.sketch { position: absolute; opacity: .14; }
.s1 { right: -60px; top: -30px; width: 560px; } .s2 { left: -90px; bottom: -120px; width: 420px; opacity: .08; }
.wrap { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 18px; font-size: 40px; font-weight: 700; }
.brand svg { width: 68px; height: 68px; }
h1 { font-size: ${lang === "bn" ? 84 : 76}px; line-height: 1.18; font-weight: 700; letter-spacing: ${lang === "bn" ? "0" : "-0.02em"}; }
h1 span { display: block; } h1 .a { color: #BFE3DB; }
.line { margin-top: 22px; font-size: 32px; color: rgba(255,255,255,.9); }
.foot { display: flex; align-items: center; justify-content: space-between; font-size: 28px; }
.chip { background: rgba(255,255,255,.16); border-radius: 999px; padding: 10px 24px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
.dot { width: 14px; height: 14px; border-radius: 50%; background: #22C55E; }
.url { font-family: Mona, sans-serif; font-weight: 700; }
</style></head><body>
<div class="sketch s1">${SKETCH}</div><div class="sketch s2">${SKETCH}</div>
<div class="wrap">
  <div class="brand">${MARK("#0E7563", "#fff")}<span>${c.name}</span></div>
  <div><h1><span>${c.lead}</span><span class="a">${c.accent}</span></h1><p class="line">${c.line}</p></div>
  <div class="foot"><span class="chip"><span class="dot"></span>${c.chip}</span><span class="url">landdoctorbd.com</span></div>
</div></body></html>`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ld-brand-"));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium" });
for (const lang of ["bn", "en"]) {
  const file = path.join(tmp, `og-${lang}.html`);
  fs.writeFileSync(file, og(COPY[lang], lang));
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, `public/og-${lang}.png`) });
  await page.close();
}
// Icons
fs.writeFileSync(path.join(root, "app/icon.svg"), ICON_SVG);
const iconFile = path.join(tmp, "icon.html");
fs.writeFileSync(iconFile, `<!doctype html><html><body style="margin:0;background:linear-gradient(135deg,#0E7563,#0E7490)"><div style="width:180px;height:180px;display:grid;place-items:center">
<svg width="132" height="132" viewBox="4 4 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M7 9.5 17 7.5l1.5 8.5L8.5 18Z"/><path d="M18.5 16 17 7.5l7.5 2.2-.7 8Z"/><path d="M8.5 18 18.5 16l5.3 1.7-.3 6.8L9 25Z"/></svg></div></body></html>`);
const p = await browser.newPage({ viewport: { width: 180, height: 180 } });
await p.goto(`file://${iconFile}`);
await p.screenshot({ path: path.join(root, "app/apple-icon.png") });
// A plain rounded icon with transparent corners for favicon.ico (made by make-favicon.py).
const favFile = path.join(tmp, "fav.html");
fs.writeFileSync(favFile, `<!doctype html><html><body style="margin:0;background:transparent"><div style="width:256px;height:256px">${ICON_SVG.replace("<svg ", '<svg width="256" height="256" ')}</div></body></html>`);
const f = await browser.newPage({ viewport: { width: 256, height: 256 } });
await f.goto(`file://${favFile}`);
await f.screenshot({ path: path.join(tmp, "favicon-256.png"), omitBackground: true });
fs.copyFileSync(path.join(tmp, "favicon-256.png"), path.join(root, "scripts/.favicon-256.png"));
await browser.close();
console.log("wrote public/og-bn.png, public/og-en.png, app/icon.svg, app/apple-icon.png");
