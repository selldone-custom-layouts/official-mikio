<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!--
    Mikio Ticker — the product page (mikio-design/product-a.html,
    nx/pages-product.js), like milkbarstore.com's: the breadcrumb
    (Home / collection / product); the gallery and the buy column with the
    collection's other pieces, the delivery lines and the rows that open
    (NxProductOverview); the product's own description when it has one;
    "Goes well with" (this and the best seller of two other collections);
    the reviews (an honest empty state with the rating criteria until there
    is one); "More <collection>" (never this product); more collections.
    Selldone's own sections for other kinds of product (offers, includes,
    files, membership, a product landing page) follow when the product has
    them.
  -->
  <div class="nx nx-pdp s--product">
    <slot name="header" :center="true"></slot>
    <div class="wrap pd-crumbs">
      <nav :aria-label="t('bakini.n.pd.crumbs', 'Breadcrumb')" class="crumbs">
        <router-link :to="{ path: '/' }">{{ t("bakini.n.pd.home", "Home") }}</router-link>
        <template v-if="cat">
          <span aria-hidden="true" class="sep">/</span>
          <router-link :to="catTo(cat)"><bdi>{{ catTitle(cat) }}</bdi></router-link>
        </template>
        <template v-if="product">
          <span aria-hidden="true" class="sep">/</span>
          <span aria-current="page"><bdi>{{ product.title }}</bdi></span>
        </template>
        <span class="nx-pd-admin"><s-product-admin-button v-if="$vuetify.display.mdAndUp"></s-product-admin-button></span>
      </nav>
    </div>

    <nx-product-overview v-if="product" :key="product.id" can-buy show-cover />
    <section v-else aria-hidden="true" class="wrap pd2 nx-pd-skel">
      <div class="pd2-gal"><div class="pd2-main"></div></div>
      <div class="pd2-buy"><i class="-a"></i><i class="-b"></i><i class="-c"></i><i class="-d"></i><i class="-e"></i></div>
    </section>

    <template v-if="product">
      <!-- The product's own description -->
      <section v-if="articleBody" class="sec tight">
        <div class="wrap">
          <div class="sec-hd">
            <h2 class="h2">{{ t("bakini.mk.pd.aboutThis", "About this {unit}", { unit }) }}</h2>
          </div>
          <div class="nx-pd-article" v-html="articleBody"></div>
        </div>
      </section>

      <nx-together :product="product" :variant="current_variant" />
      <nx-reviews :product="product" />

      <div class="wrap nx-pd-sd">
        <s-product-offers class="s--product-section"></s-product-offers>
        <s-product-includes></s-product-includes>
        <s-product-files-list></s-product-files-list>
        <s-product-subscription-membership></s-product-subscription-membership>
      </div>
      <s-product-landing></s-product-landing>

      <nx-row
        v-if="more.length"
        id="pd-more"
        :items="more"
        :more-label="t('bakini.mk.pd.shopAllOf', 'Shop all {name}', { name: catTitle(cat).toLowerCase() })"
        :more-to="catTo(cat)"
        :sub="t('bakini.mk.pd.moreSub', 'The rest of the collection, best sellers first.')"
        :title="t('bakini.mk.pd.moreOf', 'More {name}', { name: catTitle(cat).toLowerCase() })"
      />
      <mk-bands :except="cat ? cat.id : null" more />
    </template>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import NxIcon from "../../components/bakini/noir/NxIcon.vue";
