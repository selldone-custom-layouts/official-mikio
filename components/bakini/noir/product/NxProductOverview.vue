<!--
  Mikio Ticker — the top of the product page (mikio-design/product-a.html,
  nx/pages-product.js), laid out like milkbarstore.com's product page:

  - the gallery on the left (it stays in view while the page scrolls):
    Selldone's own photos of the product as thumbnails beside one big cream
    tile with the "−25%" sticker and arrows (thumbnails under it on phones);
  - on the right: the collection (a link), the name, the honest reviews
    line, the first reason to love it, the price with the struck was-price
    and "Save $x · n%", the deal's own clock only when the deal has a real
    end date (Selldone's rule), "per <unit> · sold individually" and the
    stock; "Choose your <unit>:" — the collection's other pieces as photo
    tiles (the current one ringed inside), like the reference's flavours;
    the options when the product has real variants (tiles with their own
    photo, the chosen one ringed and tinted, no tick; Selldone's own picker
    when they differ in more than one way); the big "Add to bag · $x" (then
    − n + in place); the shop's delivery, pickup and payment lines; then rows
    that open: why you'll love it (its pros), each spec group; then Compare,
    Copy link and the SKU.

  On a phone, once the Add box has scrolled away, a buy bar at the foot.

  Every behaviour is Selldone's SProductOverview (through Kalio's): the
  chosen variant, the store, the basket line. A product that needs more than
  a count (a service, a valuation form, extra pricing, a subscription) keeps
  Selldone's own buy section here.
