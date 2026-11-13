# Customize

Mikio's design lives in its own components and style sheets. Selldone's commerce logic underneath (basket, bill, checkout, variants, orders, payment) stays untouched. After any change in the code, or a new photo in `assets/mikio/`: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)). A change in your shop's data (a title, a product photo, a delivery window, an article) needs no release: it shows on the next visit.

## The name and the wordmark

The wordmark is your **shop's title**, read live. `components/bakini/BakiniLogo.vue` draws it in heavy extended caps (Archivo), with one tilted sprinkle in the action colour after it (in the black footer, the palette's light red). The footer, the page titles and the messages use the same title. Rename the shop in Selldone and the Layout follows.

`components/kalio/kalio-brand.ts`: `BRAND.name = null` keeps the shop's title. A string there replaces it everywhere the storefront names the shop.

The mark (the browser tab's icon, the avatar on order messages and the compare page's share card) is drawn from the title's first letter by `markFor()` in the same file. It is an inline SVG, so there is no image file to replace; change `markFor()` to change it.

## The colours, dark or light

One file: `components/bakini/bakini-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/bakini/bakini-theme.ts` or the tokens in `style/mikio/tokens.css` for a merchant's theme.

## Type, tokens and words

| What | Where |
| --- | --- |
| Fonts (Archivo for headings, buttons, the nav and the wordmark; Figtree for text; Space Mono for the moving strip, kickers and stickers; Material Symbols Rounded only for Selldone's own parts) | `components/kalio/kalio-fonts.ts` |
| Icons (inline line icons, one stroke width) | `components/bakini/noir/nx-icons.ts`, drawn by `NxIcon.vue` |
| Colour tokens for both modes (pages, ink, lines, cream tiles, black bars, the action colour's roles) | `style/mikio/tokens.css`, generated from the mockup by `scripts/mikio-css.cjs`: `html:root` is the light mode, `html.bk-dark:root` the dark mode. They outrank the older names in `style/bakini-theme.scss` |
| "Bag" instead of basket in Selldone's own English strings | `components/kalio/kalio-brand.ts` (`bagWords()`) |
| Mikio's own words (every one through `t("bakini.…", "English")`; the ones new in Mikio under `bakini.mk.*`) | the components; the English in `components/kalio/i18n/bakini.en.ts`, Arabic in `bakini.ar.ts` (see [Languages](#languages)) |

## Photos

| Picture | Where it comes from |
| --- | --- |
| Pastries on every card, the quick look, the product page and the bag | each product's main photo, a transparent cut-out (PNG or WebP); more photos make the gallery |
| Collections in the Shop menu, the menu panel, the home's round tiles and More collections | the collection's best-selling products' cut-outs; the category's own image only while it has no products (and on the 404 page and About) |
| The photo slots: the home's slider and each collection page's hero, One piece at a time, Three ways to get it, the story, and the How it works band | `assets/mikio/<file>.webp` when the Layout has it, else three real cut-outs on a dotted cream ground (`components/mikio/MkPhoto.vue`) |
| The journal and each story | each article's cover image |
| About and Contact | a static map of the shop's location (Selldone's map service) |

Product and collection pictures are changed in the Selldone dashboard, not in the code. The cut-outs matter: the Layout sets every pastry on a cream tile, and a photo with its own ground shows as a square. See [Shop Requirements](Shop-Requirements#products).

### The photo slots

| Slot | File in `assets/mikio/` | Size |
| --- | --- | --- |
| The home's slider and the collection page's hero (two per collection) | `mikio-hero-<collection name>-a.webp`, `mikio-hero-<collection name>-b.webp` | 1080 × 1350 |
| One piece at a time | `mikio-duo-box.webp`, `mikio-duo-table.webp` | 1080 × 1350 |
| Three ways to get it (one tile per courier, pickup and shipping way); the courier photo also sits beside How it works | `mikio-way-courier.webp`, `mikio-way-pickup.webp`, `mikio-way-shipping.webp` | 1200 × 1200 |
| The story | `mikio-story.webp` | 1200 × 1200 |

`<collection name>` is the collection's address name in Selldone (`cookies`, `mini-cakes`). To add a photo:

1. Make it at the exact size, as WebP, with the exact name. No words, logos or people on it, and a plain margin of at least 8% around the pastries: the whole photo is always shown, and every headline and button sits beside or under it.
2. Put it in `assets/mikio/` (create the folder if it is not there). `components/mikio/mikio-photos.ts` lists the files that exist at build time, so nothing else changes.
3. Build and release a new version, and check that the file count stays under ~360.

A slot keeps its photo's proportions with or without the file, so adding a photo doesn't move the page. A collection that moves into the slider's top three shows cut-outs until its pair is added. Ready-made prompts for Bakio's 18 slots are in `mikio-design/CODEX-PROMPTS.md` in the project.

## Sections and pages

| What | Where |
| --- | --- |
| Header (the announcement bar with the language and currency pill, Visit us, the wordmark, search with live suggestions, the account, the bag button, the nav row with the Shop menu, the menu panel, the language sheet) | `components/bakini/shell/BakiniHeader.vue` |
| Footer (the wordmark with the shop's street, hours, phone and email; Shop; Help; your footer menu; the Theme row; the legal row) | `components/bakini/shell/BakiniFooter.vue` |
| Wordmark | `components/bakini/BakiniLogo.vue` |
| Home (the facts strip, the slider, Shop by collection, Just added, One piece at a time, Three ways to get it, Good to know, the collections strip, Best sellers, two journal posts, Up close, the story, From the journal) | `components/mikio/MkHome.vue`, inside `pages/products/StorefrontPageProducts.vue` |
| Photo slots | `components/mikio/MkPhoto.vue`, `components/mikio/mikio-photos.ts` |
| How it works, the delivery questions and More collections (under the listings and the product page) | `components/mikio/MkBands.vue` |
| Shared pieces (the shop's data and facts, layers, icons, card, quantity box, rails, bag drawer, quick look, map, journal card) | `components/bakini/noir/` (`noir.ts`, `NxCard.vue`, `NxQb.vue`, `NxRow.vue`, `NxBagDrawer.vue`, `NxQuick.vue`, `NxMap.vue`, `NxPost.vue`) |
| Listings (a collection, search, Shop all; the two-photo hero, the slim bar, the grid with its dark band, the filter panel, sort) | `components/bakini/noir/shop/NxListing.vue`, inside `pages/products/StorefrontPageProducts.vue` |
| Product page (gallery, buy column, Choose your <unit>, rows that open, phone buy bar, Goes well with, reviews, More <collection>) | `pages/product/StorefrontPageProduct.vue`, `components/bakini/noir/product/` (`NxProductOverview.vue`, `NxPdQb.vue`, `NxTogether.vue`, `NxReviews.vue`, `pd.ts`) |
| Compare | `components/bakini/noir/compare/NxCompare.vue`, `pages/comparison/` |
| Bag page and checkout (step pills, contact, delivery cards and windows, address or pickup counter, billing, note, payment) | `pages/basket/cart/StorefrontPageBasketCart.vue`, `components/bakini/noir/buy/noir-cart.ts`, `components/kalio/checkout/KalioAddressSheet.vue` |
| Order page (receipt, delivery, chat) | `pages/basket/order/`, `components/kalio/order/` |
| Account desk (Overview, Orders, Addresses, Profile) | `components/kalio/account/`, `components/bakini/noir/account/noir-account.ts`, `pages/user/` |
| Sign-in sheet | `components/kalio/shell/KalioSignIn.vue` |
| Journal and story | `pages/blog/list/StorefrontPageBlogsList.vue`, `pages/blog/view/StorefrontPageBlogsView.vue` |
| About, Terms, Privacy, Contact, FAQ (with the sample text and its label) | `pages/official/`, `pages/faq/StorefrontPageFaq.vue`, `components/bakini/noir/read/` (`NxLegal.vue`, `NxSampleTag.vue`, `rd.ts`) |
| 404 | `pages/errors/404/StorefrontPageError404.vue` |

The bag, checkout, order, account, journal and content pages are Bakini Noir's components, unchanged in markup and dressed by `style/mikio/`. A shop with its own custom header or footer code in Selldone keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`).

## Styles

| File | Holds |
| --- | --- |
| `style/mikio/tokens.css`, `base.css`, `pages.css`, `product.css`, `buy.css`, `read.css`, `core.css`, `a.css`, `alias.css`, `shop.css`, `ticker.css` | the mockup's stylesheets (`mikio-design/m/` and `mikio-design/nx/`), converted by `scripts/mikio-css.cjs`: every rule scoped to Mikio's own markup (`.nx`), the custom properties renamed `--bk-…`, dark mode as `html.bk-dark`, the tokens of both modes in `tokens.css`. **Generated: never edit them.** |
| `style/mikio-layout.scss` | the Layout's own touches, loaded last: Selldone's and Vuetify's parts inside Mikio's pages, and the places where the Vue markup differs from the mockup's. Change the look here. |
| `style/bakini-noir.scss`, `bakini-noir-shop.scss`, `bakini-noir-product.scss`, `bakini-noir-buy.scss`, `bakini-noir-read.scss`, `bakini-noir-account.scss` | Selldone's own parts inside the pages (payment window, coupons, billing), reading the same tokens |
| `style/bakini-theme.scss` | the older token names the shared Kalio styles read, mapped onto the same variables; `style/mikio/tokens.css` outranks it |

All of them are loaded from `StorefrontApp.vue` (`bakini-theme.scss` through `style/storefront.scss`): the generated files first, `mikio-layout.scss` last. Every Mikio component wraps its markup in an element with the class `nx`, so these rules never touch Selldone's or Vuetify's parts outside it.

## Languages

Every word Mikio writes goes through `t("key", "English")` (`components/kalio/i18n/kalio-i18n.ts`). The English is the second argument at the call site; the dictionaries are files beside it:

| File | Holds |
| --- | --- |
| `components/kalio/i18n/base/<code>.ts` | the shared Kalio words (bag, checkout, account, compare…), the same in every Kalio-family Layout |
| `components/kalio/i18n/bakini.<code>.ts` | Mikio's own words: `bakini.mk.*` (new in Mikio) and the `bakini.*` words it shares with Bakini Noir |
| `components/kalio/i18n/lang-<code>.ts` | merges the two; loaded only when a visitor picks that language |
| `components/kalio/i18n/index.ts` | `EN` (English, bundled) and `LOADERS`, the list of other languages Mikio knows |

Mikio ships English and Arabic (`ar`, right to left: the whole page mirrors). The visitor picks one from the language and currency pill in the announcement bar (the phone menu's "Language & currency" row); the list is the shop's own languages (Selldone dashboard › Shop › Languages).

To change a word: edit the English at the call site, and the same key's value in `bakini.en.ts` and in each `bakini.<code>.ts` (a shared Kalio word, one without the `bakini.` prefix, lives in `base/en.ts` and `base/<code>.ts` instead).

To add a language your shop offers:

1. Copy `bakini.en.ts` to `bakini.<code>.ts` and translate every value (keep `{n}`, `{shop}` and the other `{…}` words; plural keys end in `.one` / `.other`, and a language with more forms adds `.zero`, `.two`, `.few`, `.many`).
2. Translate `base/en.ts` into `base/<code>.ts` the same way.
3. Copy `lang-ar.ts` to `lang-<code>.ts` and change its two imports.
4. Add one line to `LOADERS` in `index.ts`, next to `ar: () => import("./lang-ar")`.
5. Build and check every page in that language. A word still in English is a string that is not wrapped in `t()` yet: wrap it with a new `bakini.mk.…` key.

The words the shop writes (product names, collections, units, pros, spec, articles, the footer menu) are the shop's data: translate them in the Selldone dashboard.

Right to left, Mikio keeps these rules:

- logical CSS everywhere (`margin-inline`, `inset-inline`, `text-align: start`), so the page mirrors; the slider's swipe and arrow keys follow the direction;
- the shop's own words (names, collections, addresses) sit in `<bdi>`, so each keeps its own direction inside a translated sentence;
- the `−%` sticker is a pill that grows with its words and keeps its digits left to right;
- an Arabic face (Noto Sans Arabic) is loaded only when Arabic is picked.

## Rules the design keeps

- **One action colour.** Cherry red (or your palette) for every button, chosen state and link; on the black bars, the palette's light variant (`--bk-act-dk`) with dark words. Every colour is a token.
- **Flat.** Buttons without shadows; hover changes the colour only; no line under any word or icon. The only underlined words are the links inside a story's own text.
- **Rings inside the box.** Every selection ring and card edge is an inset shadow, never an outline.
- **Cut-outs on cream tiles.** Product photos are transparent cut-outs on cream tiles (`#fbe9d7`; a warm brown `#2a231e` in dark mode), so there is no white square in either mode.
- **No words on photos.** Every headline, caption and button sits beside or under its photo, on phones too.
- **Moving parts can stop.** The moving strips and the slider have pause buttons, hold on hover and keyboard focus, and stand still for reduced motion.
- **Bag, not cart.** In the Layout's words and in Selldone's own English strings.
- **Honest words.** No invented history, awards, names, counts or reviews; sample pages say they are samples; "every piece" only when every piece has the same saving; Good to know only with what the shop really offers; delivery lines and windows only from the shop's own delivery ways; counter hours only from the pickup note; deal clocks only to a deal's real end date; "not taking payment" when there is no payment method.
- **Live data.** Nothing names a product, price, collection, delivery way or opening hour; another bakery gets its own.
