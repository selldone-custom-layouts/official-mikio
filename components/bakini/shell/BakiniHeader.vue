<!--
  Mikio Ticker — the header (mikio-design/nx/core.js ann(), header(),
  megaHTML(), searchHTML(), pmenuHTML(); the home draws the same in
  m/home.js), laid out like milkbarstore.com's:

  - a black announcement bar: the shop's live facts (the saving every piece
    has, the free-shipping threshold, the payment way) with "Shop now", and
    the language & currency pill at its right end;
  - a white bar that sticks: the menu button and "Visit us" (the pickup
    counter: street, days and hours, phone, directions) on the left, the
    wordmark (the shop's live title) in the centre, search, account and the
    bag with its count on the right;
  - a centred nav row (from 1100px): "Shop ⌄" (every collection with its best
    seller's photo, "Shop all", and a two-colour strip: pickup and the
    saving), the collections themselves and Journal. The Shop menu opens on
    hover too; a click right after the hover keeps it open.

  Every panel opens on a click and closes on a second click, Esc, a click
  outside or a page change (noir.ts layers); the menu, the bag and the
  language sheet add the scrim. Phones: the menu button, Visit us, the
  wordmark (never lost), search and the bag; the menu panel holds the
  collections (the first 6, "Show N more" past 8), the shop's pages and the
  "Language & currency" row (a bottom sheet). No bottom tab bar. A shop with
  custom header code keeps Selldone's header (StorefrontLayout).
-->
<template>
  <div v-if="!$store.getters.getIsNative" class="nx nx-hdrwrap">
    <a class="skip" href="#main" @click.prevent="skip">{{ t("bakini.n.hdr.skip", "Skip to content") }}</a>
    <div class="ann">
      <div class="ann-in">
        <p class="ann-msg">
          <template v-for="(m, i) in annMsgs" :key="i"
            ><span v-if="i" :class="['ann-dot', 'd' + i]" aria-hidden="true"></span><span :class="'am' + i">{{ m }}</span></template
          >
          <router-link :to="dealsTo" class="ann-go">{{ t("bakini.mk.hdr.shopNow", "Shop now") }}</router-link>
        </p>
        <button
          v-if="regionOn"
          :key="regionKey"
          :aria-expanded="is('region') ? 'true' : 'false'"
          :aria-label="t('bakini.n.hdr.regionAria', 'Language and currency: {value}', { value: regionLabel })"
          aria-controls="region"
          class="reg rs-pick__btn"
          type="button"
          @click="toggle('region', $event)"
        >
          <nx-icon name="globe" /><span>{{ regionLabel }}</span>
        </button>
        <div v-if="regionOn" id="region" :aria-label="t('region.title', 'Language & currency')" :class="['dd', 'pop', 'reg-pop', 'rs-pop', { open: is('region') }]" role="dialog">
          <p class="pop-h">{{ regionTitle }}</p>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p class="pop-note">{{ regionNote }}</p>
        </div>
      </div>
    </div>
    <header id="hdr" class="hdr">
      <div class="hdr-in">
        <div class="h-l">
          <button
            :aria-expanded="is('pmenu') ? 'true' : 'false'"
            :aria-label="t('bakini.n.hdr.menu', 'Menu')"
            aria-controls="pmenu"
            class="ibtn menu-btn"
            type="button"
            @click="toggle('pmenu', $event)"
          >
            <nx-icon name="menu" />
          </button>
          <template v-if="facts.address">
            <button
              :aria-expanded="is('dd-visit') ? 'true' : 'false'"
              :aria-label="t('bakini.mk.hdr.visitAria', 'Visit the counter')"
              aria-controls="dd-visit"
              class="ibtn visit"
              type="button"
              @click="toggle('dd-visit', $event)"
            >
              <nx-icon name="pin" /><span class="vl">{{ t("bakini.mk.hdr.visit", "Visit us") }}</span>
            </button>
            <div id="dd-visit" :class="['dd', 'pop', 'visit-pop', { open: is('dd-visit') }]" role="dialog" :aria-label="t('bakini.mk.hdr.visitAria', 'Visit the counter')">
              <p class="pop-k"><bdi>{{ facts.pickup ? facts.pickup.title : facts.title }}</bdi></p>
              <p class="pop-t"><bdi>{{ street }}</bdi><br /><bdi>{{ cityLine }}</bdi></p>
              <ul class="pop-l">
                <li v-if="openLine"><nx-icon name="clock" /><span>{{ openLine }}</span></li>
                <li v-if="facts.phone"><nx-icon name="phone" /><a :href="tel" dir="ltr">{{ facts.phone }}</a></li>
              </ul>
              <a v-if="mapUrl" :href="mapUrl" class="btn sm" rel="noopener" target="_blank">{{ t("bakini.mk.hdr.directions", "Get directions") }}</a>
            </div>
          </template>
        </div>
        <bakini-logo />
        <div class="h-r">
          <button :aria-expanded="is('srch') ? 'true' : 'false'" :aria-label="t('bakini.n.hdr.search', 'Search')" aria-controls="srch" class="ibtn" type="button" @click="toggle('srch', $event)">
            <nx-icon name="search" />
          </button>
          <button :aria-label="user ? t('bakini.mk.hdr.accountOf', 'Account: {name}', { name: firstName }) : t('bakini.n.hdr.signIn', 'Sign in')" class="ibtn acct" type="button" @click="account">
            <nx-icon name="user" />
          </button>
          <button
            :aria-expanded="is('drawer') ? 'true' : 'false'"
            :aria-label="t('bakini.n.hdr.bagAria', { one: 'Bag, {n} piece', other: 'Bag, {n} pieces' }, { n: units })"
            aria-controls="drawer"
            class="ibtn bag-btn"
            type="button"
            @click="toggle('drawer', $event)"
          >
            <nx-icon name="bag" /><span :data-n="units" class="count">{{ units > 99 ? "99+" : units }}</span>
          </button>
        </div>
      </div>
      <nav :aria-label="t('bakini.mk.hdr.main', 'Main')" class="nav">
        <ul>
          <li class="has-dd" @mouseenter="hoverShop">
            <button :aria-expanded="is('dd-shop') ? 'true' : 'false'" aria-controls="dd-shop" class="nav-a" type="button" @click="clickShop($event)">
              {{ t("bakini.n.hdr.shop", "Shop") }}<nx-icon cls="chev" name="down" />
            </button>
          </li>
          <li v-for="c in cats" :key="c.id">
            <router-link :aria-current="c.name === currentCat ? 'page' : undefined" :to="catTo(c)" class="nav-a"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </li>
          <li>
            <router-link :aria-current="onJournal ? 'page' : undefined" :to="blogTo" class="nav-a">{{ t("bakini.n.hdr.journal", "Journal") }}</router-link>
          </li>
        </ul>
      </nav>
      <!-- Shop: every collection with its best seller's photo, "Shop all", and the strip. -->
      <div id="dd-shop" :aria-label="t('bakini.n.hdr.shopCollections', 'Shop the collections')" :class="['dd', 'mega', { open: is('dd-shop') }]" role="region" @mouseleave="leaveShop">
        <ul class="mg-list">
          <li v-for="c in cats" :key="c.id">
            <router-link :to="catTo(c)">
              <span class="mg-th"><img v-if="topImg(c)" :src="topImg(c)" alt="" class="cut" loading="lazy" /></span><span class="mg-t"><bdi>{{ catTitle(c) }}</bdi></span>
            </router-link>
          </li>
          <li>
            <router-link :to="allTo">
              <span class="mg-th all"><img v-for="src in allImgs" :key="src" :src="src" alt="" class="cut" loading="lazy" /></span><span class="mg-t">{{ t("bakini.mk.hdr.shopAll", "Shop all") }}</span>
            </router-link>
          </li>
        </ul>
        <div class="mg-strip">
          <a v-if="mapUrl && facts.pickup" :href="mapUrl" class="mg-a" rel="noopener" target="_blank">{{ pickupLine }}</a>
          <router-link v-else :to="aboutTo" class="mg-a">{{ t("bakini.mk.hdr.aboutUs", "About us") }}</router-link>
          <router-link :to="dealsTo" class="mg-b"><span>{{ offLine }}</span><span class="mg-go">{{ t("bakini.mk.hdr.shopNow", "Shop now") }}</span></router-link>
        </div>
      </div>
      <!-- Search: suggestions while typing (the live catalogue); Enter opens every result. -->
      <div id="srch" :class="['srch', { open: is('srch') }]" role="search">
        <div class="srch-in">
          <form class="srch-f" @submit.prevent="submit()">
            <nx-icon name="search" />
            <input
              ref="q"
              :aria-label="t('bakini.mk.hdr.searchLabel', 'Search the shop')"
              :placeholder="t('bakini.n.hdr.searchPh', 'Search {examples}…', { examples: searchExamples })"
              :value="q"
              autocomplete="off"
              enterkeyhint="search"
              type="search"
              @input="q = $event.target.value"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
            />
            <button :aria-label="t('bakini.mk.hdr.closeSearch', 'Close search')" class="ibtn x" type="button" @click="closeLayer()"><nx-icon name="close" /></button>
          </form>
          <div class="srch-out">
            <p v-if="!query" class="srch-hint">
              {{ t("bakini.n.hdr.popular", "Popular") }}:
              <router-link v-for="w in popular" :key="w" :to="searchTo(w)" class="chip">{{ w }}</router-link>
            </p>
            <template v-else>
              <p v-if="sugCats.length" class="srch-hint">
                <router-link v-for="c in sugCats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
              </p>
              <ul v-if="hits.length" class="srch-list" role="listbox">
                <li v-for="(p, i) in hits" :key="p.id">
                  <router-link :class="{ hl: i === cursor }" :to="productTo(p)" role="option">
                    <span class="th"><img :src="thumb(p)" alt="" class="cut" /></span>
                    <span class="tx"><b v-html="mark(p.title)"></b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("bakini.n.card.per", "per {unit}", { unit: unitOf(p) }) }}</small></span>
                    <span class="pr money">{{ money(priceView(shop, p).now) }}</span>
                  </router-link>
                </li>
              </ul>
              <p v-if="!hits.length && !sugCats.length" class="srch-hint">{{ t("bakini.n.hdr.noMatch", "Nothing matches “{q}”. Try another word.", { q: query }) }}</p>
              <p v-else class="srch-all">
                <router-link :to="searchTo(query)" class="rl-more">{{ t("bakini.n.hdr.allFor", "See every result for “{q}”", { q: query }) }}<nx-icon name="arrow" /></router-link>
              </p>
            </template>
          </div>
        </div>
      </div>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="nx nx-layers">
        <!-- The menu panel (every width): collections, the shop's pages, Language & currency, the counter. -->
        <nav id="pmenu" :aria-label="t('bakini.n.hdr.menu', 'Menu')" :class="['panel', 'menu', { open: is('pmenu') }]">
          <div class="pn-hd">
            <span class="pn-t">{{ t("bakini.n.hdr.menu", "Menu") }}</span>
            <button :aria-label="t('bakini.n.hdr.closeMenu', 'Close menu')" class="ibtn x" type="button" @click="closeLayer()"><nx-icon name="close" /></button>
          </div>
          <ul class="mn-big">
            <li>
              <router-link :to="allTo"><span class="th all"><nx-icon name="bag" /></span><span>{{ t("bakini.mk.hdr.shopAll", "Shop all") }}</span></router-link>
            </li>
            <li v-for="c in menuFirst" :key="c.id">
              <router-link :to="catTo(c)"><span class="th"><img v-if="topImg(c)" :src="topImg(c)" alt="" class="cut" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span></router-link>
            </li>
            <template v-if="menuRest.length && moreOpen">
              <li v-for="c in menuRest" :key="c.id">
                <router-link :to="catTo(c)"><span class="th"><img v-if="topImg(c)" :src="topImg(c)" alt="" class="cut" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span></router-link>
              </li>
            </template>
            <li v-if="menuRest.length">
              <button :aria-expanded="moreOpen ? 'true' : 'false'" class="mn-more" type="button" @click="moreOpen = !moreOpen">
                <span class="th all"><nx-icon :name="moreOpen ? 'minus' : 'down'" /></span><span>{{ moreOpen ? t("bakini.n.hdr.fewer", "Show fewer") : t("bakini.n.hdr.more", "Show {n} more", { n: menuRest.length }) }}</span>
              </button>
            </li>
          </ul>
          <ul class="mn-small">
            <li><router-link :to="blogTo">{{ t("bakini.n.hdr.journal", "Journal") }}</router-link></li>
            <li><router-link :to="faqTo">{{ t("bakini.mk.hdr.faq", "FAQ") }}</router-link></li>
            <li><router-link :to="contactTo">{{ t("bakini.mk.hdr.contact", "Contact us") }}</router-link></li>
            <li><router-link :to="aboutTo">{{ t("bakini.mk.hdr.aboutUs", "About us") }}</router-link></li>
            <li v-if="user"><router-link :to="accountTo">{{ t("bakini.mk.hdr.yourAccount", "Your account") }}</router-link></li>
            <li v-else><button class="mn-link" type="button" @click="signIn">{{ t("bakini.n.hdr.signIn", "Sign in") }}</button></li>
          </ul>
          <button v-if="regionOn" :key="regionKey" aria-controls="langsheet" class="mn-reg rs-row" type="button" @click="openLayer('langsheet', $event.currentTarget)">
            <nx-icon name="globe" /><span>{{ t("region.title", "Language & currency") }}</span><b>{{ regionLabel }}</b>
          </button>
          <ul class="mn-info">
            <li v-if="openLine"><nx-icon name="clock" /><span>{{ openLine }}</span></li>
            <li v-if="facts.address"><nx-icon name="pin" /><span><bdi>{{ facts.address }}</bdi></span></li>
            <li v-if="facts.phone"><nx-icon name="phone" /><a :href="tel" dir="ltr">{{ facts.phone }}</a></li>
          </ul>
        </nav>

        <!-- The language & currency sheet (from the menu panel). -->
        <div v-if="regionOn" id="langsheet" :aria-label="t('region.title', 'Language & currency')" :class="['bsheet', 'rs-sheet', { open: is('langsheet') }]" aria-modal="true" role="dialog">
          <div class="grab"></div>
          <h2>{{ t("region.title", "Language & currency") }}</h2>
          <region-chips :key="regionKey" />
          <p class="pop-note">{{ regionNote }}</p>
          <button class="btn block" type="button" @click="closeLayer()">{{ t("region.done", "Done") }}</button>
        </div>

        <div :class="['scrim', { open: scrim }]" @click="closeLayer()"></div>
        <nx-bag-drawer />
        <nx-quick />
      </div>
    </teleport>
  </div>