-->
<template>
  <section class="wrap pd2">
    <div :class="['pd2-gal', { 'has-th': photos.length > 1 }]">
      <div v-if="photos.length > 1" :aria-label="t('bakini.n.pd.photos', 'Photos')" class="pd2-th" role="group">
        <button
          v-for="(ph, i) in photos"
          :key="ph.src"
          :aria-label="t('bakini.n.pd.photoN', 'Photo {n} of {total}', { n: i + 1, total: photos.length })"
          :aria-pressed="i === at ? 'true' : 'false'"
          class="pd2-t"
          type="button"
          @click="at = i"
        >
          <img :src="ph.thumb" alt="" class="cut" loading="lazy" />
        </button>
      </div>
      <div class="pd2-main">
        <img v-if="photo" :key="photo.src" :alt="photo.alt" :src="photo.src" class="cut" decoding="async" loading="eager" />
        <span v-if="pv.off > 0" class="badge">−{{ pv.off }}%</span>
        <template v-if="photos.length > 1">
          <button :aria-label="t('bakini.mk.pd.prevPhoto', 'Previous photo')" class="arr pd2-prev" type="button" @click="step(-1)"><nx-icon name="left" /></button>
          <button :aria-label="t('bakini.mk.pd.nextPhoto', 'Next photo')" class="arr pd2-next" type="button" @click="step(1)"><nx-icon name="right" /></button>
        </template>
      </div>
    </div>

    <div class="pd2-buy">
      <router-link v-if="cat" :to="catTo(cat)" class="pd2-coll"><bdi>{{ catName }}</bdi></router-link>
      <h1 class="pd2-h">{{ $product.title }}</h1>
      <p class="pd2-rv">
        <nx-icon name="star" /><template v-if="$product.rate_count > 0">{{ t("bakini.mk.pd.rated", "Rated {rate} of 5 · {n} reviews", { rate: Number($product.rate).toFixed(1), n: $product.rate_count }) }}</template
        ><template v-else>{{ t("bakini.mk.pd.noReviews", "No reviews yet") }}</template>
      </p>
      <p v-if="why" class="pd2-d">{{ why }}</p>

      <div v-if="isSubscription" class="pd-opt nx-sd-sub">
        <s-subscription-price-select
          v-model="selected_subscription_price"
          :disabled="!$product.quantity"
          :subscription-prices="subscription_prices"
          return-object
        ></s-subscription-price-select>
      </div>
      <template v-else>
        <div class="pd2-price">
          <span class="now money">{{ money(pv.now) }}</span><s v-if="pv.was" class="was money">{{ money(pv.was) }}</s
          ><span v-if="pv.save > 0" class="pd2-save">{{ t("bakini.n.pd.save", "Save {amount} · {off}%", { amount: money(pv.save), off: pv.off }) }}</span>
        </div>
        <p v-if="dealEndsAt" class="pd2-unit nx-pd-deal">{{ t("bakini.n.pd.dealEnds", "Deal ends in") }}{{ " " }}<bakini-deal-clock :end="dealEndsAt" mode="bare" /></p>
      </template>
      <s-product-section-tax></s-product-section-tax>
      <p class="pd2-unit">
        {{ t("bakini.n.pd.unitLine", "per {unit} · sold individually", { unit }) }} ·
        <span v-if="stock <= 0" class="pc-low">{{ t("bakini.n.pd.soldOut", "Sold out") }}</span
        ><span v-else-if="stock <= 5" class="pc-low">{{ t("bakini.n.pd.onlyLeft", "Only {n} left", { n: stock }) }}</span
        ><span v-else class="pd2-stock">{{ t("bakini.mk.pd.inStock", "In stock") }}</span>
      </p>
      <p v-if="!has_original_warranty" class="pd2-unit">{{ $t("product_info.fake") }}</p>

      <!-- Choose your piece: the collection's other pieces -->
      <div v-if="siblings.length > 1" class="pd2-ch">
        <p class="pd2-ch-h">{{ t("bakini.mk.pd.choose", "Choose your {unit}:", { unit }) }}</p>
        <div class="pd2-ch-row">
          <ul ref="sibs" class="pd2-ch-list" @scroll.passive="sibUpdate">
            <li v-for="s in siblings" :key="s.id">
              <router-link :aria-current="s.id === $product.id ? 'page' : undefined" :to="productTo(s)" class="pd2-sib">
                <span class="ps-ph"><img :src="thumb(s)" alt="" class="cut" loading="lazy" /></span>
                <span class="ps-n">{{ s.title }}</span>
                <span class="ps-p money">{{ money(sibPrice(s)) }}</span>
              </router-link>
            </li>
          </ul>
          <button :aria-label="t('bakini.mk.pd.sibBack', 'Scroll the {name} back', { name: catName.toLowerCase() })" :disabled="sibStart" class="arr sm" data-dir="-1" type="button" @click="sibPage(-1)"><nx-icon name="left" /></button>
          <button :aria-label="t('bakini.mk.pd.sibOn', 'Scroll the {name} on', { name: catName.toLowerCase() })" :disabled="sibEnd" class="arr sm" data-dir="1" type="button" @click="sibPage(1)"><nx-icon name="right" /></button>
        </div>
      </div>

      <!-- Options: only for a product that really has them. -->
      <div v-if="tiles.length" class="pd-opt nx-pd-opt">
        <p class="pd-opt-h">
          {{ dimWord }}<template v-if="currentLabel">{{ " " }}<span class="muted">· {{ currentLabel }}</span></template>
        </p>
        <div :aria-label="dimWord" class="opt-tiles" role="radiogroup">
          <button
            v-for="tl in tiles"
            :key="tl.v.id"
            :aria-checked="current_variant && current_variant.id === tl.v.id ? 'true' : 'false'"
            :class="['opt-tile', { '-out': !(tl.v.quantity > 0) }]"
            role="radio"
            type="button"
            @click="current_variant = tl.v"
          >
            <span class="ot-ph"
              ><img v-if="tl.img" :src="tl.img" alt="" loading="lazy" /><i v-else-if="tl.swatch" :style="{ background: tl.swatch }" aria-hidden="true" class="nx-ot-sw"></i
            ></span>
            <span class="ot-n">{{ tl.label }}</span>
            <small v-if="tl.price !== null" class="ot-p money">{{ money(tl.price) }}</small>
          </button>
        </div>
      </div>
      <div v-else-if="product_variants.length" class="pd-opt nx-pd-opt nx-sd-variants">
        <s-product-section-variants
          v-model:current-variant="current_variant"
          v-model:filter="filter"
          v-model:selection-values="selection_values"
        ></s-product-section-variants>
      </div>

      <div class="nx-sd-more">
        <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
        <s-product-section-valuation
          v-if="preferences && preferences.valuation"
          :correspondingBasketItem="corresponding_basket_item"
          :current-variant="current_variant"
          :preferences="preferences"
        ></s-product-section-valuation>
        <s-product-section-extra-pricings
          :current-variant="current_variant"
          :preferences="preferences"
          :quantity="corresponding_basket_item?.count"
          :selected-vendor-product="selected_vendor_product"
          @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
        ></s-product-section-extra-pricings>
      </div>

      <div ref="add" class="pd-add">
        <nx-pd-qb
          v-if="simple"
          :label="t('bakini.n.pd.addPrice', 'Add to bag · {price}', { price: money(pv.now) })"
          :needs-choice="needsChoice"
          :product="$product"
          :variant="current_variant"
          size="big"
        />
        <s-product-section-buy-button
          v-else
          ref="buy_section"
          :can-buy="canBuy"
          :current-variant="current_variant"
          :hss-sticky-but-button="hssStickyButButton"
          :preferences="preferences"
          :quick-buy-mode="quickBuyMode"
          :selected-subscription-price="selected_subscription_price"
          :selected-vendor-product="selected_vendor_product"
          class="nx-sd-buy"
        ></s-product-section-buy-button>
      </div>

      <div v-if="lines.length" class="ilines pd-lines">
        <div v-for="l in lines" :key="l.key" class="iline">
          <nx-icon :name="l.icon" />
          <div>
            <b>{{ l.title }}</b><span v-if="l.line">{{ l.line }}</span>
          </div>
        </div>
      </div>

      <!-- Rows that open: why you'll love it, then each spec group. -->
      <div v-if="pros.length || groups.length" class="pd-rows">
        <details v-if="pros.length" class="pd-row" open>
          <summary><span>{{ t("bakini.n.pd.prosEyebrow", "Why you’ll love it") }}</span><nx-icon cls="pm" name="down" /></summary>
          <div class="pd-row-b">
            <ul class="pd-pros">
              <li v-for="(x, i) in pros" :key="i"><b>{{ x[0] }}.</b>{{ " " }}{{ x[1] }}</li>
            </ul>
          </div>
        </details>
        <details v-for="g in groups" :key="g.group" class="pd-row">
          <summary><span>{{ g.group || t("bakini.mk.pd.details", "Details") }}</span><nx-icon cls="pm" name="down" /></summary>
          <div class="pd-row-b">
            <dl class="pd-dl">
              <div v-for="r in g.rows" :key="r[0]">
                <dt>{{ r[0] }}</dt>
                <dd>{{ r[1] }}</dd>
              </div>
            </dl>
          </div>
        </details>
      </div>

      <div class="pd2-acts">
        <button class="tool" type="button" @click="compareNow"><nx-icon name="compare" />{{ cat ? t("bakini.mk.pd.compareOf", "Compare {name}", { name: catName.toLowerCase() }) : t("bakini.n.pd.compare", "Compare") }}</button>
        <button class="tool" type="button" @click="copyLink">
          <nx-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("bakini.n.pd.copied", "Link copied") : t("bakini.n.pd.copy", "Copy link") }}
        </button>
        <span v-if="$product.sku" class="pd2-sku">{{ t("bakini.n.pd.sku", "SKU {sku}", { sku: $product.sku }) }}</span>
      </div>
    </div>

    <!-- The phone's buy bar, once the Add box has scrolled away. -->
    <teleport to="body">
      <div class="nx nx-pdbar">
        <div :aria-hidden="barOn ? undefined : 'true'" :class="['pd-bar', { on: barOn }]">
          <div class="wrap pd-bar-in">
            <span class="th"><img v-if="photos[0]" :src="photos[0].thumb" alt="" class="cut" /></span>
            <span class="pd-bar-t"
              ><b>{{ $product.title }}</b
              ><span
                ><span class="money">{{ money(pv.now) }}</span>{{ " " }}<s v-if="pv.was" class="was money">{{ money(pv.was) }}</s></span
              ></span
            >
            <nx-pd-qb v-if="simple" :label="t('bakini.n.pd.addToBag', 'Add to bag')" :needs-choice="needsChoice" :product="$product" :variant="current_variant" size="mid" />
            <button v-else :tabindex="barOn ? undefined : -1" class="btn" type="button" @click="toAdd">{{ t("bakini.n.pd.addToBag", "Add to bag") }}</button>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script>
