<!--
  Mikio Ticker — the bands under a listing and the product page
  (mikio-design/nx/pages-shop.js howItWorks(), questions(), moreCollections()),
  like the bands under milkbarstore.com's collection grid:

  - how: "Order by the piece. Here's how it works." One photo (the courier
    tile's) beside three steps: pick pieces, choose a way and a window, pay
    when it arrives. Each step only says what the shop's data says.
  - questions: delivery questions answered from the shop's delivery ways, its
    counter's note and days, and its payment way; rows that open.
  - more: three other collections (best-selling first) as tiles with their
    best sellers' cut-outs and the "from" price.
-->
<template>
  <div class="nx mk-bands">
    <section v-if="how && steps.length" id="how" aria-labelledby="hw-h" class="hw">
      <div class="wrap hw-in">
        <mk-photo :h="1200" :products="best.slice(0, 3)" :w="1200" file="mikio-way-courier.webp" />
        <div class="hw-copy">
          <h2 id="hw-h" class="h2">{{ t("bakini.mk.bands.howH", "Order by the piece. Here’s how it works.") }}</h2>
          <ol class="hw-steps">
            <li v-for="s in steps" :key="s.key">
              <svg aria-hidden="true" class="why-i" focusable="false" viewBox="0 0 48 48" v-html="ART[s.key]"></svg>
              <div>
                <h3 class="hw-t">{{ s.title }}</h3>
                <p class="hw-p">{{ s.text }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section v-if="questions && qa.length" aria-labelledby="lq-h" class="lq">
      <div class="wrap lq-in">
        <div class="lq-hd">
          <h2 id="lq-h" class="h2">{{ t("bakini.mk.bands.qH", "Delivered your way") }}</h2>
          <p class="lead">{{ t("bakini.mk.bands.qSub", "Questions about delivery, pickup and paying, answered.") }}</p>
        </div>
        <div class="lq-list">
          <details v-for="(x, i) in qa" :key="i" class="lq-it">
            <summary><span>{{ x[0] }}</span><nx-icon cls="pm" name="plus" /></summary>
            <p class="lq-a">{{ x[1] }}</p>
          </details>
        </div>
      </div>
    </section>

    <section v-if="more && others.length" aria-labelledby="mc-h" class="mc">
      <div class="wrap">
        <h2 id="mc-h" class="h2">{{ t("bakini.mk.bands.moreH", "More collections") }}</h2>
        <ul class="mc-list">
          <li v-for="r in others" :key="r.c.id">
            <router-link :to="catTo(r.c)" class="mc-a">
              <span class="mc-ph"><span v-for="(p, i) in r.ps.slice(0, 3)" :key="p.id" :class="['mc-c', 'mc-c' + i]"><img :src="img(p)" alt="" class="cut" loading="lazy" /></span></span>
              <span class="mc-t"><bdi>{{ catTitle(r.c) }}</bdi></span>
              <span class="mc-go">{{ t("bakini.mk.home.fromCap", "From {price}", { price: money(r.from) }) }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import NxIcon from "../bakini/noir/NxIcon.vue";
import MkPhoto from "./MkPhoto.vue";
import { bySells, catTitle, catTo, loadNoir, money, noir, priceView, productImage, shopFacts } from "../bakini/noir/noir";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { currentCurrency } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";

const ART = {
  pick: '<rect x="8" y="17" width="32" height="23" rx="3"/><path d="M8 24h32M18 17v-3a6 6 0 0 1 12 0v3"/><circle cx="24" cy="31" r="3"/>',
  window: '<circle cx="24" cy="25" r="15"/><path d="M24 16v9l6 4"/><path d="M18 5h12M24 5v5"/>',
  cash: '<rect x="6" y="14" width="36" height="21" rx="3"/><circle cx="24" cy="24.5" r="5"/><path d="M11 19.5v.1M37 29.5v.1M6 39h36"/>',
};
const fmt = (items, type) => {
  try {
    return new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type }).format(items);
  } catch {
    return items.join(", ");
  }
};

export default {
  name: "MkBands",
  components: { NxIcon, MkPhoto },
  props: {
    how: Boolean,
    questions: Boolean,
    more: Boolean,
    /* the collection (id) the page is about: left out of "More collections" */
    except: { type: [Number, String], default: null },
  },
  data: () => ({ noir, ART }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    facts() {
      return shopFacts(this.shop);
    },
    best() {
      return bySells(this.noir.products);
    },
    ranked() {
      void this.currency;
      return this.noir.cats
        .map((c, i) => {
          const ps = bySells(this.noir.products.filter((p) => p.category_id === c.id));
          const from = ps.length ? Math.min(...ps.map((p) => priceView(this.shop, p).now)) : 0;
          return { c, i, ps, from, sold: ps.reduce((s, p) => s + (p.sells || 0), 0) };
        })
        .filter((r) => r.ps.length)
        .sort((a, b) => b.sold - a.sold || a.i - b.i);
    },
    others() {
      return this.ranked.filter((r) => String(r.c.id) !== String(this.except)).slice(0, 3);
    },
    windows() {
      return (this.facts.courier?.windows || []).map((w) => String(w).toLowerCase());
    },
    slots() {
      return this.windows.filter((w) => w !== "instant");
    },
    guest() {
      try {
        return !!ShopOptionsHelper.HasGuestPayment(this.shop);
      } catch {
        return false;
      }
    },
    steps() {
      const f = this.facts;
      const names = this.noir.cats.map((c) => catTitle(c).toLowerCase());
      const out = [];
      if (names.length) out.push({ key: "pick", title: t("bakini.mk.bands.s1", "Pick your pieces"), text: t("bakini.mk.home.duoP", "Every piece is sold on its own: {names}. Add one of each, or six of one.", { names: fmt(names, "conjunction") }) });
      const ways = [];
      if (f.courier) {
        const where = f.courier.distance ? t("bakini.mk.bands.courierKm", "The courier comes within {km} km", { km: f.courier.distance }) : t("bakini.mk.bands.courier", "The courier comes");
        const when = this.slots.length ? " " + t("bakini.mk.home.inWindows", "in the {list}", { list: fmt(this.slots, "disjunction") }) + (this.windows.includes("instant") ? t("bakini.mk.home.orNow", ", or right away") : "") : "";
        ways.push(where + when + ".");
      }
      if (f.pickup) ways.push(t("bakini.mk.bands.pickup", "Or pick it up at the counter."));
      if (f.shipping) ways.push(t("bakini.mk.bands.ship", "Or have it shipped."));
      if (ways.length) out.push({ key: "window", title: t("bakini.mk.bands.s2", "Choose a way and a window"), text: ways.join(" ") });
      if (f.gateway) out.push({ key: "cash", title: f.gateway.cod ? t("bakini.mk.bands.s3", "Pay when it arrives") : t("bakini.mk.bands.s3b", "Pay your way"), text: [f.gateway.description, this.guest ? t("bakini.mk.bands.noAccount", "No account is needed to order.") : ""].filter(Boolean).join(" ") });
      return out;
    },
    qa() {
      const f = this.facts;
      const out = [];
      if (f.courier) {
        const where = f.courier.distance ? t("bakini.mk.bands.qCourierKm", "Within {km} km of the bakery", { km: f.courier.distance }) : t("bakini.mk.bands.qCourierAny", "Around the bakery");
        const when = this.slots.length ? ", " + (f.courier.days?.length === 7 || !f.courier.days?.length ? t("bakini.mk.bands.everyDay", "every day") : f.courier.days.join(", ")) + ", " + t("bakini.mk.home.inWindows", "in the {list}", { list: fmt(this.slots, "disjunction") }) + (this.windows.includes("instant") ? t("bakini.mk.home.orNow", ", or right away") : "") : "";
        const fee = f.courier.fee > 0 ? t("bakini.mk.bands.costs", "Delivery costs {amount}.", { amount: money(f.courier.fee) }) : t("bakini.mk.bands.courierFree", "Courier delivery is free.");
        out.push([t("bakini.mk.bands.qCourier", "Where does the courier deliver?"), where + when + ". " + fee]);
      }
      if (f.shipping) {
        const fee = f.shipping.fee > 0 ? t("bakini.mk.bands.shipCosts", "{way} costs {amount}", { way: f.shipping.title, amount: money(f.shipping.fee) }) + (f.shipping.freeOver ? " " + t("bakini.mk.bands.freeOver", "and is free on orders over {amount}", { amount: money(f.shipping.freeOver, true) }) : "") + "." : t("bakini.mk.bands.shipFree", "{way} is free.", { way: f.shipping.title });
        const wins = (f.shipping.windows || []).map((w) => String(w).toLowerCase());
        out.push([t("bakini.mk.bands.qShip", "Can you ship it?"), fee + (wins.length ? " " + t("bakini.mk.bands.chooseWindow", "Choose a {list} window at checkout.", { list: fmt(wins, "disjunction") }) : "")]);
      }
      if (f.pickup) {
        const note = f.pickupNote ? f.pickupNote.replace(/(\d)\s*-\s*(\d)/g, "$1–$2") : f.pickup.title;
        const days = f.everyDay ? t("bakini.mk.bands.everyDay", "every day") : f.days.join(", ");
        out.push([t("bakini.mk.bands.qPickup", "Can I pick it up?"), note + (days ? ", " + days : "") + ". " + (f.pickup.fee > 0 ? t("bakini.mk.bands.costs", "Delivery costs {amount}.", { amount: money(f.pickup.fee) }) : t("bakini.mk.bands.pickupFree", "Pickup is free."))]);
      }
      if (f.gateway) out.push([t("bakini.mk.bands.qPay", "How do I pay?"), [f.gateway.name + ".", f.gateway.description].filter(Boolean).join(" ")]);
      if (this.guest) out.push([t("bakini.mk.bands.qAccount", "Do I need an account?"), t("bakini.mk.bands.aAccount", "No. Check out as a guest with your name, phone and address, or sign in to see your orders later.")]);
      return out;
    },
  },
  created() {
    loadNoir();
  },
  methods: {
    t,
    money,
    catTitle,
    catTo,
    img(p) {
      return productImage(p);
    },
  },
};
</script>
