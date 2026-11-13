<!--
  Mikio Ticker — a rail (mikio-design/m/home.js rail(), nx/core.js row()): a
  centred title and lead (and a "Shop all …" link) with two round arrows on
  the right, then a scroll-snap track of the home's cards. An arrow is
  disabled at its end; right to left, the arrows swap. Phones: the title
  moves left and the track is swiped.
-->
<template>
  <section :id="id || undefined" :aria-labelledby="hid" :class="['rail', cls]">
    <div class="wrap rl-hd">
      <div class="rl-tx">
        <h2 :id="hid" class="h2">{{ title }}{{ accent ? " " + accent : "" }}</h2>
        <p v-if="sub" class="lead">{{ sub }}</p>
        <router-link v-if="moreTo && moreLabel" :to="moreTo" class="rl-more">{{ moreLabel }}<nx-icon name="arrow" /></router-link>
      </div>
      <div class="rl-arr">
        <button :aria-label="t('bakini.n.row.backOf', 'Scroll {name} back', { name: plain })" :disabled="atStart" class="arr" type="button" @click="page(-1)"><nx-icon name="left" /></button>
        <button :aria-label="t('bakini.n.row.forwardOf', 'Scroll {name} on', { name: plain })" :disabled="atEnd" class="arr" type="button" @click="page(1)"><nx-icon name="right" /></button>
      </div>
    </div>
    <ul ref="track" class="track" @scroll.passive="update">
      <slot>
        <nx-card v-for="p in items" :key="p.id" :look="look" :product="p" tag="li" />
      </slot>
    </ul>
  </section>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxCard from "./NxCard.vue";
import { scrollBehavior } from "./noir";
import { isRtl } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

let uid = 0;

export default {
  name: "NxRow",
  components: { NxIcon, NxCard },
  props: {
    id: { type: String, default: "" },
    cls: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    accent: { type: String, default: "" },
    sub: { type: String, default: "" },
    moreTo: { type: [Object, String], default: null },
    moreLabel: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    look: Boolean,
  },
  data: () => ({ atStart: true, atEnd: false, n: ++uid }),
  computed: {
    hid() {
      return (this.id || "rail-" + this.n) + "-h";
    },
    plain() {
      return (this.title + (this.accent ? " " + this.accent : "")).toLowerCase();
    },
  },
  watch: {
    items() {
      this.$nextTick(() => {
        if (this.$refs.track) this.$refs.track.scrollLeft = 0;
        this.update();
      });
    },
  },
  mounted() {
    this.onResize = () => this.update();
    window.addEventListener("resize", this.onResize, { passive: true });
    this.update();
    setTimeout(() => this.update(), 400);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    t,
    update() {
      const tr = this.$refs.track;
      if (!tr) return;
      const x = Math.abs(tr.scrollLeft);
      const max = tr.scrollWidth - tr.clientWidth - 2;
      this.atStart = x <= 2;
      this.atEnd = x >= max;
    },
    page(dir) {
      const tr = this.$refs.track;
      if (!tr) return;
      const card = tr.querySelector(".pc");
      const w = card ? card.getBoundingClientRect().width + 16 : tr.clientWidth * 0.84;
      const n = Math.max(1, Math.floor(tr.clientWidth / w) - 1);
      const sign = isRtl() ? -1 : 1;
      tr.scrollBy({ left: dir * sign * w * n, behavior: scrollBehavior() });
    },
  },
};
</script>
