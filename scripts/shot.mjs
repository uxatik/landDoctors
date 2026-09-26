import { chromium } from "@playwright/test";
const [,, url, out, w, h] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "load" });
await p.screenshot({ path: out, fullPage: true });
await b.close();
