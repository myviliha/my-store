import Link from "next/link";

import { ASSETS, type AssetKind, KIND_COLLECTION } from "@/src/data/assets";

import { Masonry, type MasonryCard } from "./masonry";

/**
 * The gallery under the hero: a loose wall of screenshot cards, then a "browse all" button.
 *
 * **The card faces are the real captures in `public/gallery/`**, taken from `ASSETS`, so every card
 * is a screen that exists. Screenshots are per screen, not per theme, so the cards name the screen
 * and link to its page. Dashboards and application screens lead; the single-element demo pages and
 * the layout shells are left out, because a card of a lone button sells nothing.
 *
 * **It takes the parent's width less a small side margin** (16px from `md`, 32px from `lg`, on top
 * of the 24px padding), no `max-w`; `Masonry` decides how many columns that is. The margin is
 * matched on `Search` so the two edges line up.
 *
 * **Each card's shape comes from its slug**, so it is the same on every render and every deploy,
 * and the six shapes are the spread the reference's wall shows: a 16:9 deck, a 4:3 page, a square
 * logo, and three portraits down to a 2:3 poster. Cycling them in order would line the same shape
 * up across a row, which reads as a pattern rather than a wall. The captures are all 1440px wide
 * and taller than they are wide, so each is cropped from the top to its card.
 */
const COUNT = 36;
const KIND_ORDER: readonly AssetKind[] = ["dashboard", "application", "page"];
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

const CARDS: readonly MasonryCard[] = KIND_ORDER.flatMap((kind) =>
  ASSETS.filter((asset) => asset.kind === kind && asset.pattern !== "UI element"),
)
  .slice(0, COUNT)
  .map((screen) => ({
    key: screen.slug,
    href: `${KIND_COLLECTION[screen.kind]}/${screen.slug}`,
    /* There is no per-screen download: a screen ships inside a theme. `/download` is the page
       that explains what a download contains and starts one. */
    download: "/download",
    src: screen.src,
    title: screen.title,
    tier: screen.tier,
    ratio: SHAPES[hash(screen.slug) % SHAPES.length] ?? [1, 1],
  }));

export function Gallery() {
  return (
    <section className="mt-[var(--tn-space-lg)] px-[var(--tn-space-sm)] md:mx-[var(--tn-space-xs)] lg:mx-[var(--tn-space-md)]">
      <Masonry cards={CARDS} />
      <div className="mt-[var(--tn-space-sm)] flex justify-center">
        <Link
          href="/themes"
          className="rounded-[var(--tn-radius-lg)] border border-[var(--store-neutral-50)] px-[var(--tn-space-sm)] py-[var(--tn-space-2xs)] text-[length:var(--store-body-2)] font-semibold text-[var(--store-neutral-100)] transition-colors duration-200 hover:border-[var(--store-primary-40)] hover:text-[var(--store-primary-40)]"
        >
          Browse all themes
        </Link>
      </div>
    </section>
  );
}