</template>

<script>
import BakiniLogo from "../BakiniLogo.vue";
import NxIcon from "../noir/NxIcon.vue";
import NxBagDrawer from "../noir/NxBagDrawer.vue";
import NxQuick from "../noir/NxQuick.vue";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, languages, regionLabel, regionState, showLanguages } from "../../region-switcher/region";
import {
  bySells,
  catImage,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  hueOf,
  isModal,
  layer,
  loadNoir,
  money,
  noir,
  openLayer,
  priceView,
  productImage,
  productTo,
  shopFacts,
  toggleLayer,
  unitOf,
  wireLayers,
} from "../noir/noir";
import { percentOff } from "../../kalio/kalio-catalog";
import { t } from "../../kalio/i18n/kalio-i18n";

/* Words that say nothing about a pastry, left out of "Popular". */
const STOP = new Set(["and", "with", "the", "of", "a", "an", "in", "on", "mini", "classic", "double", "cake", "cakes"]);

export default {
  name: "BakiniHeader", // Mikio Ticker's header (kept under Bakini's name: StorefrontLayout and the checks read it)
  components: { BakiniLogo, NxIcon, NxBagDrawer, NxQuick, RegionChips },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ q: "", cursor: -1, moreOpen: false, popPos: { region: {}, acct: {} }, layer, noir, region: regionState, hoverAt: 0 }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    user() {
      return this.$store.getters.getUser;
    },
    firstName() {
      return String(this.user?.name || "").split(/\s+/)[0].slice(0, 16);
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    cats() {
      return this.noir.cats;
    },
    currentCat() {
      return this.$route?.params?.category_name || null;
    },
    onDeals() {
      return !!this.$route?.query?.filter && /only_has_discount/.test(String(this.$route.query.filter)) && !this.currentCat;
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    scrim() {
      return !!this.layer.open && isModal(this.layer.open);
    },
    /* The region package reads its words when it draws. */
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    regionLabel() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return regionLabel();
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    regionLong() {
      void this.region.currency;
      const lang = languages().find((l) => l.code === currentLanguage());
      return [lang?.title, currentCurrency()].filter(Boolean).join(" · ");
    },
    regionNote() {
      void this.shop;
      const lang = languages().find((l) => l.code === currentLanguage());
      if (currencies().length <= 1 && !showLanguages())
        return t("bakini.n.hdr.sellsIn", "{shop} sells in {language} and in {currency}.", { shop: this.shop?.title || "", language: lang?.title || "", currency: currentCurrency() });
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    /* The shop's own facts (address, days, the counter's hours, delivery ways, payment). */
    facts() {
      return shopFacts(this.shop);
    },
    street() {
      return String(this.facts.address || "").split(",")[0].trim();
    },
    cityLine() {
      return [this.facts.city, [this.facts.region, this.facts.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
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
    mapUrl() {
      const l = this.facts.location;
      return l ? "https://www.google.com/maps/search/?api=1&query=" + l.lat + "%2C" + l.lng : "";
    },
    pickupLine() {
      return [t("bakini.mk.hdr.pickupAt", "Pickup at {place}", { place: this.street }), this.openLine].filter(Boolean).join(" · ");
    },
    /* "25% off every piece", or "Up to 25% off", from the live catalogue; "" without offers. */
    offLine() {
      const offs = this.noir.products.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
      if (!offs.length) return "";
      const max = Math.max(...offs);
      const every = offs.length === this.noir.products.length && Math.min(...offs) === max;
      return every ? t("bakini.mk.hdr.offEvery", "{off}% off every piece", { off: max }) : t("bakini.mk.hdr.offUpTo", "Up to {off}% off", { off: max });
    },
    annMsgs() {
      const f = this.facts;
      const free = f.shipping && f.shipping.freeOver ? t("bakini.mk.hdr.freeOver", "Free shipping over {amount}", { amount: money(f.shipping.freeOver, true) }) : "";
      return [this.offLine, free, f.gateway ? f.gateway.name : ""].filter(Boolean);
    },
    /* the collections by pieces sold, each with its products best-selling first */
    ranked() {
      return this.cats
        .map((c, i) => {
          const ps = bySells(this.noir.products.filter((p) => p.category_id === c.id));
          return { c, i, ps, sold: ps.reduce((s, p) => s + (p.sells || 0), 0) };
        })
        .sort((a, b) => b.sold - a.sold || a.i - b.i);
    },
    allImgs() {
      return this.ranked.slice(0, 3).map((r) => (r.ps[0] ? productImage(r.ps[0]) : catImage(r.c, 512))).filter(Boolean);
    },
    onJournal() {
      return /blog|journal/i.test(String(this.$route?.name || ""));
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    menuFirst() {
      return this.cats.length <= 8 ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    /* "Up to 25% off every pastry", from the live deals. */
    dealsLine() {
      const offs = this.noir.products.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
      if (!offs.length) return t("bakini.n.hdr.dealsNone", "Offers when there are some");
      const max = Math.max(...offs);
      const every = offs.length === this.noir.products.length && Math.min(...offs) === max;
      return every ? t("bakini.n.hdr.dealsEvery", "{off}% off every piece right now", { off: max }) : t("bakini.n.hdr.dealsUpTo", "Up to {off}% off right now", { off: max });
    },
    /* "Popular": the words most products share (flavours), from the live catalogue. */
    popular() {
      const count = new Map();
      const catWords = new Set(this.cats.flatMap((c) => catTitle(c).toLowerCase().split(/\s+/)).concat(this.cats.flatMap((c) => catTitle(c).toLowerCase().replace(/s$/, "").split(/\s+/))));
      for (const p of this.noir.products) {
        const seen = new Set();
        for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
          const k = w.toLowerCase();
          if (k.length < 4 || STOP.has(k) || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
          seen.add(k);
          count.set(k, (count.get(k) || 0) + 1);
        }
      }
      return [...count.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    },
    searchExamples() {
      return this.cats.slice(0, 2).map((c) => catTitle(c).toLowerCase()).concat(this.popular.length ? [] : []).join(", ") || t("bakini.n.hdr.pastries", "pastries");
    },
    query() {
      return this.q.trim();
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.noir.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    sugCats() {
      const q = this.query.toLowerCase();
      return q ? this.cats.filter((c) => catTitle(c).toLowerCase().includes(q)) : [];
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    /* every piece, newest first ("Shop all"); the offers stay on dealsTo */
    allTo() {
      return catalogueRoute({ sort: "newest" });
    },
    lovedTo() {
      return catalogueRoute({ sort: "most_sales" });
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    blogTo() {
      return journalRoute();
    },
    aboutTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US };
    },
    contactTo() {
      return { name: this.r.SHOP_CONTACT_US };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    addressesTo() {
      return { name: this.r.USER_ADDRESSES_PAGE };
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "srch") this.$nextTick(() => setTimeout(() => this.$refs.q?.focus({ preventScroll: true }), 60));
      if (id === "region" || id === "acct") this.$nextTick(() => this.place(id));
      if (id !== "pmenu") this.moreOpen = false;
    },
    query() {
      this.cursor = -1;
    },
  },

  created() {
    loadNoir();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "region" || this.layer.open === "acct") this.place(this.layer.open);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    /* The hover-opened Shop menu closes when the pointer leaves the nav item and the menu. */
    this.onOver = (e) => {
      if (this.layer.open !== "dd-shop" || !window.matchMedia?.("(hover: hover)")?.matches) return;
      if (!e.target.closest || !e.target.closest(".has-dd, #dd-shop")) closeLayer(true);
    };
    document.addEventListener("mouseover", this.onOver, { passive: true });
    /* Any part of the page can open the bag. */
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("mouseover", this.onOver);
    EventBus.$off("bakini:open-cart", this.openBag);
  },

  methods: {
    t,
    money,
    priceView,
    catTitle,
    catTo,
    catOf,
    hueOf,
    unitOf,
    productTo,
    openLayer,
    closeLayer,
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    catImg(c) {
      return catImage(c, 512);
    },
    /* a collection's photo: its best seller's cut-out, else the collection's own image */
    topImg(c) {
      const r = this.ranked.find((x) => x.c.id === c.id);
      return r && r.ps[0] ? productImage(r.ps[0]) : catImage(c, 512);
    },
    /* desktop: the Shop menu opens on hover; a click right after the hover keeps it open */
    hoverShop(e) {
      if (!window.matchMedia?.("(hover: hover)")?.matches || this.layer.open === "dd-shop") return;
      openLayer("dd-shop", e.currentTarget.querySelector("button"));
      this.hoverAt = Date.now();
    },
    clickShop(e) {
      if (this.layer.open === "dd-shop" && Date.now() - this.hoverAt < 700) return;
      this.toggle("dd-shop", e);
    },
    leaveShop() {},
    account() {
      if (this.user) this.$router.push(this.accountTo);
      else this.signIn();
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* Under the button, its right edge on the button's, never within 12px of an edge. */
    place(id) {
      const btn = document.querySelector(`[aria-controls="${id}"]`);
      const el = this.$refs[id];
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 320;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
      this.popPos[id] = { top: `${r.bottom + 10}px`, left: `${left}px` };
    },
    mark(title) {
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      let out = esc(title);
      for (const w of this.query.split(/\s+/).filter(Boolean)) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>");
      return out;
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      this.cursor = (this.cursor + d + n) % n;
    },
    searchTo(q) {
      return { name: this.r.SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        return;
      }
      const text = this.query;
      closeLayer(true);
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
    signIn() {
      closeLayer(true);
      EventBus.$emit("need-login", true);
    },
    signOut() {
      closeLayer(true);
      try {
        this.Logout(() => {});
      } catch (e) {
        window.$storefront?.user?.logout?.();
      }
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
  },
};
</script>
