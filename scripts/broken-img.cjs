// Lists images that failed to load on a page (dev or live): node scripts/broken-img.cjs <url>
"use strict";
const { chromium } = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright");
const url = process.argv[2] || "http://localhost:9147/";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });
  await page.waitForSelector(".ftr", { timeout: 300000 });
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await page.waitForTimeout(4000);
  const bad = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => (i.className || i.parentElement.className) + " " + i.getAttribute("src")));
  console.log(bad.length, "broken");
  console.log([...new Set(bad)].slice(0, 20).join("\n"));
  await browser.close();
})();
