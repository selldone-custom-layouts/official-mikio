<!--
  Mikio Ticker — the shop pages that list pieces (mikio-design/nx/pages-shop.js
  listingPage(): category-a, search-a, deals-a), laid out like
  milkbarstore.com's collection page:

  - a collection opens on the home's two-photo hero for that collection
    (MkPhoto: the shop's photo, or its best sellers' cut-outs) with the
    "from" price, its name and its own description; search and Shop all
    open on a short centred head (the search box; the saving every piece
    has);
  - a slim bar: the breadcrumb on the left, Filter and Sort on the right;
    Shop all and search add the collections as tabs;
  - the grid of the home's cards, five across on wide screens, with one dark
    band after the first full row (how paying works) when nothing is
    filtered;
  - then "How it works", the delivery questions and more collections
    (MkBands).

  The filters (Noir's, the coordinator's rule of 12 November 2026) open in a
  side panel at every width: a spec key becomes a filter only when the list
  has two or more short values for it (28 characters at most), plus Price (a
  two-thumb range with short boxes) and "On offer". Nothing is invented.
  Sort: Featured, Best sellers, Customer review, Price low to high and high
  to low, Newest (Shop all: Biggest saving first). Every change dims the
  cards, shows "Updating results…" and fades the new ones up in steps
  (nothing moves with reduced motion).
