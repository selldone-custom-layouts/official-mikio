// docs/screenshots from the live shop: desktop 1440×900 and phone 390×844 (home, collection,
// product, a filled bag), dark home on both, the Theme row, and a 2400×1260 cover.
//   node scripts/doc-shots.cjs [base=https://mikio.selldone.shop]
// One browser, one page at a time (the live shop rate-limits parallel browsers).
// The bag is filled through the Layout's own "Add to bag" (a guest basket; nothing is ordered).
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright");
const sharp = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/sharp");
const base = (process.argv[2] || "https://mikio.selldone.shop").replace(/\/$/, "");
const OUT = path.resolve(__dirname, "../docs/screenshots");
fs.mkdirSync(OUT, { recursive: true });
const push = (pg, to) => pg.evaluate((to) => { const el = [...document.querySelectorAll("*")].find((e) => e.__vue_app__); el.__vue_app__.config.globalProperties.$router.push(to).catch(() => {}); }, to);
async function settle(pg, ms = 3000) {
  await pg.waitForTimeout(ms);
  await pg.evaluate(async () => { for (let y = 0; y < Math.min(document.documentElement.scrollHeight, 4000); y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
  await pg.evaluate(() => { document.querySelectorAll(".tk-btn[aria-pressed='false']").forEach((b) => b.click()); const p = document.querySelector(".hero-ctl .play[aria-pressed='false']"); if (p) p.click(); });
  await pg.waitForTimeout(1200);
}
async function shoot(phone, mode, jobs) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: 1, hasTouch: phone, isMobile: phone,
    userAgent: phone ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" : undefined });
  await ctx.addInitScript((m) => { try { localStorage.setItem("mikio-theme", JSON.stringify({ palette: "cherry", mode: m })); } catch (e) {} }, mode);
  const pg = await ctx.newPage();
  await pg.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 180000 });
  await pg.waitForSelector(".ftr", { timeout: 180000 });
  for (const [name, fn] of jobs) {
    await fn(pg);
    const file = path.join(OUT, name + ".jpg");
    await pg.screenshot({ path: file, type: "jpeg", quality: 84 });
    console.log(name);
  }
  await browser.close();
}
(async () => {
  for (const phone of [false, true]) {
    const k = phone ? "phone" : "desktop";
    await shoot(phone, "light", [
      [k + "-home", async (pg) => { await push(pg, "/"); await settle(pg); }],
      [k + "-category", async (pg) => { await push(pg, "/croissants-category"); await settle(pg, 3500); }],
      [k + "-product", async (pg) => { await push(pg, "/product/720375"); await settle(pg, 3500); }],
      [k + "-cart", async (pg) => {
        for (const id of [720375, 720385, 720424]) {
          await push(pg, "/product/" + id); await pg.waitForTimeout(3500);
          const add = await pg.$('.pd-add .qb[data-q="0"] .p');
          if (add) { await add.click(); await pg.waitForTimeout(1800); }
        }
        await push(pg, "/basket/PHYSICAL"); await settle(pg, 4000);
      }],
    ]);
    await shoot(phone, "dark", [[k + "-dark", async (pg) => { await push(pg, "/"); await settle(pg); }]]);
  }
  await shoot(false, "light", [["desktop-theme", async (pg) => { await push(pg, "/"); await settle(pg); await pg.evaluate(() => { const r = document.querySelector(".nts-row"); if (r) window.scrollTo(0, r.getBoundingClientRect().top + scrollY - 520); }); await pg.waitForTimeout(800); }]]);
  // the cover: the desktop home and the phone home on Mikio's cream, side by side
  const desk = await sharp(path.join(OUT, "desktop-home.jpg")).resize(1760, 1100).toBuffer();
  const ph = await sharp(path.join(OUT, "phone-home.jpg")).resize(476, 1030).toBuffer();
  await sharp({ create: { width: 2400, height: 1260, channels: 3, background: "#fbe9d7" } })
    .composite([{ input: desk, left: 70, top: 80 }, { input: ph, left: 1880, top: 115 }])
    .jpeg({ quality: 84 }).toFile(path.join(OUT, "cover.jpg"));
  for (const old of ["desktop-light.jpg", "phone-light.jpg"]) { try { fs.unlinkSync(path.join(OUT, old)); } catch (e) {} }
  console.log("cover");
})();
