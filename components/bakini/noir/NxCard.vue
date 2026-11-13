<!--
  Mikio Ticker — the product card (mikio-design/nx/core.js card(), the home's
  card): the cut-out on a cream tile with a "−25%" sticker, the name in caps
  (two lines at most), the first reason to love it (the product's own pros),
  the price now / was / "per <unit>" (and "Only n left" when five or fewer),
  then "Add to bag" across the card's width, which turns into − n + in place.
  The name is a stretched link, so the whole card opens the product; the
  quantity box and the quick look sit above that link.

  look: a quick-look button (the eye) in the tile's free top corner.
  tag: "article" (grids of their own) or "li" (inside a list: rails, grids).
-->
<template>
  <component :is="tag" :class="['pc', { 'has-look': look }, cls]">
    <div class="pc-img">
      <img
        :loading="eager ? 'eager' : 'lazy'"
        :src="img"
        :srcset="srcset"
        alt=""
        class="cut"
        decoding="async"
        height="640"
        sizes="(max-width: 860px) 46vw, 262px"
        width="640"
        @error="dropSrcset"
      />
      <span v-if="pv.off > 0" class="badge">−{{ pv.off }}%</span>
      <button
        v-if="look"
        :aria-label="t('bakini.n.card.look', 'Quick look: {name}', { name: product.title })"
        :title="t('bakini.n.card.lookShort', 'Quick look')"
        aria-controls="qv"
        class="pc-look"
        type="button"
        @click="quick($event)"
      >
        <nx-icon name="eye" />
      </button>
    </div>
    <div class="pc-b">
      <h3 class="pc-t"><router-link :to="to" class="pc-a">{{ product.title }}</router-link></h3>
      <p v-if="why" class="pc-d">{{ why }}</p>
      <p class="pc-p">
        <span class="now money">{{ money(pv.now) }}</span><s v-if="pv.was" class="was money">{{ money(pv.was) }}</s
        ><span class="per">{{ t("bakini.n.card.per", "per {unit}", { unit: unit }) }}</span
        ><span v-if="low" class="pc-low">{{ t("bakini.n.card.onlyLeft", "Only {n} left", { n: product.quantity }) }}</span
        ><span v-else-if="soldOut" class="pc-low">{{ t("bakini.n.card.soldOut", "Sold out") }}</span>
      </p>
      <slot name="extra"></slot>
      <div class="pc-add"><nx-qb :label="t('bakini.n.qb.addToBag', 'Add to bag')" :product="product" size="card" /></div>
    </div>
  </component>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxQb from "./NxQb.vue";
import { money, openQuick, priceView, productImage, productTo, prosOf, unitOf } from "./noir";
import { dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxCard",
  components: { NxIcon, NxQb },
  props: {
    product: { type: Object, required: true },
    look: Boolean,
    eager: Boolean,
    cls: { type: String, default: "" },
    tag: { type: String, default: "article" },
  },
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    unit() {
      return unitOf(this.product);
    },
    why() {
      const p = prosOf(this.product)[0];
      return p ? p[1] || p[0] : "";
    },
    soldOut() {
      return !(this.product.quantity > 0);
    },
    low() {
      return this.product.quantity > 0 && this.product.quantity <= 5;
    },
  },
  methods: {
    t,
    money,
    dropSrcset,
    quick(e) {
      openQuick(this.product, e.currentTarget);
    },
  },
};
</script>