-->
<template>
  <div class="nx nx-listing">
    <div class="lt">
      <!-- The head -->
      <section v-if="kind === 'category'" aria-labelledby="lh-h" class="lh">
        <div class="wrap lh-in">
          <div class="lh-ph">
            <mk-photo :alt="catTitle(cat)" :file="heroFiles(cat)[0]" :products="byBest.slice(0, 3)" />
            <mk-photo :alt="catTitle(cat)" :file="heroFiles(cat)[1]" :products="byBest.length > 3 ? byBest.slice(3, 6) : byBest.slice(0, 3)" />
          </div>
          <div class="lh-copy">
            <p v-if="fromKick" class="kick">{{ fromKick }}</p>
            <h1 id="lh-h" class="lh-h"><bdi>{{ catTitle(cat) || categoryName }}</bdi></h1>
            <p v-if="cat && cat.description" class="lh-p">{{ cat.description }}</p>
          </div>
        </div>
      </section>
      <section v-else-if="kind === 'search'" class="sh">
        <div class="wrap sh-in">
          <h1 class="lh-h">{{ t("bakini.n.ls.search", "Search") }}</h1>
          <form class="srch-f sh-f" role="search" @submit.prevent="submitSearch">
            <nx-icon name="search" />
            <input :aria-label="t('bakini.mk.hdr.searchLabel', 'Search the shop')" :value="q" autocomplete="off" enterkeyhint="search" type="search" @input="q = $event.target.value" />
            <button class="btn sm" type="submit">{{ t("bakini.n.ls.search", "Search") }}</button>
          </form>
          <p v-if="base.length" class="sh-sum">{{ t("bakini.n.ls.resultsFor", "Results for") }}{{ " " }}<b>“{{ search }}”</b></p>
        </div>
      </section>
      <section v-else class="sh">
        <div class="wrap sh-in">
          <p v-if="kind === 'deals'" class="kick">{{ t("bakini.mk.ls.noCodes", "No codes · no timers") }}</p>
          <h1 class="lh-h">{{ allHead }}</h1>
          <p class="lh-p">{{ kind === "deals" ? t("bakini.mk.ls.dealsLine", "The saving is already in every price. Biggest dollar saving first.") : t("bakini.mk.ls.allLine", "Every collection in one place, sold one by one.") }}</p>
        </div>
      </section>

      <!-- Nothing found (search) -->
      <template v-if="kind === 'search' && ready && !base.length">
        <div class="wrap sh-empty">
          <div class="empty">
            <span class="ec"><nx-icon name="search" /></span>
            <h3>{{ t("bakini.mk.ls.noMatchT", "Nothing matches “{q}”", { q: search }) }}</h3>
            <p>{{ noMatchLine }}</p>
            <div class="acts">
              <router-link v-for="c in noir.cats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
            </div>
          </div>
        </div>
        <nx-row id="sr-best" :items="loved" :sub="t('bakini.mk.home.bestSub', 'The pieces ordered most often.')" :title="t('bakini.mk.home.bestH', 'Best sellers')" />
        <mk-bands more />
      </template>

      <template v-else>
        <!-- The bar: breadcrumb, Filter, Sort -->
        <div class="wrap lt-bar">
          <nav :aria-label="t('bakini.n.ls.crumbs', 'Breadcrumb')" class="crumbs">
            <router-link :to="{ path: '/' }">{{ t("bakini.n.ls.home", "Home") }}</router-link><span aria-hidden="true" class="sep">/</span><span aria-current="page"><bdi>{{ crumb }}</bdi></span>
          </nav>
          <div class="lt-tools">
            <button :aria-expanded="isOpen('fpanel') ? 'true' : 'false'" aria-controls="fpanel" class="tool" type="button" @click="openPanel($event)">
              <nx-icon name="filter" />{{ t("bakini.n.ls.filter", "Filter") }}<span v-if="active.length" class="fcount">{{ active.length }}</span>
            </button>
            <div ref="sortw" class="sortw">
              <button :aria-expanded="sortOpen ? 'true' : 'false'" aria-haspopup="listbox" class="tool" type="button" @click="sortOpen = !sortOpen">
                <span>{{ t("bakini.n.ls.sortBy", "Sort:") }}{{ " " }}<b>{{ sortLabel }}</b></span><nx-icon name="down" />
              </button>
              <div :aria-label="t('bakini.n.ls.sort', 'Sort')" :class="['sortmenu', { open: sortOpen }]" role="listbox">
                <button v-for="s in sorts" :key="s[0]" :aria-selected="s[0] === sort ? 'true' : 'false'" role="option" type="button" @click="setSort(s[0])">
                  {{ s[1] }}<nx-icon name="check" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="kind !== 'category' && tabCats.length > 1" :aria-label="t('bakini.mk.ls.collections', 'Collections')" class="wrap lt-tabs" role="group">
          <button :aria-pressed="tab === 'all' ? 'true' : 'false'" class="chip" type="button" @click="setTab('all')">{{ t("bakini.n.ls.all", "All") }}</button>
          <button v-for="c in tabCats" :key="c.id" :aria-pressed="tab === c.id ? 'true' : 'false'" class="chip" type="button" @click="setTab(c.id)"><bdi>{{ catTitle(c) }}</bdi></button>
        </div>
        <div v-if="active.length" class="wrap lt-active">
          <button v-for="a in active" :key="a.id" :aria-label="t('bakini.mk.ls.removeFilter', 'Remove filter {name}', { name: a.label })" class="chip on" type="button" @click="a.clear()">{{ a.label }}<nx-icon name="close" /></button>
        </div>
        <div aria-live="polite" class="wrap upd-slot">
          <span v-if="busy" class="updating"><span class="spin"></span>{{ t("bakini.n.ls.updating", "Updating results…") }}</span>
        </div>

        <!-- The grid -->
        <div class="wrap lt-main">
          <ul ref="grid" :class="['lg-grid', { dim: busy }]">
            <template v-if="ready">
              <template v-for="(p, i) in shown" :key="p.id + '-' + drawn">
                <li v-if="band && i === bandAt" class="lg-tile">
                  <p class="kick">{{ facts.gateway.name }}</p>
                  <p class="lg-tile-h">{{ facts.gateway.cod ? t("bakini.mk.ls.bandCod", "Pick a window. Pay when it arrives.") : t("bakini.mk.ls.bandPay", "Pick a window. Pay your way.") }}</p>
                  <a class="btn sm" href="#how" @click.prevent="toHow">{{ t("bakini.mk.ls.howWorks", "How it works") }}</a>
                </li>
                <nx-card :class="{ 'fade-up': animate && i < 12 }" :product="p" :style="animate && i < 12 ? { animationDelay: i * 25 + 'ms' } : null" look tag="li" />
              </template>
            </template>
            <template v-else>
              <li v-for="n in 10" :key="n" aria-hidden="true" class="pc nx-skel"><div class="pc-img"></div><div class="pc-b"><i></i><i></i><i></i></div></li>
            </template>
          </ul>
          <div v-if="ready && !shown.length" class="empty">
            <span class="ec"><nx-icon name="search" /></span>
            <h3>{{ t("bakini.mk.ls.noneT", "Nothing matches these filters") }}</h3>
            <p>{{ t("bakini.mk.ls.noneP", "Loosen the price range or clear a filter to see more pieces.") }}</p>
            <div class="acts"><button class="btn" type="button" @click="reset">{{ t("bakini.n.ls.resetFilters", "Reset filters") }}</button></div>
          </div>
        </div>

        <mk-bands :except="cat ? cat.id : null" :how="kind !== 'search'" :more="kind !== 'deals'" :questions="kind !== 'search'" />
      </template>
    </div>

    <!-- The filter panel (every width), teleported so it sits above the page. -->
    <teleport to="body">
      <div class="nx nx-layers">
        <aside id="fpanel" :aria-label="t('bakini.n.ls.filters', 'Filters')" :class="['panel', 'fpanel', { open: isOpen('fpanel') }]" aria-modal="true" role="dialog">
          <div class="pn-hd">
            <h2 class="pn-t">{{ t("bakini.n.ls.filter", "Filter") }}</h2>
            <button :aria-label="t('bakini.mk.ls.closeFilters', 'Close filters')" class="ibtn x" type="button" @click="closePanel"><nx-icon name="close" /></button>
          </div>
          <div class="fp-in">
            <div v-if="hi > lo" class="fg fg-price">
              <p class="fg-t">{{ t("bakini.n.ls.price", "Price") }}</p>
              <div class="range">
                <div class="range-track"><span :style="fillStyle" class="range-fill"></span></div>
                <input :aria-label="t('bakini.n.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :value="min" step="0.25" type="range" @change="update" @input="onMin($event.target.value)" />
                <input :aria-label="t('bakini.n.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :value="max" step="0.25" type="range" @change="update" @input="onMax($event.target.value)" />
              </div>
              <div class="range-boxes">
                <label
                  ><span>{{ t("bakini.n.ls.min", "Min") }}</span
                  ><span class="rb"
                    >{{ sign }}<input :aria-label="t('bakini.n.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :value="min.toFixed(2)" inputmode="decimal" step="0.25" type="number" @change="boxMin($event.target.value)" /></span
                ></label>
                <span class="dash">–</span>
                <label
                  ><span>{{ t("bakini.n.ls.max", "Max") }}</span
                  ><span class="rb"
                    >{{ sign }}<input :aria-label="t('bakini.n.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :value="max.toFixed(2)" inputmode="decimal" step="0.25" type="number" @change="boxMax($event.target.value)" /></span
                ></label>
              </div>
            </div>
            <div v-if="anyOffer" class="fg fg-offer">
              <label class="switch"><input :checked="offer" type="checkbox" @change="setOffer($event.target.checked)" /><span class="tr"></span>{{ t("bakini.n.ls.onOffer", "On offer") }}</label>
            </div>
            <details v-for="f in facets" :key="f.key" class="fg" open>
              <summary>{{ f.key }}<nx-icon name="down" /></summary>
              <div class="fg-body">
                <template v-for="(v, i) in f.values" :key="v">
                  <button v-if="i < 12 || moreOpen[f.key]" :aria-pressed="picked(f.key, v) ? 'true' : 'false'" class="fchip" type="button" @click="toggle(f.key, v)">{{ v }}</button>
                </template>
                <button v-if="f.values.length > 12" :aria-expanded="moreOpen[f.key] ? 'true' : 'false'" class="fmore" type="button" @click="moreOpen[f.key] = !moreOpen[f.key]">
                  <nx-icon name="down" />{{ moreOpen[f.key] ? t("bakini.n.ls.fewer", "Show fewer") : t("bakini.n.ls.more", "Show {n} more", { n: f.values.length - 12 }) }}
                </button>
              </div>
            </details>
          </div>
          <div class="fp-foot">
            <button class="btn ghost sm" type="button" @click="reset">{{ t("bakini.n.ls.reset", "Reset") }}</button>
            <button class="btn sm" type="button" @click="closePanel">{{ t("bakini.mk.ls.showResults", "Show results") }}</button>
          </div>
        </aside>
      </div>
    </teleport>
  </div>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import NxCard from "../NxCard.vue";
