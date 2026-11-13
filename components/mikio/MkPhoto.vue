<!--
  Mikio Ticker — one photo slot (mikio-design m/home.js ph()): the shop's own
  photo when the Layout has it (assets/mikio/<file>, mikio-photos.ts), else
  three real product cut-outs overlapping on the slot's dotted cream ground.
  The slot keeps the photo's own proportions (w × h), so the page does not
  move when a photo is added. No words are set on a photo.
-->
<template>
  <div :class="['ph', { 'has-photo': !!url }]" :style="{ aspectRatio: w + ' / ' + h }">
    <img v-if="url" :alt="alt" :src="url" class="ph-img" decoding="async" loading="lazy" />
    <span v-else aria-hidden="true" class="ph-col">
      <span v-for="(p, i) in collage" :key="p.id" :class="['ph-c', 'ph-c' + i]"><img :src="img(p)" alt="" class="cut" decoding="async" loading="lazy" /></span>
    </span>
  </div>
</template>

<script>
import { photoUrl } from "./mikio-photos";
import { productImage } from "../bakini/noir/noir";

export default {
  name: "MkPhoto",
  props: {
    file: { type: String, required: true },
    w: { type: Number, default: 1080 },
    h: { type: Number, default: 1350 },
    products: { type: Array, default: () => [] },
    alt: { type: String, default: "" },
  },
  computed: {
    url() {
      return photoUrl(this.file);
    },
    collage() {
      return this.products.filter(Boolean).slice(0, 3);
    },
  },
  methods: {
    img(p) {
      return productImage(p);
    },
  },
};
</script>
