/*
 * Mikio Ticker — the photos the Layout shows in its photo slots (mikio-design/m/photos.js,
 * mikio-design/CODEX-PROMPTS.md): the home's slider (two portraits per collection), "One piece at
 * a time", the three delivery tiles, the story, and every collection page's hero.
 *
 * The files are assets/mikio/<file>.webp, named as the prompts name them (mikio-hero-<collection
 * name>-a.webp …), so a collection is matched by its own `name` (its address slug). They are the
 * only shop-specific files in the Layout. A slot without its photo shows a collage of real
 * product cut-outs on the slot's dotted cream ground instead (MkPhoto.vue), so a new collection,
 * a cloned shop or a photo not yet made never leaves an empty box. import.meta.glob lists only the
 * files that exist at build time.
 */
const FILES = import.meta.glob("../../assets/mikio/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_FILE = new Map<string, string>(Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!, url]));

/** The photo's URL, or null (then the slot shows its collage). */
export function photoUrl(file: string): string | null {
  return BY_FILE.get(file) || null;
}

/** The two hero photos of a collection, by the collection's name (its slug). */
export function heroFiles(category: any): [string, string] {
  const slug = String(category?.name || category?.id || "");
  return [`mikio-hero-${slug}-a.webp`, `mikio-hero-${slug}-b.webp`];
}