import NxRow from "../../components/bakini/noir/NxRow.vue";
import MkBands from "../../components/mikio/MkBands.vue";
import NxProductOverview from "../../components/bakini/noir/product/NxProductOverview.vue";
import NxTogether from "../../components/bakini/noir/product/NxTogether.vue";
import NxReviews from "../../components/bakini/noir/product/NxReviews.vue";
import { numberWord } from "../../components/bakini/noir/product/pd";
import { bySells, catOf, catTitle, catTo, loadNoir, noir, prosOf, specGroups, unitOf } from "../../components/bakini/noir/noir";
import { rememberViewed } from "../../components/bakini/bakini";
import { t } from "../../components/kalio/i18n/kalio-i18n";
import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";
import SProductIncludes from "@selldone/components-vue/storefront/product/includes/SProductIncludes.vue";
import SProductFilesList from "@selldone/components-vue/storefront/product/file/list/SProductFilesList.vue";
import SProductSubscriptionMembership from "@selldone/components-vue/storefront/product/subscription/membership/SProductSubscriptionMembership.vue";
import SProductOffers from "@selldone/components-vue/storefront/product/offers/SProductOffers.vue";
import { computed } from "vue";
import SProductAdminButton from "@selldone/components-vue/storefront/product/admin/button/SProductAdminButton.vue";
import { XapiProductGetTypes } from "@selldone/sdk-storefront/product";
import SProductLanding from "@selldone/components-vue/storefront/product/landing/SProductLanding.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { StorefrontSeo } from "../../helpers/StorefrontSeo";

export default {
  name: "StorefrontPageProduct",
  mixins: [CurrencyMixin],

  inject: ["$shop"],
  props: {},
  components: {
    NxIcon,
    NxRow,
    NxProductOverview,
    MkBands,
    NxTogether,
    NxReviews,
    SProductLanding,
    SProductAdminButton,
    SProductOffers,
    SProductSubscriptionMembership,
    SProductFilesList,
    SProductIncludes,
  },

  /* The product and the chosen variant, for Selldone's sections. */
  provide() {
    return {
      $product: computed(() => this.product),
      $variant: computed(() => this.current_variant),
    };
  },

  data: function () {
    return {
      product: null,
      busy: false,
      noir,
    };
  },

  computed: {
    current_variant() {
      return this.$store.getters.getCurrentSelectedVariant;
    },
    cat() {
      return this.product ? this.product.category || catOf(this.product.category_id) : null;
    },
    unit() {
      return unitOf(this.product).toLowerCase();
    },
    pros() {
      return prosOf(this.product).filter((x) => x[0] || x[1]);
    },
    groups() {
      return specGroups(this.product);
    },
    articleBody() {
      const body = this.product?.article_pack?.article?.body;
      return body && String(body).replace(/<[^>]*>/g, "").trim() ? body : null;
    },
    /* More of the same collection, best sellers first, never this one. */
    more() {
      if (!this.product) return [];
      return bySells(this.noir.products.filter((p) => p.category_id === this.product.category_id && p.id !== this.product.id));
    },
  },

  watch: {
    $route() {
      this.getProduct();
    },
  },

  created() {
    loadNoir();
    this.getProduct();
  },

  methods: {
    t,
    catTitle,
    catTo,
    numberWord,

    getProduct() {
      const seoNavigation = StorefrontSeo.captureNavigation();
      const handleSuccessResponse = ({ product }: XapiProductGetTypes.IResponse) => {
        this.product = product;
        rememberViewed(product.id);

        GtagEcommerce.MeasuringViewsOfProductDetails(this.$shop, product, this.GetUserSelectedCurrency().code, "product-page");

        // Reject initial-load and superseded responses, including SDK cache callbacks.
        StorefrontSeo.updateProduct(product, this.$shop, seoNavigation, this.GetUserSelectedCurrency().code);
      };

      if (window.PRE_LOADED_DATA?.PRODUCT_PACK) {
        console.log("⚡ Turbo load product.");
        handleSuccessResponse(window.PRE_LOADED_DATA.PRODUCT_PACK);
        window.PRE_LOADED_DATA = null; // Clear!
      } else {
        this.busy = true;
      }

      window.$storefront.products
        .optimize(60)
        .get(this.getId(this.$route.params.product_id), {
          "augmented-categories": 3, // Return 3 categories in the parent folder of current category
          "augmented-cross-sells": true, // Return max 3 cross-selling items
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
