/*
 * Mikio Ticker — the theme switcher's config (the footer's Theme row: the
 * owner's rules: colour palettes, a custom colour and Light / Dark, a click
 * changes the whole site; the same shared package in every Layout,
 * components/theme-switcher/).
 *
 * Mikio is light first (white pages, black bars, cream tiles); Dark is the
 * warm-black version. Both sets of grounds, lines and words come from the
 * mockup (style/mikio/tokens.css, generated from mikio-design/m/a.css and
 * nx/alias.css); this config writes only the palette's action colour
 * (--bk-act*, and --bk-act-dk, the light variant the black bars use in both
 * modes) and Vuetify's theme.
 *
 * The palettes are the mockup's (mikio-design/m/home.js PRESETS): Cherry (the
 * brand), Caramel, Pistachio, Blueberry and Licorice, each built by
 * paletteFromColor() with Mikio's surfaces (the same function the Custom
 * swatch uses). White words on every light primary 4.5:1 or more; every dark
 * text colour 4.5:1 or more on the dark card.
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./bakini-theme.settings";
import { t } from "../kalio/i18n/kalio-i18n";

/* One palette; the name is read when drawn, so it follows the visitor's language. */
function pal(id: string, name: () => string, light: Record<string, string>, dark: Record<string, string>) {
  return {
    id,
    get name() {
      return name();
    },
    light,
    dark,
  };
}

export const BAKINI_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: bakini-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports the Layout into their
     own shop must not see the switcher. With themeSwitcher "showcase" it
     shows only on these shops (window.shop.id, else <meta name="shop-name">). */
  showcaseShops: [
    { id: 15740, name: "bakio" }, // Bakio: Mikio Ticker (and Bakini Noir)
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti, Argon, Senso, Medio
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "mikio-theme",
  darkClass: "bk-dark",
  defaultMode: "light",

  palettes: [
    pal(
      "cherry",
      () => t("mikio.palette.cherry", "Cherry"),
      { primary: "#b3261e", deep: "#9a0003", soft: "#ffebe8", onPrimary: "#ffffff", text: "#b3261e" },
      { primary: "#c73b30", deep: "#b52920", soft: "#4b1e19", onPrimary: "#ffffff", text: "#ff9082" },
    ),
    pal(
      "caramel",
      () => t("mikio.palette.caramel", "Caramel"),
      { primary: "#a1581d", deep: "#894500", soft: "#ffece0", onPrimary: "#ffffff", text: "#a1581d" },
      { primary: "#a35a1f", deep: "#934b08", soft: "#482304", onPrimary: "#ffffff", text: "#ec9d65" },
    ),
    pal(
      "pistachio",
      () => t("mikio.palette.pistachio", "Pistachio"),
      { primary: "#4c762a", deep: "#386212", soft: "#e7f6de", onPrimary: "#ffffff", text: "#4c762a" },
      { primary: "#4f7a2e", deep: "#416b1e", soft: "#1f350d", onPrimary: "#ffffff", text: "#8dbc6e" },
    ),
    pal(
      "blueberry",
      () => t("mikio.palette.blueberry", "Blueberry"),
      { primary: "#2f56a6", deep: "#1c4190", soft: "#e9f1ff", onPrimary: "#ffffff", text: "#2f56a6" },
      { primary: "#436bbe", deep: "#355cad", soft: "#1a2c51", onPrimary: "#ffffff", text: "#85afff" },
    ),
    pal(
      "licorice",
      () => t("mikio.palette.licorice", "Licorice"),
      { primary: "#2b2b2b", deep: "#1a1a1a", soft: "#f0f0f0", onPrimary: "#ffffff", text: "#2b2b2b" },
      { primary: "#6d6d6d", deep: "#5f5f5f", soft: "#2e2e2e", onPrimary: "#ffffff", text: "#aeaeae" },
    ),
  ],

  /* Palette value -> the variables that carry it (style/bakini-theme.scss
     maps every inherited name onto these). */
  tokens: {
    "--bk-act": "primary",
    "--bk-act-deep": "deep",
    "--bk-act-soft": "soft",
    "--bk-act-on": "onPrimary",
    "--bk-act-text": "text",
    "--bk-act-dk": "dark.text",
    "--bk-act-rgb": "primary:rgb",
    "--bk-act-on-rgb": "onPrimary:rgb",
  },

  /* The grounds, lines and words of each mode are in bakini-theme.scss
     (:root and html.bk-dark), so nothing is written inline for a mode. */
  dark: {},
  light: {},

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    /* Mikio's dark: Selldone's fields, menus, dialogs and sheets are dark too. */
    darkColors: {
      background: "#121110",
      surface: "#1b1917",
      "surface-bright": "#26221f",
      "surface-variant": "#302b27",
      "on-background": "#f5f0ea",
      "on-surface": "#f5f0ea",
      "on-surface-variant": "#d8d0c7",
      "on-primary": "#ffffff",
      secondary: "#ff9082",
      "on-secondary": "#121110",
      error: "#f2a07f",
      info: "#ff9082",
      success: "#8fd19e",
      warning: "#f2c27f",
    },
    lightColors: {
      background: "#ffffff",
      surface: "#ffffff",
      "on-background": "#141210",
      "on-surface": "#141210",
      secondary: "#141210",
      "on-secondary": "#ffffff",
      error: "#b3261e",
    },
  },

  /* The browser's own bar: the page's ground, not the action colour. */
  metaThemeColor: false,
  ui: { ink: "var(--bk-bar-ink)", muted: "var(--bk-bar-muted)", line: "var(--bk-bar-line)", surface: "var(--bk-bar)", font: "var(--bk-f-body)" },
  /* Read when drawn, so they follow the visitor's language (theme.* are the
     shared Kalio words). */
  labels: {
    get theme() {
      return t("theme.title", "Theme");
    },
    get palettes() {
      return t("theme.palettes", "Colour");
    },
    get mode() {
      return t("theme.mode", "Light or dark");
    },
    get modeTitle() {
      return t("theme.modeTitle", "Mode");
    },
    get light() {
      return t("theme.light", "Light");
    },
    get dark() {
      return t("theme.dark", "Dark");
    },
    get custom() {
      return t("theme.custom", "Custom colour");
    },
    get adjusted() {
      return t("theme.adjusted", "Adjusted for readability");
    },
    get brand() {
      return t("theme.brand", "Brand colour");
    },
  },

  /* "Custom colour" (the owner, 9 November 2026): any colour, made readable
     by paletteFromColor() against Noir's own surfaces (the mockup's
     NOIR_OPTIONS). No header band carries the action colour, so 4.5:1. */
  custom: {
    headerContrast: 4.5,
    darkSurfaces: ["#121110", "#1b1917", "#26221f"],
    lightSurfaces: ["#ffffff", "#fbe9d7", "#f6efe8"],
    darkText: "#141210",
  },
};