import KalioProductOverview from "../../../kalio/product/KalioProductOverview.vue";
import BakiniDealClock from "../../BakiniDealClock.vue";
import NxIcon from "../NxIcon.vue";
import NxPdQb from "./NxPdQb.vue";
import { catOf, catTitle, catTo, hueOf, loadNoir, money, noir, priceView, productImage, productTo, prosOf, scrollBehavior, specGroups, unitOf } from "../noir";
import { isRtl } from "../../../region-switcher/region";
import { deliveryLines, galleryOf, isEnglish, plural } from "./pd";
import { colourName, dealEnd, moneyOf, swatchBg, variantDimension } from "../../bakini";
import { currentCurrency } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxProductOverview",
  extends: KalioProductOverview,
  components: { BakiniDealClock, NxIcon, NxPdQb },

  data() {
    return { at: 0, copied: false, barOn: false, noir, sibStart: true, sibEnd: false };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    hue() {
      return hueOf(this.$product?.category_id);
    },
    cat() {
      return this.$product?.category || catOf(this.$product?.category_id) || null;
    },
    why() {
      const p = prosOf(this.$product)[0];
      return p ? p[1] || p[0] : "";
    },
    pros() {
      return prosOf(this.$product).filter((x) => x[0] || x[1]);
    },
    groups() {
      return specGroups(this.$product);
    },
    /* the collection's pieces in the shop's order, this one among them */
    siblings() {
      const id = this.$product?.category_id;
      if (!id) return [];
      const list = this.noir.products.filter((p) => p.category_id === id);
      return list.some((p) => p.id === this.$product.id) ? list : [];
    },
    catName() {
      return catTitle(this.$product?.category || catOf(this.$product?.category_id));
    },
    unit() {
      return unitOf(this.$product);
    },
    pv() {
      void this.currency;
      return priceView(this.shop || this.$shop, this.$product, this.current_variant);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    photos() {
      return galleryOf(this.$product, this.current_variant);
    },
    photo() {
      return this.photos[Math.min(this.at, this.photos.length - 1)] || null;
    },
    stock() {
      const n = this.current_variant ? this.current_variant.quantity : this.$product.quantity;
      return Number(n) || 0;
    },
    stockLine() {
      const n = this.stock;
      if (isEnglish()) return t("bakini.n.pd.inStockUnits", "In stock · {n} {units} left", { n, units: plural(this.unit, n) });
      return t("bakini.n.pd.inStockN", "In stock · {n} left", { n });
    },
    lines() {
      return deliveryLines(this.shop || this.$shop);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const k = this.dimension?.key;
      if (k === "color") return t("bakini.n.pd.colour", "Colour");
      const w = this.dimension?.word || t("bakini.n.pd.option", "Option");
      return w.charAt(0).toUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: v.image ? window.CDN.GET_SHOP_IMAGE_PATH(v.image, 128) : d.key === "color" ? null : window.CDN.GET_SHOP_IMAGE_PATH(this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("bakini.n.pd.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    currentLabel() {
      const x = this.tiles.find((y) => this.current_variant && y.v.id === this.current_variant.id);
      return x ? x.label : "";
    },
    needsChoice() {
      return this.product_variants.length > 0 && !this.current_variant;
    },
    /* A plain product: the quantity box; anything Selldone's own button
       knows more about keeps that button. */
    simple() {
      const p = this.$product;
      if (!p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      return true;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
  },

  watch: {
    "$product.id"() {
      this.at = 0;
      this.copied = false;
    },
    "current_variant.id"() {
      this.at = 0;
    },
    "siblings.length"() {
      this.centerSib();
    },
  },

  created() {
    loadNoir();
  },

  mounted() {
    this.centerSib();
    /* the phone's buy bar: on once the Add box has scrolled up out of view, off again as soon as it is
       back or below; read on every scroll (an IntersectionObserver misses a jump straight to the top) */
    this.onScroll = () => {
      if (this.barTick) return;
      this.barTick = true;
      requestAnimationFrame(() => {
        this.barTick = false;
        const add = this.$refs.add;
        this.barOn = !!add && add.getBoundingClientRect().bottom < 0;
      });
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.onScroll();
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    clearTimeout(this.copyTimer);
  },

  methods: {
    t,
    money,
    catTo,
    productTo,
    thumb(p) {
      return productImage(p, 128);
    },
    sibPrice(p) {
      void this.currency;
      return priceView(this.shop || this.$shop, p).now;
    },
    step(d) {
      const n = this.photos.length;
      if (n) this.at = (this.at + d + n) % n;
    },
    sibUpdate() {
      const tr = this.$refs.sibs;
      if (!tr) return;
      const x = Math.abs(tr.scrollLeft);
      this.sibStart = x <= 2;
      this.sibEnd = x >= tr.scrollWidth - tr.clientWidth - 2;
    },
    sibPage(d) {
      const tr = this.$refs.sibs;
      if (tr) tr.scrollBy({ left: d * (isRtl() ? -1 : 1) * tr.clientWidth * 0.8, behavior: scrollBehavior() });
    },
    /* the current piece's tile in view (centred when it can be) */
    centerSib() {
      this.$nextTick(() => {
        const tr = this.$refs.sibs;
        const cur = tr && tr.querySelector('[aria-current="page"]');
        if (cur) {
          const li = cur.parentElement;
          tr.scrollLeft = Math.max(0, li.offsetLeft - tr.clientWidth / 2 + li.offsetWidth / 2) * (isRtl() ? -1 : 1);
        }
        this.sibUpdate();
      });
    },
    /* Add this pastry to Selldone's comparison and open the Layout's compare
       page: what the shopper already compares, else this with two of its own
       collection's best sellers. */
    compareNow() {
      if (!this.comparing) this.addToProductComparison(this.$product, this.current_variant, true);
      const stored = (this.$store.getters.getProductsComparison || []).map((p) => ({ p: p.id, v: p.variant?.id || null }));
      let refs = stored.filter((r) => r.p !== this.$product.id);
      refs.unshift({ p: this.$product.id, v: this.current_variant?.id || null });
      if (refs.length < 2) {
        const mates = this.noir.products
          .filter((p) => p.category_id === this.$product.category_id && p.id !== this.$product.id)
          .sort((a, b) => (b.sells || 0) - (a.sells || 0))
          .slice(0, 2);
        refs = refs.concat(mates.map((p) => ({ p: p.id, v: null })));
      }
      const list = refs
        .slice(0, 4)
        .map((r) => `p${r.p}${r.v ? `v${r.v}` : ""}`)
        .join("_");
      this.$router.push({ name: window.$storefront.routes.COMPARISON_PAGE, query: { list } });
    },
    copyLink() {
      const url = window.location.href;
      const done = () => {
        this.copied = true;
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => (this.copied = false), 1600);
      };
      try {
        navigator.clipboard.writeText(url).then(done, done);
      } catch {
        done();
      }
    },
    toAdd() {
      this.$refs.add?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
