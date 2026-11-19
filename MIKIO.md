# Mikio Ticker — Selldone Layout

**Mikio Ticker Patisserie** (package `mikio-ticker-patisserie`, first version `1.0.0`) is a Layout of the Selldone shop **Bakio** (shop 15740, xapi name `bakio`, `https://bakio.myselldone.com`): one pâtisserie at 1 The Embarcadero, San Francisco, selling individual pastries for courier delivery, worldwide shipping and pickup, cash on delivery, guest checkout. It goes live on **mikio.selldone.shop** only (its own domain); the shop default stays Bakini Noir (Layout 36) and bakini.selldone.shop (domain 1247) keeps its own pin.

The design is the page structure of **milkbarstore.com** (Milk Bar's online store), built only from Bakio's own data, never Milk Bar's images, words or name. The owner chose design **A "Ticker"** of two home mockups on 13 November 2026: white pages, black bars and footer, cream image tiles, one cherry-red theme colour; heavy extended caps (Archivo) over Figtree, with Space Mono for the moving strip, kickers and stickers.

## Where the design lives

| What | Where |
| --- | --- |
| Reference study (structure only) | `../mikio-design/reference/` (capture.cjs, pages.cjs: the home, a collection, a product, search, at 1440 and 390) |
| The home mockup (the owner's pick) | `../mikio-design/home-a.html`, its code `m/` (core.css, a.css, home.js, photos.js, theme-color.js) |
| Every other page | `../mikio-design/<page>-a.html` (27 pages, `node nx/build.cjs`), code `nx/`: Bakio Noir's page renderers and styles (`bakio-design/b/`) dressed in Ticker by `nx/skin.cjs` (one-time), `nx/alias.css` (Noir's token names onto Mikio's), `nx/ticker.css` (the Ticker touches), the Mikio shell in `nx/core.js`, and new Milk Bar-like shop pages: `nx/pages-shop.js` + `nx/shop.css` (collection, search, Shop all) and `nx/pages-product.js` (product) |
| Photos (Codex) | `../mikio-design/m/photos.js` → `node make-prompts.cjs` writes `CODEX-PROMPTS.md`, `prompts.html` and `photos/have.js`. 18 slots: two hero portraits per collection (1080×1350), "One piece at a time" ×2 (1080×1350), the three delivery tiles and the story (1200×1200). No words on any photo |
| Design checks | `node check/check.cjs` (the home, 7 widths, slides, overlays) and `node check/pages.cjs` (every other page, 1440/1100/768/390/360, light and dark, with their overlays: Shop menu, Visit us, region, search, bag, menu, filter, sort, rows, options) |

## How the mockup became the Layout

The repo started from **Bakini Noir 1.0.5** (`bakini-layout`, `git clone`, history kept, branch `mikio`; remote `bakini` fetch-only), so Bakini's battle-tested buy flow (bag drawer, checkout, address and delivery sheets, payment, order page, desk account, guest order code), the theme switcher, region switcher, i18n runtime, fit-in-circle, compare page and release scripts are kept.

- **Styles.** `scripts/mikio-css.cjs` ports the mockup's stylesheets, in the order the mockup pages load them, into `style/mikio/*.css` (generated, never edited): every rule scoped to the Layout's own markup (`:is(.nx, .nx *)`, or `:where()` for a bare element rule), custom properties with the `--bk-` prefix, the token blocks into `style/mikio/tokens.css` as `html:root` / `html.bk-dark:root` (they outrank `style/bakini-theme.scss`), `:root[data-mode=dark]` → `html.bk-dark`, the footer row's `.ts-*` → `.nts-*`, keyframes → `nx-*`. `style/mikio-layout.scss` holds the Layout's own touches. Re-run the script after any mockup change. The Noir dress files (`style/bakini-noir*.scss`) stay for Selldone's own parts inside the pages and read the same tokens.
- **Markup.** The Vue components write the mockup's markup with live data:

| Part | Where |
| --- | --- |
| Header: announcement bar (the saving, the free-shipping threshold, the payment way, "Shop now", the language & currency pill), Visit us (the pickup counter), the wordmark, search, account, bag; the nav row with the Shop menu (opens on hover too; a click right after the hover keeps it open), the menu panel, the language sheet | `components/bakini/shell/BakiniHeader.vue` (Bakini's name kept: StorefrontLayout and the checks read it) |
| Footer with the Theme row (the kit's `ThemeSwitcherRow`) | `components/bakini/shell/BakiniFooter.vue` |
| Wordmark (the shop's live title in caps + one tilted sprinkle) | `components/bakini/BakiniLogo.vue` |
| Home | `components/mikio/MkHome.vue` (in `pages/products/StorefrontPageProducts.vue`) |
| Photo slots (the shop's photo, else three real cut-outs on the dotted cream ground) | `components/mikio/MkPhoto.vue`, `mikio-photos.ts` (`assets/mikio/<file>.webp`) |
| How it works, delivery questions, more collections | `components/mikio/MkBands.vue` |
| Card (cream tile, −% sticker, name, first reason, price, Add to bag → − n +), rail | `components/bakini/noir/NxCard.vue`, `NxRow.vue` |
| Collection, search, Shop all | `components/bakini/noir/shop/NxListing.vue` |
| Product (gallery, choose your piece, rows that open), Goes well with | `components/bakini/noir/product/NxProductOverview.vue`, `NxTogether.vue`, `pages/product/StorefrontPageProduct.vue` |
| Bag drawer (Mikio's panel) | `components/bakini/noir/NxBagDrawer.vue` |
| Bag page, checkout, order, account, journal, article, about, legal, contact, FAQ, 404 | Bakini's Noir components, unchanged in markup, dressed by `style/mikio/` |

- **Theme.** `components/bakini/bakini-theme.ts`: Cherry (the brand), Caramel, Pistachio, Blueberry, Licorice (the mockup's presets, each from `paletteFromColor` with Mikio's surfaces), light first, storage key `mikio-theme`, plus `--bk-act-dk` (the palette's dark text: the black bars use it in both modes). `bakini-theme.settings.ts`: `palette: "cherry", mode: "light"`. Fonts: `components/kalio/kalio-fonts.ts`.

**What the mockup hard-codes and the Layout reads live.** Everything: the collections and their order, the slider's three collections (most pieces sold), "Just added" (the newest piece of each collection in turn), best sellers (`sells`), the "from" prices, the saving line ("25% off every piece" only when every piece has the same saving), the moving strip (sold by the piece, the saving, the days and counter hours from the pickup point's note, pickup street, the courier's distance, worldwide shipping, the payment way), the delivery tiles and questions (the shop's delivery ways: titles, windows, fees, free threshold, distance, the pickup point's note), "Good to know" (cash on delivery only when the gateway is COD, guest checkout only when the shop allows guest payment, the courier's windows), "Up close" (the first pro of the best seller of the collections ranked 4–6), the story ("Hello from <city>."), the journal (the shop's posts, newest first). A slot without its photo shows real cut-outs; no "Codex photo" caption ever reaches a shopper (the captions are the mockup's only).

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
| 1.0.0 | 13 Nov 2026 | **37** | 636 | The whole A port: Mikio's header, footer, home, card, rail, collection and product pages, Noir's buy flow, account and pages in Ticker's dress; 354 files. Verified on the server (`extracting:false`, `error:null`, js and css sha256 match `dist/app`; release `layouts/37/releases/01M7BF2DCSDZ7TXSJA4T56XBS5/app`). Pinned on domain **1250** (mikio.selldone.shop) only, `api.shops.domains.layout.set {mode:"private", layout_id:37, layout_version:"1.0.0"}`; the shop default and domain 1247 stay on Bakini Noir 1.0.5 (checked in each address's `"saved"` block) |
| 1.0.1 | 14 Nov 2026 | 37 | 637 | From the live checks on 1.0.0: the footer is black in both modes, so the kit's Theme row and Selldone's legal-row parts take the bar's words (light mode read 2.9:1 and 1.0:1); About's address block was `.visit` like the header's Visit us button and its map covered the page: renamed `.vst`. Also: Shop all opens every piece (newest first; the offers stay on Shop now), Mikio's tab mark, Arabic for Mikio's words (`bakini.mk.*`, i18n-lint OK 905), long buttons wrap, centred search heads never overflow at 360. 354 files. Verified, pinned on domain 1250 only; the checks that had findings rerun live at TOTAL 0 |
| 1.0.2 | 14 Nov 2026 | 37 | 638 | The phone's buy bar is read on every scroll: an IntersectionObserver missed a jump straight back to the top (iOS: tap the status bar) and left the bar on over the page. Verified (js and css match), pinned on domain 1250 only; checked live: hidden at the top, on past the Add box, hidden again after a jump to the top |
| 1.0.3 | 19 Nov 2026 | 37 | 760 | Checkout: the buyer's delivery address comes back after a detour through pickup (before, the courier, then pickup, then the courier again left an empty address, and Place order opened the address sheet instead of the payment window). Same change as layout-base da6d73f. Packed with `scripts/package-layout.mjs` (a Node port of Selldone's packager) on a computer without Python; server js/css match. Pinned on mikio.selldone.shop (1250) only. Detour check on live, 1440 and 390: the address stays and Place order opens the payment window; no order. |

## Notes for the next person

- The CDN serves product photos at their original size, 128 and 64 only (`…png128.png`); there is no 256 or 640 variant. Use `productImage(p)` (original) for anything wider than a thumbnail.
- The upload limit is about 360 files per deploy. Photos added later go to `assets/mikio/` with the exact names in `../mikio-design/CODEX-PROMPTS.md`; check the file count (`release.sh` prints it).
