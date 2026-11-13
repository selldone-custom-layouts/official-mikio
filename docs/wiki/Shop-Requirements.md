# Shop Requirements

The Layout reads everything from your shop. Nothing about Bakio is hard-coded. Here is what your shop's data needs so that each part looks as it does on [mikio.selldone.shop](https://mikio.selldone.shop). A section with no data folds away; it never shows an empty box, and no fact is invented to fill one.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign-in uses your shop's own sign-in. Without it, sign-in leaves for Selldone and shows an error. |
| **Business model** | A normal shop with one seller | Mikio is made for one bakery. |
| **Shop title** | The name you want read | It is drawn as the wordmark (in caps), the tab icon's letter and the page titles. |
| **Guest checkout** | Your choice | When guests may buy, the sign-in sheet offers "Continue as guest" and the home's Good to know says "No account needed"; otherwise the shopper signs in first. |
| **Payment methods** | At least one, for your currency (cash on delivery is fine) | The announcement bar, the moving strip, the delivery tiles' line, the collection page's dark band, the product page and the footer name it; with cash on delivery, Good to know says "Pay on delivery". Without one, the checkout says "This shop is not taking payment right now" instead of showing Pay. |
| **Delivery ways** (transportations) | What you offer, each with a title, a fixed fee, a free-shipping threshold if you have one, a distance for a courier, and **time windows** | The announcement bar (the free-shipping threshold), the moving strip (the courier's distance, worldwide shipping), Three ways to get it (one photo tile for each courier, pickup and shipping way, with its windows or note and its fee), Good to know (the courier's windows), the delivery questions under each listing, the product page's delivery lines, the bag and the checkout's delivery cards. A way without a title gets words from its kind ("<Shop> courier", "Worldwide shipping", "By post", "Pickup"). The windows (`time_spans`) are the choices at checkout. |
| **Pickup point** | If you have a counter: a pickup point with a note that holds the hours, e.g. "Open daily, 8:00-18:00" | The counter hours are read from that note (a time range like `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`). They show in the moving strip, Visit us, the pickup tile, the story, the footer and Contact. With no hours in the note, the hours are left out. |
| **Checkout map** | On or off | On: the address sheet has a map and a pin. Off: it is a short form with search. |
| **Login modes** | Your choice | The sign-in sheet shows your shop's own ways in (social logins as you switch them on, an email code, phone). |
| **Currency, country, language** | Your market | Prices, the address form, and the language and currency pill at the right end of the announcement bar (the phone menu's "Language & currency" row). The pill shows even with one currency and one language. Mikio's own words are in English and Arabic; another language needs one file (see [Customize](Customize#languages)). |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Shop info

The facts on the home, the header, the footer, Contact and the sample pages come from the shop's own info (Selldone dashboard, the shop's contact information):

- **Address**, city, region and postal code: Visit us, the moving strip ("Pickup at <street>"), the story ("Hello from <city>." and "<Shop> is a pâtisserie counter at <address>."), About, Contact, the footer and its legal row.
- **Location** (the pin on the map): Visit us's "Get directions" and the map on About and Contact. Without a location, Visit us has no directions button, Contact has no map and About shows a plain plate with the pin.
- **Open days:** "Open every day" or the days you list, in the moving strip, Visit us, the story, the footer and Contact.
- **Phone** and **email:** Visit us (phone), the story, the footer and Contact.

## Collections (categories)

- Each **top-level category** is a collection: a round tile in the home's "Shop by collection", a link in the nav row, the Shop menu, the menu panel, the moving strip of collections and the footer's Shop column, a tab on search and Shop all, and its own collection page.
- The tiles and menus show each collection's **best-selling cut-out**. The collection's own **image** is used only while it has no products, and on the 404 page and About; make it a pastry cut-out on a transparent ground too.
- Give each one a short **description**: it shows on the home's slider and in the collection page's hero.
- Order them in Selldone; collections with the same sales keep your order.
- The slider shows the three collections with the most pieces sold; Up close takes the next three; More collections lists the others, best-selling first; Goes well with takes the best seller of the two best-selling other collections.

## Photos for the photo slots (optional)

The home's slider, One piece at a time, the three delivery tiles, the story and each collection page's hero are **photo slots**. Each reads one file from `assets/mikio/` in the repository: `mikio-hero-<collection name>-a.webp` and `-b.webp` (1080 × 1350) for each collection, where the collection name is its address name in Selldone (`cookies`, `mini-cakes`); `mikio-duo-box.webp` and `mikio-duo-table.webp` (1080 × 1350); `mikio-way-courier.webp`, `mikio-way-pickup.webp` and `mikio-way-shipping.webp` (1200 × 1200); `mikio-story.webp` (1200 × 1200).

- A slot without its file shows three real cut-outs on a dotted cream ground, so a new collection never shows an empty box.
- No words, logos or people on any photo, and a plain margin of at least 8% around the pastries: the whole photo is always shown.
- The photos are part of the Layout, so a new one needs a new release. See [Customize](Customize#photos).

## Products

- The **main photo** as a **transparent cut-out** (PNG or WebP, the pastry alone on no ground). Every card, the quick look, the product page and the photo slots' fallback set it on a cream tile; a photo with its own ground shows as a square on the tile. More photos make the product page's gallery.
- A **unit** (Selldone's `unit` field, for example "croissant"): "per croissant" on every card, "per croissant · sold individually" and "Choose your croissant:" on the product page, "This croissant" in Goes well with. Without one, the Layout says "piece".
- A **price**, and a **discount** for a saving: the struck was-price, the `−%` sticker, "Save $X · n%" on the product page. The announcement bar, the moving strip and the slider's line say "25% off every piece" when every product has the same saving, else "Up to X% off".
- **Shop all** (in the header, the menus and the footer) lists the pieces that have a saving. When every piece has one, as on Bakio, that is every piece.
- **Discount dates:** a deal with a real end date gets a clock on the product page. Without an end date there is no clock; no date is ever invented.
- **Pros** (Selldone's product pros, a title and a line each): the first one is the line under the name on every card and on the product page; all of them make the "Why you'll love it" row on the product page; the first pro of three collections' best sellers makes the home's Up close; the quick look shows the first, and Compare lists them.
- **Rating criteria** (for example "Flakiness", "Flavor"): shown as "Not rated yet" beside "No reviews yet." until the first review.
- **Stock:** "Only n left" on a card at five or fewer; the product page shows the stock.
- **Variants** only when the product really has options: tiles with their own photo on the product page; the quick look then says "Choose options" and opens the product.
- A **product code** (SKU) shows at the foot of the buy column.
- **Sales:** the slider, Best sellers, the collection tiles' and menus' photos, Up close, More collections and Goes well with are ranked by Selldone's own sales count. With no sales yet, the older products come first.
- Mikio reads up to **250 products** in one go; a larger catalogue shows its first 250 in the listings and on the home.

## Specs and filters

The filter panel, the product page's spec rows and Compare come from each product's **spec**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. A nested spec is not shown anywhere.
- Keep the values you want as filters **short**. A spec key becomes a filter only when the products on that page have **two or more different values** for it, each **28 characters or fewer**. A long sentence (an allergen note, a description of the finish) is never a filter, but it still shows in the product page's spec rows.
- **Price** (a two-thumb range with short boxes) is always there, and **On offer** whenever something on the page has a saving. Nothing else is invented, so a collection may show fewer filters than another.
- The filters open in a side panel at every width. They are read live from the products, so a spec change shows on the next visit. No category filter list is needed.
- Sort: Featured, Best sellers, Customer review, Price low to high, Price high to low, Newest (Shop all adds Biggest saving first).

## Content

- **Articles** (blog posts) with **cover images**: the home shows the two newest side by side, then the next four as "From the journal", last; the journal page shows them all, newest first. Publish **six or more** to fill both.
- In an article's text, **link the pastries** it talks about (`/product/<id>` links): the article ends with one panel of those pastries (four at most) and "Add all". Without links, the panel shows the pastries the text names.
- **FAQ** entries: the FAQ page, with topic tabs from the FAQ's tags. Until you add some, it shows sample questions (ordering pieces, delivery windows, pickup, the way to pay, allergens) built from your shop's facts, under the sample label below. The delivery questions under each listing are built from your delivery ways, not from the FAQ.
- **About us, Terms, Privacy, Contact us** pages (Selldone's shop profiles). Until you write them, About, Terms and Privacy show sample text built only from your shop's facts (no invented history, names or reviews), under a clear "Sample text — the shop has not written this page yet" label. Contact always shows your real lines and the message form; your own Contact text shows above the form.
- A **footer menu** (Selldone menu, type Footer): the footer's column under your shop's name. Without one: Home, About and Contact.
- **Social links:** shown in the footer's legal row.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] The shop's title reads the way the wordmark should
- [ ] Collections have a short description (and a cut-out image for while they are empty)
- [ ] Products have a cut-out main photo, a unit, pros, flat specs with short values, and an SKU
- [ ] Some products have discounts, with end dates only where the deal really ends
- [ ] At least one payment method (cash on delivery is fine)
- [ ] Delivery ways with titles, fees and time windows; a pickup point whose note holds the hours
- [ ] The shop info has an address, a location on the map, open days, a phone and an email
- [ ] Six or more articles with covers, linking the pastries they talk about
- [ ] FAQ entries, and your own About, Terms and Privacy
- [ ] Optional: photos for the photo slots in `assets/mikio/`
- [ ] The domain's Home is the shop page
