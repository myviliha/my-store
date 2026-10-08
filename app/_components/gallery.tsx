import Link from "next/link";

import { Masonry } from "./masonry";
import { GALLERY_CARDS } from "./screen-cards";

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
 * **The cards are `GALLERY_CARDS` from `screen-cards.ts`**, the same ones the conversation's
 * Explore Themes panel shows, so a screen looks and links the same in both places; each card's shape
 * comes from its slug, and the reasoning for that lives with the builder.
 */
export function Gallery() {
  return (
    <section className="mt-[var(--tn-space-lg)] px-[var(--tn-space-sm)] md:mx-[var(--tn-space-xs)] lg:mx-[var(--tn-space-md)]">
      <Masonry cards={GALLERY_CARDS} />
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
