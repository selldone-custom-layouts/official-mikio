// Quick looks at the dev or live shop while building: full-page shots folded into columns.
//   node scripts/look.cjs <base> <path,path,...> [width=1440] [mode=light] [out=shots-dev]
// The bag starts empty; the theme is stored as the switcher stores it (mikio-theme).
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright");
const sharp = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/sharp");
const [base = "http://localhost:9147", list = "/", w0 = "1440", mode = "light", outDir = "shots-dev"] = process.argv.slice(2);
const w = +w0;
const OUT = path.resolve(__dirname, "..", outDir);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1, hasTouch: w < 800 });
  await ctx.addInitScript((m) => { try { localStorage.setItem("mikio-theme", JSON.stringify({ palette: "cherry", mode: m })); } catch (e) {} }, mode);
  for (const p of list.split(",")) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e).slice(0, 300)));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 300)); });
    try {
      /* a cold /product/ or collection address can get Selldone's SEO page in a headless browser: open the home, then go there in the app */
      await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 180000 });
      await page.waitForSelector(".ftr", { timeout: 180000 });
      if (p !== "/") { await page.evaluate((to) => { const el = [...document.querySelectorAll("*")].find((e) => e.__vue_app__); el.__vue_app__.config.globalProperties.$router.push(to).catch(() => {}); }, p); await page.waitForTimeout(3500); }
      await page.waitForTimeout(2500);
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(1500);
      const buf = await page.screenshot({ fullPage: true, timeout: 90000 });
      const m = await sharp(buf).metadata();
      const cols = Math.max(1, Math.min(w < 800 ? 6 : 4, Math.ceil(m.height / (w < 800 ? 1700 : 2200))));
      const part = Math.ceil(m.height / cols), gap = 16, parts = [];
      for (let i = 0; i < cols; i++) { const h = Math.min(part, m.height - i * part); if (h <= 0) break; parts.push({ input: await sharp(buf).extract({ left: 0, top: i * part, width: m.width, height: h }).png().toBuffer(), left: i * (m.width + gap), top: 0 }); }
      const W = parts.length * m.width + (parts.length - 1) * gap;
      const name = (p.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "") || "home") + `-${w}-${mode}.png`;
      await sharp(await sharp({ create: { width: W, height: part, channels: 3, background: "#888" } }).composite(parts).png().toBuffer()).resize(Math.min(1800, W)).png().toFile(path.join(OUT, name));
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      console.log(name, "h", m.height, "scrollW+", sw, errs.length ? "ERRORS:\n  " + errs.slice(0, 6).join("\n  ") : "");
    } catch (e) { console.log(p, "FAILED", String(e).slice(0, 200), errs.slice(0, 4).join(" | ")); }
    await page.close();
  }
  await browser.close();
})();
