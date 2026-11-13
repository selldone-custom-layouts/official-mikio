<!--
  Mikio Ticker — the home (mikio-design/home-a.html, m/home.js; the owner chose
  design A "Ticker" on 13 November 2026), in the section order of
  milkbarstore.com's home, built only from the shop's live data:

   1. a moving strip of the shop's facts (pausable; still for reduced motion);
   2. the slider: the three collections with the most pieces sold, each with
      two portrait photos (MkPhoto: the shop's photo, or its best sellers'
      cut-outs) and its words alternating sides; filling tabs, pause / play,
      arrows, swipe, arrow keys; it holds on hover, keyboard focus and a
      hidden tab, and starts paused for reduced motion;
   3. the collections as round tiles with "from" prices;
   4. "Just added": the newest pieces, one collection at a time;
   5. "One piece at a time" (words + two photos);
   6. "Three ways to get it": the shop's delivery ways as photo tiles;
   7. "Good to know": paying on delivery, guest checkout, the courier's windows
      (each only when the shop has it);
   8. a moving strip of the collections;
   9. "Best sellers" (by pieces sold);
  10. the two newest journal posts, zig-zag;
  11. "Up close": the first reason to love three more collections' best sellers;
  12. the shop's story with its hours, phone and email;
  13. the journal: the next four posts, last.