import NxRow from "../NxRow.vue";
import MkPhoto from "../../../mikio/MkPhoto.vue";
import MkBands from "../../../mikio/MkBands.vue";
import { heroFiles } from "../../../mikio/mikio-photos";
import { bySells, catImage, catOf, catTitle, catTo, closeLayer, hueOf, inCat, layer, loadNoir, money, noir, openLayer, priceView, productImage, shopFacts, specGroups, specValue } from "../noir";
import { currentCurrency, signOf } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

const MAX_VALUE = 28;

export default {
  name: "NxListing", // Mikio Ticker's listing
  components: { NxIcon, NxCard, NxRow, MkPhoto, MkBands },
  props: {
    categoryName: { type: String, default: null },
    search: { type: String, default: "" },
    deals: Boolean,
    initialSort: { type: String, default: "" },
  },
  /* fetched: the page's search-engine data (StorefrontSeo.updateProducts). */
  emits: ["fetched"],

  data: () => ({
    noir,
    q: "",
    tab: "all",
    sort: "featured",
    f: {},
    offer: false,
    min: 0,
    max: 0,
    sortOpen: false,
    sheet: false,
    busy: false,
    animate: false,
    drawn: 0,
    snapshot: null,
    moreOpen: {},
    layer,
    cols: 5,
    sort0: "featured",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    sign() {
      return signOf(this.currency) || this.currency;
    },
    ready() {
      return this.noir.ready;
    },
    kind() {
      if (this.categoryName) return "category";
      if (this.search) return "search";
      if (this.deals) return "deals";
      return "all";
    },
    cat() {
      return this.noir.cats.find((c) => c.name === this.categoryName) || null;
    },
    /* The products this page starts from. */
    base() {
      const all = this.noir.products;
      if (this.kind === "category") return this.cat ? inCat(this.cat.id) : all.filter((p) => String(p.category_id) === String(this.categoryName));
      if (this.kind === "search") return this.matches(this.search);
      if (this.kind === "deals") return all.filter((p) => this.pv(p).save > 0);
      return all;
    },
    prices() {
      return this.base.map((p) => this.pv(p).now);
    },
    lo() {
      return this.prices.length ? Math.floor(Math.min(...this.prices)) : 0;
    },
    hi() {
      return this.prices.length ? Math.ceil(Math.max(...this.prices)) : 0;
    },
    anyOffer() {
      return this.kind !== "deals" && this.base.some((p) => this.pv(p).save > 0);
    },
    /* Real filters: spec keys with two or more short values here (a long value,
       a sentence, is left out; a key with one value is no filter). */
    facets() {
      const map = new Map();
      for (const p of this.base) {
        for (const g of specGroups(p)) {
          for (const [k, v] of g.rows) {
            if (!map.has(k)) map.set(k, new Set());
            map.get(k).add(v);
          }
        }
      }
      return [...map.entries()]
        .map(([key, set]) => ({ key, values: [...set].filter((v) => String(v).length <= MAX_VALUE) }))
        .filter((x) => x.values.length >= 2)
        .sort((a, b) => a.values.length - b.values.length || 0);
    },
    sorts() {
      const s = [
        ["featured", t("bakini.n.ls.sFeatured", "Featured")],
        ["best", t("bakini.n.ls.sBest", "Best sellers")],
        ["review", t("bakini.n.ls.sReview", "Customer review")],
        ["low", t("bakini.n.ls.sLow", "Price: low to high")],
        ["high", t("bakini.n.ls.sHigh", "Price: high to low")],
        ["new", t("bakini.n.ls.sNew", "Newest")],
      ];
      return this.kind === "deals" ? [["saving", t("bakini.n.ls.sSaving", "Biggest saving")], ...s] : s;
    },
    sortLabel() {
      return (this.sorts.find((s) => s[0] === this.sort) || this.sorts[0])[1];
    },
    /* The filtered and sorted list, as last applied (the dim-and-fade step). */
    list() {
      const l = this.base.filter((p) => {
        if (this.tab !== "all" && p.category_id !== this.tab) return false;
        const now = this.pv(p).now;
        if (this.hi > this.lo && (now < this.min - 0.001 || now > this.max + 0.001)) return false;
        if (this.offer && !(this.pv(p).save > 0)) return false;
        for (const k of Object.keys(this.f)) if (this.f[k].length && !this.f[k].includes(specValue(p, k))) return false;
        return true;
      });
      return this.sorted(l);
    },
    /* What the grid shows: the list as of the last change applied (the cards
       dim while it updates, then the new ones fade up). */
    shown() {
      return this.snapshot || this.list;
    },
    active() {
      const out = [];
      for (const k of Object.keys(this.f))
        for (const v of this.f[k]) out.push({ id: k + ":" + v, label: v, clear: () => this.toggle(k, v) });
      if (this.offer) out.push({ id: "offer", label: t("bakini.n.ls.onOffer", "On offer"), clear: () => this.setOffer(false) });
      if (this.hi > this.lo && (this.min > this.lo || this.max < this.hi))
        out.push({
          id: "price",
          label: `${money(this.min)}–${money(this.max)}`,
          clear: () => {
            this.min = this.lo;
            this.max = this.hi;
            this.update();
          },
        });
      return out;
    },
    fillStyle() {
      const span = this.hi - this.lo || 1;
      return { left: ((this.min - this.lo) / span) * 100 + "%", right: (100 - ((this.max - this.lo) / span) * 100) + "%" };
    },
    catLine() {
      const c = this.cat;
      if (!c) return "";
      const offs = this.base.map((p) => this.pv(p).off);
      const every = offs.length && offs.every((o) => o > 0 && o === offs[0]);
      const desc = c.description || "";
      return [desc, every ? t("bakini.n.ls.everyOff", "Every piece {off}% off.", { off: offs[0] }) : ""].filter(Boolean).join(" ");
    },
    resultCats() {
      return [...new Set(this.base.map((p) => p.category_id))];
    },
    tabCats() {
      const ids = new Set(this.base.map((p) => p.category_id));
      return this.noir.cats.filter((c) => ids.has(c.id));
    },
    maxOff() {
      const offs = this.base.map((p) => this.pv(p).off).filter((x) => x > 0);
      return offs.length ? Math.max(...offs) : 0;
    },
    dealsEvery() {
      const offs = this.noir.products.map((p) => this.pv(p).off);
      return offs.length > 0 && offs.every((o) => o > 0 && o === offs[0]);
    },
    topSave() {
      return [...this.base].sort((a, b) => this.pv(b).save - this.pv(a).save || a.id - b.id)[0] || null;
    },
    facts() {
      return shopFacts(this.shop);
    },
    byBest() {
      return bySells(this.base);
    },
    /* "From $2.21 · 25% off" (the collection's lowest price and its saving) */
    fromKick() {
      if (!this.base.length) return "";
      const from = Math.min(...this.base.map((p) => this.pv(p).now));
      const offs = this.base.map((p) => this.pv(p).off);
      const every = offs.every((o) => o > 0 && o === offs[0]);
      const max = Math.max(...offs);
      return [t("bakini.mk.home.fromCap", "From {price}", { price: money(from) }), every ? t("bakini.mk.home.off", "{off}% off", { off: offs[0] }) : max > 0 ? t("bakini.mk.hdr.offUpTo", "Up to {off}% off", { off: max }) : ""].filter(Boolean).join(" · ");
    },
    crumb() {
      if (this.kind === "category") return catTitle(this.cat) || this.categoryName;
      if (this.kind === "search") return t("bakini.n.ls.search", "Search");
      return t("bakini.mk.hdr.shopAll", "Shop all");
    },
    allHead() {
      if (this.kind === "all") return t("bakini.mk.hdr.shopAll", "Shop all");
      const offs = this.noir.products.map((p) => this.pv(p).off);
      const every = offs.length > 0 && offs.every((o) => o > 0 && o === offs[0]);
      if (every) return t("bakini.mk.hdr.offEvery", "{off}% off every piece", { off: offs[0] });
      return this.maxOff ? t("bakini.mk.hdr.offUpTo", "Up to {off}% off", { off: this.maxOff }) : t("bakini.mk.hdr.shopAll", "Shop all");
    },
    /* the dark band: after the first full row, only on the plain (unfiltered) list */
    plain() {
      return this.sort === this.sort0 && this.tab === "all" && !this.offer && !Object.keys(this.f).some((k) => this.f[k].length) && this.min <= this.lo && this.max >= this.hi;
    },
    band() {
      return this.kind !== "search" && !!this.facts.gateway && this.plain && this.shown.length > this.cols;
    },
    bandAt() {
      return this.cols;
    },
    loved() {
      return bySells(this.noir.products).slice(0, 12);
    },
    noMatchLine() {
      const words = this.noir.products.slice(0, 40).map((p) => String(p.title).split(/\s+/)[0]).filter((w) => w.length > 3);
      const ex = [...new Set(words)].slice(0, 3).join(", ").toLowerCase();
      return ex ? t("bakini.n.ls.noMatchP", "Try another word, such as {examples} — or browse a collection.", { examples: ex }) : t("bakini.n.ls.noMatchP0", "Try another word, or browse a collection.");
    },
  },

  watch: {
    base: {
      handler(list) {
        this.resetRange();
        this.snapshot = null;
        if (this.ready && (this.kind !== "category" || this.cat)) this.$emit("fetched", { parent: this.cat || null, products: list });
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.q = v || "";
        this.tab = "all";
      },
      immediate: true,
    },
    categoryName() {
      this.f = {};
      this.offer = false;
      this.tab = "all";
      this.animate = false;
    },
  },

  created() {
    loadNoir();
    this.sort = this.deals ? "saving" : { most_sales: "best", newest: "new", cheapest: "low", most_expensive: "high" }[this.initialSort] || "featured";
    this.sort0 = this.sort;
  },

  mounted() {
    this.measure = () => {
      const g = this.$refs.grid;
      if (!g) return;
      const n = (getComputedStyle(g).gridTemplateColumns || "").split(" ").filter(Boolean).length;
      if (n && n !== this.cols) this.cols = n;
    };
    this.$nextTick(this.measure);
    window.addEventListener("resize", this.measure, { passive: true });
    this.onDoc = (e) => {
      if (this.sortOpen && this.$refs.sortw && !this.$refs.sortw.contains(e.target)) this.sortOpen = false;
    };
    this.onKey = (e) => {
      if (e.key !== "Escape") return;
      if (this.sortOpen) this.sortOpen = false;
      if (this.sheet) this.closeSheet();
    };
    document.addEventListener("click", this.onDoc, true);
    document.addEventListener("keydown", this.onKey);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.onDoc, true);
    document.removeEventListener("keydown", this.onKey);
    window.removeEventListener("resize", this.measure);
    if (this.layer.open === "fpanel") closeLayer(true);
    clearTimeout(this.timer);
    if (this.sheet) document.documentElement.style.overflow = "";
  },

  methods: {
    t,
    money,
    hueOf,
    catOf,
    catTitle,
    catTo,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p) {
      return productImage(p, 128);
    },
    catImg(c, size = 512) {
      return catImage(c, size);
    },
    matches(q) {
      const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.noir.products
        .map((p) => {
          const title = String(p.title || "").toLowerCase();
          const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
          let s = 0;
          for (const w of words) {
            if (title.includes(w)) s += 3;
            else if (hay.includes(w)) s += 1;
            else return { p, s: 0 };
          }
          return { p, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .map((x) => x.p);
    },
    sorted(l) {
      const out = [...l];
      const key = this.sort;
      if (key === "best") return bySells(out);
      if (key === "review") return out.sort((a, b) => (b.rate || 0) - (a.rate || 0) || (b.rate_count || 0) - (a.rate_count || 0));
      if (key === "low") return out.sort((a, b) => this.pv(a).now - this.pv(b).now || a.id - b.id);
      if (key === "high") return out.sort((a, b) => this.pv(b).now - this.pv(a).now || a.id - b.id);
      if (key === "new") return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      if (key === "saving") return out.sort((a, b) => this.pv(b).save - this.pv(a).save || a.id - b.id);
      return out;
    },
    resetRange() {
      this.min = this.lo;
      this.max = this.hi;
    },
    /* Dim, say "Updating results…", then draw the new list fading up. */
    update() {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) {
        this.animate = false;
        this.snapshot = [...this.list];
        return;
      }
      this.busy = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.busy = false;
        this.animate = true;
        this.drawn++;
        this.snapshot = [...this.list];
      }, 360);
    },
    picked(k, v) {
      return !!(this.f[k] && this.f[k].includes(v));
    },
    toggle(k, v) {
      const cur = [...(this.f[k] || [])];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(v);
      this.f = { ...this.f, [k]: cur };
      this.update();
    },
    setOffer(v) {
      this.offer = v;
      this.update();
    },
    setSort(s) {
      this.sort = s;
      this.sortOpen = false;
      this.update();
    },
    setTab(id) {
      this.tab = id;
      this.update();
    },
    onMin(v) {
      this.min = Math.min(Number(v), this.max);
    },
    onMax(v) {
      this.max = Math.max(Number(v), this.min);
    },
    boxMin(v) {
      const n = parseFloat(v);
      this.min = isNaN(n) ? this.lo : Math.max(this.lo, Math.min(n, this.max));
      this.update();
    },
    boxMax(v) {
      const n = parseFloat(v);
      this.max = isNaN(n) ? this.hi : Math.min(this.hi, Math.max(n, this.min));
      this.update();
    },
    reset() {
      this.f = {};
      this.offer = false;
      this.resetRange();
      this.update();
    },
    openSheet() {
      this.sheet = true;
      document.documentElement.style.overflow = "hidden";
    },
    closeSheet() {
      this.sheet = false;
      document.documentElement.style.overflow = "";
    },
    heroFiles,
    isOpen(id) {
      return this.layer.open === id;
    },
    openPanel(e) {
      openLayer("fpanel", e?.currentTarget || null);
    },
    closePanel() {
      closeLayer();
    },
    toHow() {
      const el = document.getElementById("how");
      if (el) el.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
    },
    submitSearch() {
      const q = this.q.trim();
      if (!q) return;
      this.$router.push({ name: window.$storefront.routes.SHOP_PAGE, query: { search: q } });
    },
  },
};
</script>
