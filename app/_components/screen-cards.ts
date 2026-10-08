import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { ASSETS, type Asset, type AssetKind, KIND_COLLECTION } from "@/src/data/assets";

import type { MasonryCard } from "./masonry";
import { FRAMEWORKS } from "./recipe";

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

export const toCards = (screens: readonly Asset[]): readonly MasonryCard[] =>
  screens.map((screen) => ({
    key: screen.slug,
    href: `${KIND_COLLECTION[screen.kind]}/${screen.slug}`,
    /* There is no per-screen download: a screen ships inside a theme. `/download` is the page
       that explains what a download contains and starts one. */
    download: "/download",
    src: screen.src,
    title: screen.title,
    tier: screen.tier,
    frameworks: SHIPS_IN,
    ratio: SHAPES[hash(screen.slug) % SHAPES.length] ?? [1, 1],
  }));

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

/** The marketing blocks (`/blocks/*`), the Explore panel's "Landing Page" tab. */
export const LANDING_CARDS: readonly MasonryCard[] = toCards(
  ASSETS.filter((asset) => asset.pattern === "Marketing"),
);
