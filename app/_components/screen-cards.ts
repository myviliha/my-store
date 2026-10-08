import { DESIGNS } from "@/app/_vendor/vui-core";
import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { ASSETS, type Asset, type AssetKind, assetBySlug, KIND_COLLECTION } from "@/src/data/assets";

import type { MasonryCard } from "./masonry";
import { tierOf } from "@/src/entitlement-core";

import { FRAMEWORKS, pagesOf, useCaseOf } from "./recipe";

/**
 * The frameworks a screen ships in, **read from `AVAILABLE`, not typed**: every screen is built in
 * every available framework (framework is not a tier, `entitlement-core.ts`), so this is one list
 * for all cards. Ordered as the recipe recommends them (Next.js, then React…), so the two a card
 * shows are the two most people start with.
 */
const SHIPS_IN: readonly string[] = FRAMEWORKS.filter((f) =>
  AVAILABLE.some((row) => row.framework === f.id),
).map((f) => labelOf(f.id));

/**
 * The screenshot cards the masonry walls show, built once for every wall that shows them: the home
 * page's gallery and the conversation's Explore Themes panel (2026-10-08). One builder, so a card
 * looks and links the same wherever it appears, and its shape is the same on both.
 *
 * **Each card's shape comes from its slug**, so it is the same on every render and every deploy,
 * and the six shapes are the spread the reference's wall shows: a 16:9 deck, a 4:3 page, a square
 * logo, and three portraits down to a 2:3 poster. The captures are all 1440px wide and taller than
 * they are wide, so each is cropped from the top to its card.
 */
const SHAPES: readonly (readonly [number, number])[] = [
  [16, 9],
  [4, 3],
  [1, 1],
  [4, 5],
  [3, 4],
  [2, 3],
];

/** A small, stable string hash (FNV-1a), so a slug always picks the same shape. */
const hash = (text: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/*
 * ┌─ DEMO-ONLY(theme-names) ────────────────────────────────────────────────────────────────────────┐
 * │ REMOVE WHEN EACH THEME HAS ITS OWN SCREENSHOTS. Find every piece with:                          │
 * │   grep -rn "DEMO-ONLY(theme-names)" app                                                         │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * **Every card is titled with a theme name from `vui-core.ts`, assigned at random** (2026-10-08, by
 * request, "this is just demo"). Every image in `public/gallery/` is a capture of the **Voilet** build,
 * so a card titled "Console" shows Voilet's screen: the brief asks for "real screenshots of the
 * delivered product" (§ 4), which this is not, and it must go once each design is captured.
 *
 * "Random" is a seeded shuffle of the designs, so a card keeps its name on every render and the
 * server and the browser agree (no hydration mismatch). Cards take names in turn from that shuffle,
 * so any ten in a row, the Explore panel's curated ten included, carry ten different names.
 *
 * **The Free/Pro tag follows the name, by the real rule** (`tierOf`): a card is Free only when its
 * theme is Voilet and its screen is not a Pro screen, so a "Console" card never claims to be Free.
 *
 * To remove: title cards with `screen.title`, set `tier: screen.tier`, and delete `DEMO_THEMES`.
 */
const DEMO_THEMES: readonly { readonly id: string; readonly label: string }[] = [
  /* Voilet first: it is the one Free design, and the first card is a Free dashboard, so the wall
     opens on a Free card. Shuffled into the middle it fell on Pro screens or outside the first ten,
     and no card anywhere was Free. */
  ...DESIGNS.filter((d) => d.id === "voilet"),
  ...[...DESIGNS]
    .filter((d) => d.id !== "voilet")
    .sort((a, b) => hash(`demo:${a.id}`) - hash(`demo:${b.id}`)),
].map((d) => ({ id: d.id, label: d.label }));

export const toCards = (screens: readonly Asset[]): readonly MasonryCard[] =>
  screens.map((screen, i) => {
    const theme = DEMO_THEMES[i % DEMO_THEMES.length] ?? { id: "voilet", label: "Voilet" };
    return {
      key: screen.slug,
      href: `${KIND_COLLECTION[screen.kind]}/${screen.slug}`,
      /* There is no per-screen download: a screen ships inside a theme. `/download` is the page
         that explains what a download contains and starts one. */
      download: "/download",
      src: screen.src,
      /* DEMO-ONLY(theme-names): the theme's name, not the screen's. */
      title: theme.label,
      tier: tierOf(theme.id, { pro: screen.pro }),
      frameworks: SHIPS_IN,
      ratio: SHAPES[hash(screen.slug) % SHAPES.length] ?? [1, 1],
    };
  });

/**
 * The home gallery's 36: dashboards and application screens lead; the single-element demo pages
 * and the layout shells are left out, because a card of a lone button sells nothing. It is also
 * the Explore panel's "Dashboard UI" tab.
 */
const COUNT = 36;
const KIND_ORDER: readonly AssetKind[] = ["dashboard", "application", "page"];
export const GALLERY_CARDS: readonly MasonryCard[] = toCards(
  KIND_ORDER.flatMap((kind) =>
    ASSETS.filter((asset) => asset.kind === kind && asset.pattern !== "UI element"),
  ).slice(0, COUNT),
);

/**
 * **Ten themes, curated, in the Explore panel** (2026-10-08), from the chat brief: "Show ten curated
 * theme thumbnails… drawn from the released catalogue… including relevant pages beyond its overview
 * dashboard" (§ 4), and "Guest welcome with ten themes and category tabs" (§ 11).
 *
 * **The selection is authored**, because the catalogue marks nothing as curated: three Free
 * dashboards, then one Pro screen from each application family, so the ten show what the product
 * covers rather than ten variations on one overview. Slugs resolve through `assetBySlug`, so a screen
 * that leaves the catalogue drops out instead of breaking the wall.
 */
export const EXPLORE_LIMIT = 10;
const EXPLORE_SLUGS = [
  "crm",
  "analytics",
  "saas",
  "products-list",
  "invoices",
  "task-kanban",
  "inbox",
  "candidates",
  "support-tickets",
  "file-manager",
] as const;

/** The Explore panel's "Dashboard UI" tab: the curated ten. */
export const EXPLORE_CARDS: readonly MasonryCard[] = toCards(
  EXPLORE_SLUGS.map((slug) => assetBySlug(slug)).filter((a): a is Asset => Boolean(a)),
).slice(0, EXPLORE_LIMIT);

/** The marketing blocks (`/blocks/*`), the Explore panel's "Landing Page" tab, held to the same ten. */
export const LANDING_CARDS: readonly MasonryCard[] = toCards(
  ASSETS.filter((asset) => asset.pattern === "Marketing"),
).slice(0, EXPLORE_LIMIT);

/**
 * A website domain's own screens, for the home page's domain chips (2026-10-08): the same page set
 * the guided chat offers for that kind of admin (`USE_CASES` in `recipe.ts`), so choosing "CRM" here
 * shows exactly the screens a CRM recipe would ship.
 */
export const domainCards = (domain: string): readonly MasonryCard[] =>
  toCards(pagesOf(useCaseOf(domain)));