-->
<template>
  <div class="nx mk-home">
    <!-- 1. the facts strip -->
    <section v-if="facts1.length" :aria-label="t('bakini.mk.home.aboutShop', 'About {shop}', { shop: shopName })" :class="['tick', { still: still1 }]">
      <div class="tk-view">
        <div class="tk-track">
          <ul v-for="k in 2" :key="k" :aria-hidden="k === 2 ? 'true' : undefined" class="tk-list">
            <li v-for="(f, i) in facts1" :key="i">{{ f }}<span aria-hidden="true" class="tk-star">✳</span></li>
          </ul>
        </div>
      </div>
      <button :aria-label="still1 ? t('bakini.mk.home.tickPlay', 'Play the moving text') : t('bakini.mk.home.tickPause', 'Pause the moving text')" :aria-pressed="still1 ? 'true' : 'false'" class="tk-btn" type="button" @click="still1 = !still1">
        <nx-icon :name="still1 ? 'play' : 'pause'" />
      </button>
    </section>

    <!-- 2. the slider -->
    <section v-if="top.length" :aria-label="t('bakini.mk.home.thisWeek', 'This week at {shop}', { shop: shopName })" aria-roledescription="carousel" class="hero" @focusin="heroFocus" @focusout="heroBlur" @mouseenter="hold(true)" @mouseleave="heroLeave">
      <div class="wrap">
        <div id="stage" ref="stage" :class="['hero-stage', { run: running }]" @touchend="swipeEnd" @touchstart.passive="swipeStart">
          <div
            v-for="(r, i) in top"
            :key="r.c.id"
            :aria-hidden="i === cur ? undefined : 'true'"
            :aria-label="t('bakini.mk.home.slideOf', '{n} of {total}: {name}', { n: i + 1, total: top.length, name: catTitle(r.c) })"
            :class="['slide', { flip: i % 2 === 1, on: i === cur }]"
            aria-roledescription="slide"
            role="group"
          >
            <div class="sl-copy">
              <p class="kick">{{ fromLine(r) }}</p>
              <component :is="i === 0 ? 'h1' : 'h2'" class="sl-h"><bdi>{{ catTitle(r.c) }}</bdi></component>
              <p v-if="r.c.description" class="sl-p">{{ r.c.description }}</p>
              <router-link :tabindex="i === cur ? undefined : -1" :to="catTo(r.c)" class="btn">{{ t("bakini.mk.home.shopColl", "Shop {name}", { name: catTitle(r.c).toLowerCase() }) }}</router-link>
            </div>
            <div class="sl-ph">
              <mk-photo :alt="catTitle(r.c)" :file="heroFiles(r.c)[0]" :products="r.ps.slice(0, 3)" />
              <mk-photo :alt="catTitle(r.c)" :file="heroFiles(r.c)[1]" :products="r.ps.length > 3 ? r.ps.slice(3, 6) : r.ps.slice(0, 3)" />
            </div>
          </div>
        </div>
        <div v-if="top.length > 1" class="hero-ctl">
          <button :aria-label="t('bakini.mk.home.prev', 'Previous slide')" class="arr" type="button" @click="go(cur - 1)"><nx-icon name="left" /></button>
          <div class="tabs">
            <button v-for="(r, i) in top" :key="r.c.id" :aria-current="i === cur ? 'true' : undefined" :aria-label="t('bakini.mk.home.slideTab', 'Slide {n}: {name}', { n: i + 1, name: catTitle(r.c) })" class="tab" type="button" @click="go(i)">
              <span :key="i === cur ? tick : 'x'" class="tab-f"></span>
            </button>
          </div>
          <button :aria-label="playing ? t('bakini.mk.home.pause', 'Pause the slides') : t('bakini.mk.home.play', 'Play the slides')" :aria-pressed="playing ? 'false' : 'true'" class="arr play" type="button" @click="setPlay(!playing)">
            <nx-icon :name="playing ? 'pause' : 'play'" />
          </button>
          <button :aria-label="t('bakini.mk.home.next', 'Next slide')" class="arr" type="button" @click="go(cur + 1)"><nx-icon name="right" /></button>
        </div>
      </div>
    </section>

    <!-- 3. the collections -->
    <section v-if="ranked.length" aria-labelledby="ch-h" class="chips">
      <div class="wrap">
        <h2 id="ch-h" class="h2 sm">{{ t("bakini.mk.home.byColl", "Shop by collection") }}</h2>
        <ul class="ch-list">
          <li v-for="c in cats" :key="c.id">
            <router-link :to="catTo(c)">
              <span class="ch-c"><img v-if="tileImg(c)" :src="tileImg(c)" alt="" class="cut" loading="lazy" /></span>
              <span class="ch-t"><bdi>{{ catTitle(c) }}</bdi></span>
              <span v-if="fromOf(c) != null" class="ch-f">{{ t("bakini.mk.home.from", "from {price}", { price: money(fromOf(c)) }) }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <!-- 4. just added -->
    <nx-row v-if="newest.length" id="new" :sub="t('bakini.mk.home.newSub', 'The newest pieces from every collection.')" :title="t('bakini.mk.home.newH', 'Just added')" :items="newest.slice(0, 10)" />

    <!-- 5. one piece at a time -->
    <section v-if="duoProducts.length" aria-labelledby="duo-h" class="duo">
      <div class="wrap duo-in">
        <div class="duo-copy">
          <h2 id="duo-h" class="h2">{{ t("bakini.mk.home.duoH", "One piece at a time") }}</h2>
          <p class="lead">{{ duoLine }}</p>
          <router-link :to="allTo" class="btn">{{ t("bakini.mk.home.duoBtn", "Shop all pieces") }}</router-link>
        </div>
        <div class="duo-ph">
          <mk-photo :products="duoProducts.slice(0, 3)" file="mikio-duo-box.webp" />
          <mk-photo :products="duoProducts.slice(3, 6)" file="mikio-duo-table.webp" />
        </div>
      </div>
    </section>

    <!-- 6. three ways to get it -->
    <section v-if="ways.length" aria-labelledby="wy-h" class="ways">
      <div class="wrap">
        <div class="sec-hd">
          <h2 id="wy-h" class="h2">{{ waysTitle }}</h2>
          <p v-if="facts.gateway" class="lead">{{ t("bakini.mk.home.waysSub", "Choose at checkout. Every way is {pay}.", { pay: facts.gateway.name.toLowerCase() }) }}</p>
        </div>
        <ul class="wy-list">
          <li v-for="w in ways" :key="w.way.id">
            <router-link :to="w.to" class="wy">
              <mk-photo :file="w.file" :h="1200" :products="w.products" :w="1200" />
              <span class="wy-t"><bdi>{{ w.way.title }}</bdi></span>
              <span v-if="w.note" class="wy-n">{{ w.note }}</span>
              <span class="wy-f">{{ feeText(w.way) }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <!-- 7. good to know -->
    <section v-if="why.length" aria-labelledby="why-h" class="why">
      <div class="wrap">
        <h2 id="why-h" class="h2">{{ t("bakini.mk.home.whyH", "Good to know") }}</h2>
        <ul class="why-list">
          <li v-for="it in why" :key="it.key">
            <svg aria-hidden="true" class="why-i" focusable="false" viewBox="0 0 48 48" v-html="ART[it.key]"></svg>
            <h3 class="why-t">{{ it.title }}</h3>
            <p class="why-p">{{ it.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- 8. the collections strip -->
    <section v-if="cats.length" :aria-label="t('bakini.mk.home.collections', 'Collections')" :class="['tick', { still: still2 }]">
      <div class="tk-view">
        <div class="tk-track">
          <ul v-for="k in 2" :key="k" :aria-hidden="k === 2 ? 'true' : undefined" class="tk-list">
            <li v-for="c in cats" :key="c.id">
              <router-link :tabindex="k === 2 ? -1 : undefined" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link><span aria-hidden="true" class="tk-star">✳</span>
            </li>
          </ul>
        </div>
      </div>
      <button :aria-label="still2 ? t('bakini.mk.home.tickPlay', 'Play the moving text') : t('bakini.mk.home.tickPause', 'Pause the moving text')" :aria-pressed="still2 ? 'true' : 'false'" class="tk-btn" type="button" @click="still2 = !still2">
        <nx-icon :name="still2 ? 'play' : 'pause'" />
      </button>
    </section>

    <!-- 9. best sellers -->
    <nx-row v-if="best.length" id="best" :sub="t('bakini.mk.home.bestSub', 'The pieces ordered most often.')" :title="t('bakini.mk.home.bestH', 'Best sellers')" :items="best.slice(0, 10)" />

    <!-- 10. the two newest journal posts -->
    <section v-if="posts.length" :aria-label="t('bakini.mk.home.fromJournal', 'From the journal')" class="zig">
      <div v-for="(b, i) in posts.slice(0, 2)" :key="b.id" :class="['wrap', 'zg', { flip: i % 2 === 1 }]">
        <router-link :to="postTo(b)" aria-hidden="true" class="zg-ph" tabindex="-1"><img v-if="cover(b)" :src="cover(b)" alt="" decoding="async" loading="lazy" /></router-link>
        <div class="zg-copy">
          <p v-if="b.created_at" class="kick"><time :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time></p>
          <h2 class="h2">{{ b.title }}</h2>
          <p v-if="b.description" class="lead">{{ b.description }}</p>
          <router-link :to="postTo(b)" class="btn">{{ t("bakini.mk.home.readGuide", "Read the guide") }}</router-link>
        </div>
      </div>
    </section>

    <!-- 11. up close -->
    <section v-if="notes.length === 3" aria-labelledby="nt-h" class="notes">
      <div class="wrap nt-in">
        <h2 id="nt-h" class="h2">{{ t("bakini.mk.home.closeH", "Up close") }}</h2>
        <router-link v-for="(n, i) in notes" :key="n.p.id" :class="['note', 'n' + i]" :to="productTo(n.p)">
          <span class="nt-k"><span class="nt-th"><img :src="thumb(n.p)" alt="" class="cut" loading="lazy" /></span>{{ n.p.title }}</span>
          <span class="nt-q"><b>{{ n.pro[0] }}.</b> {{ n.pro[1] }}</span>
        </router-link>
      </div>
    </section>

    <!-- 12. the story -->
    <section aria-labelledby="st-h" class="story">
      <div class="wrap st-in">
        <mk-photo :h="1200" :products="best.slice(0, 3)" :w="1200" file="mikio-story.webp" />
        <div class="st-copy">
          <h2 id="st-h" class="h2">{{ storyTitle }}</h2>
          <p class="lead">{{ storyLine }}</p>
          <ul class="st-l">
            <li v-if="openLine"><nx-icon name="clock" /><span>{{ openLine }}</span></li>
            <li v-if="facts.phone"><nx-icon name="phone" /><a :href="tel" dir="ltr">{{ facts.phone }}</a></li>
            <li v-if="facts.email"><nx-icon name="mail" /><a :href="'mailto:' + facts.email">{{ facts.email }}</a></li>
          </ul>
          <router-link :to="aboutTo" class="btn">{{ t("bakini.mk.hdr.aboutUs", "About us") }}</router-link>
        </div>
      </div>
    </section>

    <!-- 13. the journal, last -->
    <section v-if="feed.length" aria-labelledby="jr-h" class="jr">
      <div class="wrap">
        <div class="sec-hd">
          <h2 id="jr-h" class="h2">{{ t("bakini.mk.home.fromJournal", "From the journal") }}</h2>
          <p class="lead">{{ t("bakini.mk.home.journalSub", "Guides to the collections, and plain answers about ordering.") }}</p>
        </div>
        <ul class="jr-list">
          <li v-for="b in feed" :key="b.id">
            <router-link :to="postTo(b)" class="post">
              <span class="p-th"><img v-if="cover(b)" :src="cover(b)" alt="" decoding="async" loading="lazy" /></span>
              <span v-if="b.created_at" class="p-m"><time :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time></span>
              <span class="p-t">{{ b.title }}</span>
            </router-link>
          </li>
        </ul>
        <div class="jr-more">
          <router-link :to="blogTo" class="btn ghost">{{ t("bakini.mk.home.allPosts", "All journal posts") }}</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NxIcon from "../bakini/noir/NxIcon.vue";
import NxRow from "../bakini/noir/NxRow.vue";
import MkPhoto from "./MkPhoto.vue";
import { heroFiles } from "./mikio-photos";
import { bySells, catImage, catTitle, catTo, fmtDate, loadNoir, money, noir, priceView, productImage, productTo, prosOf, shopFacts } from "../bakini/noir/noir";
import { catalogueRoute, dealsRoute, percentOff } from "../kalio/kalio-catalog";
import { journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { currentCurrency } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";

/* the "Good to know" line drawings (48 px, one stroke) */
const ART = {
  cash: '<rect x="6" y="14" width="36" height="21" rx="3"/><circle cx="24" cy="24.5" r="5"/><path d="M11 19.5v.1M37 29.5v.1M6 39h36"/>',
  guest: '<circle cx="24" cy="16" r="7"/><path d="M11 40c1.6-7.6 6.8-11.6 13-11.6S35.4 32.4 37 40"/><path d="m31 9 3 3 6-6"/>',
  window: '<circle cx="24" cy="25" r="15"/><path d="M24 16v9l6 4"/><path d="M18 5h12M24 5v5"/>',
};
const DUR = 6500;
const listOf = (items) => {
  try {
    return new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
};
const orOf = (items) => {
  try {
    return new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type: "disjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
};

export default {
  name: "MkHome",
  components: { NxIcon, NxRow, MkPhoto },
  data: () => ({ noir, posts: [], cur: 0, playing: true, held: false, hidden: false, tick: 0, still1: false, still2: false, x0: null, ART }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    facts() {
      return shopFacts(this.shop);
    },
    cats() {
      return this.noir.cats;
    },
    /* the collections by pieces sold (ties keep the shop's order), products best-selling first */
    ranked() {
      return this.cats
        .map((c, i) => {
          const ps = bySells(this.noir.products.filter((p) => p.category_id === c.id));
          return { c, i, ps, sold: ps.reduce((s, p) => s + (p.sells || 0), 0) };
        })
        .filter((r) => r.ps.length)
        .sort((a, b) => b.sold - a.sold || a.i - b.i);
    },
    top() {
      return this.ranked.slice(0, 3);
    },
    best() {
      return bySells(this.noir.products);
    },
    /* the newest piece of each collection in turn, so the rail mixes them */
    newest() {
      const lists = this.cats.map((c) => this.noir.products.filter((p) => p.category_id === c.id).sort((a, b) => b.id - a.id));
      const out = [];
      for (let r = 0; r < 50 && out.length < this.noir.products.length; r++) for (const l of lists) if (l[r]) out.push(l[r]);
      return out;
    },
    offs() {
      void this.currency;
      return this.noir.products.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
    },
    offShort() {
      if (!this.offs.length) return "";
      const max = Math.max(...this.offs);
      const every = this.offs.length === this.noir.products.length && Math.min(...this.offs) === max;
      return every ? t("bakini.mk.home.off", "{off}% off", { off: max }) : t("bakini.mk.hdr.offUpTo", "Up to {off}% off", { off: max });
    },
    offLong() {
      if (!this.offs.length) return "";
      const max = Math.max(...this.offs);
      const every = this.offs.length === this.noir.products.length && Math.min(...this.offs) === max;
      return every ? t("bakini.mk.hdr.offEvery", "{off}% off every piece", { off: max }) : t("bakini.mk.hdr.offUpTo", "Up to {off}% off", { off: max });
    },
    street() {
      return String(this.facts.address || "").split(",")[0].trim();
    },
    openLine() {
      const f = this.facts;
      if (!f.days.length && !f.hours) return "";
      if (f.everyDay) return f.hours ? t("bakini.mk.hdr.openEvery", "Open every day {hours}", { hours: f.hours }) : t("bakini.mk.hdr.openEveryNoHours", "Open every day");
      return f.hours ? t("bakini.mk.hdr.openDaysHours", "Open {days}, {hours}", { days: f.days.join(", "), hours: f.hours }) : t("bakini.mk.hdr.openDays", "Open {days}", { days: f.days.join(", ") });
    },
    tel() {
      return "tel:" + String(this.facts.phone || "").replace(/[^\d+]/g, "");
    },
    /* the moving strip: only what the shop's data says */
    facts1() {
      const f = this.facts;
      const out = [t("bakini.mk.home.byPiece", "Sold by the piece")];
      if (this.offLong) out.push(this.offLong);
      if (this.openLine) out.push(this.openLine);
      if (f.pickup && this.street) out.push(t("bakini.mk.hdr.pickupAt", "Pickup at {place}", { place: this.street }));
      if (f.courier) out.push(f.courier.distance ? t("bakini.mk.home.courierKm", "Courier within {km} km", { km: f.courier.distance }) : f.courier.title);
      if (f.shipping) out.push(t("bakini.mk.home.shipsWorld", "Ships worldwide"));
      if (f.gateway) out.push(f.gateway.name);
      return out;
    },
    collNames() {
      return this.cats.map((c) => catTitle(c).toLowerCase());
    },
    duoProducts() {
      return this.ranked.map((r) => r.ps[0]).concat(this.ranked.map((r) => r.ps[1])).filter(Boolean).slice(0, 6);
    },
    duoLine() {
      return t("bakini.mk.home.duoP", "Every piece is sold on its own: {names}. Add one of each, or six of one.", { names: listOf(this.collNames) });
    },
    /* the shop's delivery ways as photo tiles: courier, pickup, shipping (whichever it has) */
    ways() {
      const f = this.facts;
      const r = this.ranked;
      const pick = (i) => (r[i] ? r[i].ps.slice(0, 3) : this.best.slice(0, 3));
      const out = [];
      if (f.courier) out.push({ way: f.courier, file: "mikio-way-courier.webp", products: pick(0), note: this.courierNote(f.courier) });
      if (f.pickup) out.push({ way: f.pickup, file: "mikio-way-pickup.webp", products: pick(1), note: f.pickupNote ? f.pickupNote.replace(/(\d)\s*-\s*(\d)/g, "$1–$2") : "" });
      if (f.shipping) out.push({ way: f.shipping, file: "mikio-way-shipping.webp", products: pick(2), note: t("bakini.mk.home.shipNote", "Packed by the bakery and sent anywhere.") });
      return out.map((w) => ({ ...w, to: this.faqTo }));
    },
    waysTitle() {
      const n = this.ways.length;
      return n === 3 ? t("bakini.mk.home.ways3", "Three ways to get it") : n === 2 ? t("bakini.mk.home.ways2", "Two ways to get it") : t("bakini.mk.home.ways1", "How to get it");
    },
    why() {
      const f = this.facts;
      const out = [];
      if (f.gateway && f.gateway.cod) out.push({ key: "cash", title: t("bakini.mk.home.whyCash", "Pay on delivery"), text: t("bakini.mk.home.whyCashP", "Pay in cash when your order reaches you. No card is needed at checkout.") });
      if (this.guest) out.push({ key: "guest", title: t("bakini.mk.home.whyGuest", "No account needed"), text: t("bakini.mk.home.whyGuestP", "Check out as a guest with your name, phone and address.") });
      const wins = (f.courier?.windows || []).map((w) => String(w).toLowerCase());
      const slots = wins.filter((w) => w !== "instant");
      if (slots.length)
        out.push({
          key: "window",
          title: t("bakini.mk.home.whyWindow", "Pick a window"),
          text: wins.includes("instant") ? t("bakini.mk.home.whyWindowNow", "The courier comes in the {list}, or right away, every day.", { list: orOf(slots) }) : t("bakini.mk.home.whyWindowP", "The courier comes in the {list}, every day.", { list: orOf(slots) }),
        });
      return out;
    },
    guest() {
      try {
        return !!ShopOptionsHelper.HasGuestPayment(this.shop);
      } catch {
        return false;
      }
    },
    /* "Up close": the first reason to love the best seller of three more collections */
    notes() {
      const list = this.ranked.length > 3 ? this.ranked.slice(3) : this.ranked;
      const out = [];
      for (const r of list) {
        const p = r.ps[0];
        const pro = p && prosOf(p)[0];
        if (pro && pro[0]) out.push({ p, pro });
        if (out.length === 3) break;
      }
      return out;
    },
    storyTitle() {
      return this.facts.city ? t("bakini.mk.home.helloFrom", "Hello from {city}.", { city: this.facts.city }) : t("bakini.mk.home.hello", "Hello from the counter.");
    },
    storyLine() {
      const at = this.facts.address ? t("bakini.mk.home.storyAt", "{shop} is a pâtisserie counter at {address}.", { shop: this.shopName, address: this.facts.address }) : "";
      const sells = this.collNames.length ? t("bakini.mk.home.storySells", "It sells {names}, every one of them by the piece.", { names: listOf(this.collNames) }) : "";
      return [at, sells].filter(Boolean).join(" ");
    },
    feed() {
      const rest = this.posts.slice(2, 6);
      return rest.length >= 4 ? rest : this.posts.slice(0, 4);
    },
    running() {
      return this.playing && !this.held && !this.hidden && this.top.length > 1;
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    allTo() {
      return catalogueRoute({ sort: "newest" });
    },
    blogTo() {
      return journalRoute();
    },
    aboutTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
  },
  watch: {
    running() {
      this.restart();
    },
    "top.length"() {
      if (this.cur >= this.top.length) this.cur = 0;
      this.restart();
    },
  },
  created() {
    loadNoir();
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      this.playing = false;
      this.still1 = true;
      this.still2 = true;
    }
  },
  mounted() {
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = articles || []))
      .catch(() => (this.posts = []));
    this.onVis = () => {
      this.hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", this.onVis);
    this.onKey = (e) => {
      const hero = this.$el.querySelector?.(".hero");
      if (!hero || !hero.contains(document.activeElement) || document.activeElement.matches("input")) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const rtl = document.documentElement.dir === "rtl";
        this.go(this.cur + ((e.key === "ArrowRight") !== rtl ? 1 : -1));
      }
    };
    document.addEventListener("keydown", this.onKey);
    this.restart();
  },
  beforeUnmount() {
    clearTimeout(this.timer);
    document.removeEventListener("visibilitychange", this.onVis);
    document.removeEventListener("keydown", this.onKey);
  },
  methods: {
    t,
    money,
    catTitle,
    catTo,
    productTo,
    fmtDate,
    heroFiles,
    postTo(b) {
      return postRoute(b);
    },
    cover(b) {
      return b.image ? window.CDN.GET_SHOP_IMAGE_PATH(b.image, null) : null;
    },
    thumb(p) {
      return productImage(p, 128);
    },
    tileImg(c) {
      const r = this.ranked.find((x) => x.c.id === c.id);
      return r && r.ps[0] ? productImage(r.ps[0]) : catImage(c, 512);
    },
    fromOf(c) {
      void this.currency;
      const ps = this.noir.products.filter((p) => p.category_id === c.id);
      if (!ps.length) return null;
      return Math.min(...ps.map((p) => priceView(this.shop, p).now));
    },
    fromLine(r) {
      const from = this.fromOf(r.c);
      const parts = [];
      if (from != null) parts.push(t("bakini.mk.home.fromCap", "From {price}", { price: money(from) }));
      if (this.offShort) parts.push(this.offShort);
      return parts.join(" · ");
    },
    courierNote(w) {
      const wins = (w.windows || []).map((x) => String(x).toLowerCase());
      const where = w.distance ? t("bakini.mk.home.withinKm", "Within {km} km of the bakery", { km: w.distance }) : "";
      const when = wins.length ? t("bakini.mk.home.inWindows", "in the {list}", { list: orOf(wins.filter((x) => x !== "instant")) }) + (wins.includes("instant") ? t("bakini.mk.home.orNow", ", or right away") : "") : "";
      return [where, when].filter(Boolean).join(", ");
    },
    feeText(w) {
      if (w.fee > 0) return money(w.fee) + (w.freeOver ? " · " + t("bakini.mk.home.freeOver", "free over {amount}", { amount: money(w.freeOver, true) }) : "");
      return t("bakini.n.co.free", "Free");
    },
    /* the slider */
    go(n) {
      const N = this.top.length;
      if (!N) return;
      this.cur = (n + N) % N;
      this.restart();
    },
    restart() {
      clearTimeout(this.timer);
      this.tick++;
      if (this.running) this.timer = setTimeout(() => this.go(this.cur + 1), DUR);
    },
    setPlay(p) {
      this.playing = p;
      this.restart();
    },
    hold(v) {
      this.held = v;
    },
    heroLeave() {
      const a = document.activeElement;
      this.held = !!(a && this.$el.querySelector(".hero")?.contains(a) && a.matches(":focus-visible"));
    },
    heroFocus(e) {
      if (e.target.matches && e.target.matches(":focus-visible")) this.held = true;
    },
    heroBlur() {
      setTimeout(() => {
        const hero = this.$el.querySelector?.(".hero");
        if (hero && !hero.contains(document.activeElement)) this.held = false;
      }, 0);
    },
    swipeStart(e) {
      this.x0 = e.touches[0].clientX;
    },
    swipeEnd(e) {
      if (this.x0 == null) return;
      const dx = e.changedTouches[0].clientX - this.x0;
      this.x0 = null;
      const rtl = document.documentElement.dir === "rtl";
      if (Math.abs(dx) > 40) this.go(this.cur + ((dx < 0) !== rtl ? 1 : -1));
    },
  },
};
</script>
