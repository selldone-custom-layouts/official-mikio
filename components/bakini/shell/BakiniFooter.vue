<!--
  Mikio Ticker — the footer (mikio-design/m/home.js footer(), nx/core.js
  footer()): a black band like milkbarstore.com's. The wordmark with the
  shop's street, city, days and counter hours, phone and email (icons on one
  edge); Shop (every collection and Shop all); Help (FAQ, contact, the
  account, privacy, terms); the merchant's own footer menu (Selldone menus,
  type FOOTER) under the shop's name. Then the Theme row (the owner's rule of
  10 November 2026: palettes, a custom colour and Light / Dark, in a band of
  its own above the legal row; the kit's ThemeSwitcherRow, only on the
  showcase shop). Then the legal row: the copyright and city, the shop's
  policies, Selldone's cookie settings, the language, currency and way to
  pay, the shop's social links and a small "made with" credit.
  A shop with custom footer code keeps Selldone's footer.
-->
<template>
  <div class="nx nx-ftrwrap">
    <footer class="ftr">
      <div class="wrap ftr-in">
        <div class="f-brand">
          <bakini-logo class="f-wm" />
          <p v-if="street"><bdi>{{ street }}</bdi><template v-if="cityLine"><br /><bdi>{{ cityLine }}</bdi></template></p>
          <p v-if="hoursLine">{{ hoursLine }}</p>
          <ul v-if="facts.phone || facts.email" class="f-c">
            <li v-if="facts.phone"><nx-icon name="phone" /><a :href="'tel:' + facts.phone.replace(/[^\d+]/g, '')" dir="ltr">{{ facts.phone }}</a></li>
            <li v-if="facts.email"><nx-icon name="mail" /><a :href="'mailto:' + facts.email">{{ facts.email }}</a></li>
          </ul>
        </div>
        <div class="f-col">
          <h2 class="f-h">{{ t("bakini.n.ftr.shop", "Shop") }}</h2>
          <ul>
            <li v-for="c in noir.cats" :key="c.id">
              <router-link :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
            </li>
            <li>
              <router-link :to="allTo">{{ t("bakini.mk.hdr.shopAll", "Shop all") }}</router-link>
            </li>
          </ul>
        </div>
        <div class="f-col">
          <h2 class="f-h">{{ t("bakini.n.ftr.help", "Help") }}</h2>
          <ul>
            <li><router-link :to="faqTo">{{ t("bakini.n.ftr.faq", "FAQ") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("bakini.mk.hdr.contact", "Contact us") }}</router-link></li>
            <li><router-link :to="{ name: 'KalioAccountHome' }">{{ t("bakini.n.ftr.account", "Your account") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("bakini.n.ftr.privacy", "Privacy") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("bakini.n.ftr.terms", "Terms of Use") }}</router-link></li>
          </ul>
        </div>
        <div class="f-col">
          <h2 class="f-h"><bdi>{{ shopName }}</bdi></h2>
          <ul>
            <li v-for="(l, i) in menuLinks" :key="i">
              <router-link :to="l.to"><bdi>{{ l.name }}</bdi></router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- The theme switcher (the owner, 10 November 2026: in the footer on
           every Layout), only on the Layout's showcase shop. -->
      <div v-if="themeOn" class="nts-row">
        <div class="wrap nts-in"><theme-switcher-row /></div>
      </div>

      <div class="ftr-bot">
        <div class="wrap fb-in">
          <span>© {{ year }} <bdi>{{ shopName }}</bdi><template v-if="facts.city"> · {{ facts.city }}</template></span>
          <nav :aria-label="t('bakini.n.ftr.legal', 'Legal')">
            <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("bakini.n.ftr.privacy", "Privacy") }}</router-link>
            <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("bakini.n.ftr.terms", "Terms of Use") }}</router-link>
            <s-footer-section-gdpr class="nx-gdpr"></s-footer-section-gdpr>
          </nav>
          <span>{{ regionLine }}</span>
          <s-storefront-social-buttons class="nx-social"></s-storefront-social-buttons>
          <s-footer-section-selldone class="nx-made"></s-footer-section-selldone>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import BakiniLogo from "../BakiniLogo.vue";
import NxIcon from "../noir/NxIcon.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { catTitle, catTo, loadNoir, noir, shopFacts } from "../noir/noir";
import { currentCurrency, currentLanguage, languages, regionState } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniFooter",
  components: { BakiniLogo, NxIcon, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  data: () => ({ noir, theme: themeState, region: regionState }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    r() {
      return window.$storefront.routes;
    },
    facts() {
      return shopFacts(this.shop);
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    year() {
      return new Date().getFullYear();
    },
    themeOn() {
      return this.theme.enabled;
    },
    dealsTo() {
      return dealsRoute();
    },
    allTo() {
      return catalogueRoute({ sort: "newest" });
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    /* "A counter at 1 The Embarcadero, San Francisco. Pieces sold one by one,
       for delivery, shipping and pickup." From the shop's own data. */
    brandLine() {
      const kinds = [];
      if (this.facts.courier) kinds.push(t("bakini.n.ftr.kDelivery", "delivery"));
      if (this.facts.shipping) kinds.push(t("bakini.n.ftr.kShipping", "shipping"));
      if (this.facts.pickup) kinds.push(t("bakini.n.ftr.kPickup", "pickup"));
      const list = kinds.length ? new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type: "conjunction" }).format(kinds) : "";
      const at = this.facts.address ? t("bakini.n.ftr.at", "A counter at {address}.", { address: this.facts.address }) : "";
      const how = list ? t("bakini.n.ftr.how", "Pieces sold one by one, for {kinds}.", { kinds: list }) : "";
      return [at, how].filter(Boolean).join(" ");
    },
    street() {
      return String(this.facts.address || "").split(",")[0].trim();
    },
    cityLine() {
      const f = this.facts;
      return [f.city, [f.region, f.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    },
    hoursLine() {
      const f = this.facts;
      if (!f.days.length && !f.hours) return "";
      const days = f.everyDay ? t("bakini.n.ftr.everyDay", "Open every day") : f.days.map((d) => d.slice(0, 3)).join(", ");
      return f.hours ? `${days} ${f.hours}` : days;
    },
    /* The merchant's footer menu, flat. */
    menuLinks() {
      const menu = this.shop?.menus?.find((it) => it.type === "FOOTER" && it.enable !== false);
      const items = (menu?.menu || [])
        .flat()
        .filter((item) => item && item.name && item.to)
        .filter((item) => !item.to.name || this.$router.hasRoute(item.to.name));
      if (items.length) return items.slice(0, 7);
      return [
        { name: t("bakini.n.ftr.home", "Home"), to: { path: "/" } },
        { name: t("bakini.n.ftr.about", "About"), to: { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US } },
        { name: t("bakini.n.ftr.contact", "Contact"), to: { name: this.r.SHOP_CONTACT_US } },
      ];
    },
    /* "English · USD · Cash on delivery". */
    regionLine() {
      void this.region.currency;
      void this.region.language;
      const lang = languages().find((l) => l.code === currentLanguage());
      return [lang?.title, currentCurrency(), this.facts.gateway?.name].filter(Boolean).join(" · ");
    },
  },
  created() {
    loadNoir();
  },
  methods: { t, catTo, catTitle },
};
</script>
