// mikio-css.cjs: ports the Mikio A "Ticker" mockup's stylesheets (mikio-design/m and
// mikio-design/nx, in the order the mockup pages load them) into the Layout as
// style/mikio/*.css, unchanged in look:
//
//   node scripts/mikio-css.cjs [<path to mikio-design>]
//
// - Every rule is scoped to the Layout's own markup: the first compound of each
//   selector gets :is(.nx, .nx *) (or :where() for a bare element rule), so a
//   rule matches only an element that is (inside) an element with class "nx"
//   (every Mikio component wraps its markup in one); Selldone's and Vuetify's
//   parts outside .nx are never touched.
// - Custom properties take the --bk- prefix (the names the whole Layout and the
//   theme switcher read). The token blocks (:root and the dark one, in m/a.css,
//   nx/alias.css and the map's) go to style/mikio/tokens.css as html:root and
//   html.bk-dark:root, so they outrank style/bakini-theme.scss.
// - html[data-mode="dark"] / :root[data-mode="dark"] -> html.bk-dark.
// - img[src^="img/…"] (the mockup's cut-out photos) -> img.cut.
// - The footer theme row (.ts-*) -> .nts-* (the kit's ThemeSwitcherRow uses
//   .ts-*); keyframes -> nx-*.
// Re-run after the mockup changes; style/mikio/ is generated, never edited.
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const sp = require("postcss-selector-parser");

const SRC = process.argv[2] || path.resolve(__dirname, "../../mikio-design");
const OUT = path.resolve(__dirname, "../style/mikio");
const FILES = [["base", "nx/base.css"], ["pages", "nx/pages.css"], ["product", "nx/product.css"], ["buy", "nx/buy.css"], ["read", "nx/read.css"], ["core", "m/core.css"], ["a", "m/a.css"], ["alias", "nx/alias.css"], ["shop", "nx/shop.css"], ["ticker", "nx/ticker.css"]];
const TOKENS = [];
const SCOPE = ":where(.nx, .nx *)";
const KEYFRAMES = new Map();

const renameVars = (v) => v.replace(/var\(\s*--(?!bk-)([\w-]+)/g, "var(--bk-$1");

function scopeSelector(sel) {
  sel = sel
    .replace(/(?:html|:root)\[data-mode=["']?dark["']?\]/g, "html.bk-dark")
    .replace(/html:not\(\[data-mode=["']?dark["']?\]\)/g, "html:not(.bk-dark)")
    .replace(/img\[src\^=["']?img\/[\w-]*["']?\]/g, "img.cut")
    .replace(/\.ts-/g, ".nts-");
  if (/^\s*(:root|html)\s*$/.test(sel)) return sel;
  return sp((root) => {
    root.each((selector) => {
      // html… prefix: keep it, scope what follows.
      let first = selector.first;
      const nodes = selector.nodes;
      let i = 0;
      if (first && first.type === "tag" && first.value === "html") {
        // skip the html compound
        while (i < nodes.length && nodes[i].type !== "combinator") i++;
        i++; // past the combinator
        if (i >= nodes.length) return;
      }
      if (first && first.type === "tag" && first.value === "body") {
        // "body" (and body.long …) is the scope root itself.
        const bodyNode = nodes[0];
        const scope = sp.pseudo({ value: ":where" });
        scope.append(sp.selector({ nodes: [sp.className({ value: "nx" })] }));
        bodyNode.replaceWith(scope);
        return;
      }
      // find the end of the compound starting at i (before a pseudo-element)
      let j = i;
      let insertAt = -1;
      while (j < nodes.length && nodes[j].type !== "combinator") {
        if (nodes[j].type === "pseudo" && nodes[j].value.startsWith("::")) {
          insertAt = j;
          break;
        }
        j++;
      }
      if (insertAt < 0) insertAt = j;
      /* A compound that names a class, attribute or id gets :is() (one class
         more for every such Noir rule alike, so the mockup's own order and
         weights hold, while a later-loaded reset of the same weight, such as
         Vuetify's [type=button] { color: inherit } or Selldone's .ghost, no
         longer wins). A bare element rule (button, a, h2) keeps :where(), so
         Vuetify's and Selldone's own parts inside a Noir page are not touched. */
      const compound = nodes.slice(i, insertAt);
      const named = compound.some((n) => n.type === "class" || n.type === "attribute" || n.type === "id");
      const where = sp.pseudo({ value: named ? ":is" : ":where" });
      where.append(sp.selector({ nodes: [sp.className({ value: "nx" })] }));
      where.append(sp.selector({ nodes: [sp.className({ value: "nx" }), sp.combinator({ value: " " }), sp.universal()] }));
      if (insertAt < nodes.length) selector.insertBefore(nodes[insertAt], where);
      else selector.append(where);
    });
  }).processSync(sel);
}

const out = [];
/* a token block: :root, html.bk-dark, or one of them inside a media query */
const isTokens = (rule) => (rule.selectors || []).every((x) => /^\s*(:root|html\.bk-dark)\s*$/.test(x.replace(/(?:html|:root)\[data-mode=["']?dark["']?\]/g, "html.bk-dark")));
for (const [name, rel] of FILES) {
  const file = path.join(SRC, rel);
  if (!fs.existsSync(file)) { console.log("missing", file); continue; }
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkAtRules("keyframes", (at) => {
    const n = "nx-" + at.params.trim();
    KEYFRAMES.set(at.params.trim(), n);
    at.params = n;
  });
  const toks = postcss.root();
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    if (isTokens(rule)) {
      const dark = rule.selectors.some((x) => /dark/.test(x));
      const r = rule.clone({ selector: dark ? "html.bk-dark:root" : "html:root" });
      if (rule.parent && rule.parent.type === "atrule") { const at = rule.parent.clone({ nodes: [] }); at.append(r); toks.append(at); } else toks.append(r);
      const parent = rule.parent; rule.remove();
      if (parent && parent.type === "atrule" && !parent.nodes.length) parent.remove();
      return;
    }
    rule.selectors = (rule.selectors || []).map(scopeSelector);
  });
  for (const r of [root, toks]) r.walkDecls((d) => {
    if (d.prop.startsWith("--") && !d.prop.startsWith("--bk-")) d.prop = "--bk-" + d.prop.slice(2);
    d.value = renameVars(d.value);
    if (/^animation(-name)?$/.test(d.prop)) for (const [a, b] of KEYFRAMES) d.value = d.value.replace(new RegExp("\\b" + a + "\\b", "g"), b);
  });
  if (toks.nodes.length) TOKENS.push("/* from " + rel + " */\n" + toks.toString());
  const css = root.toString();
  fs.mkdirSync(OUT, { recursive: true });
  const head = "/* GENERATED by scripts/mikio-css.cjs from mikio-design/" + rel + ' (the A "Ticker" mockup). Do not edit: change the mockup or style/mikio-layout.scss, then re-run. */\n';
  fs.writeFileSync(path.join(OUT, name + ".css"), head + css);
  out.push(name + ".css " + css.length);
}
fs.writeFileSync(path.join(OUT, "tokens.css"), "/* GENERATED by scripts/mikio-css.cjs: the mockup's tokens (m/a.css, nx/alias.css, the map's) with the --bk- prefix, as html:root and html.bk-dark:root so they outrank style/bakini-theme.scss. */\n" + TOKENS.join("\n"));
out.push("tokens.css");
console.log(out.join("\n"));
