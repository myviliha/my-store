import Link from "next/link";

import { THEMES } from "@/src/data/themes";

import { BODY_3 } from "./type";

/**
 * The gallery under the hero: a masonry of cards, one per theme, then a "browse all" button.
 *
 * The reference's is a CSS grid of 36 template cards of mixed heights. This is CSS multi-column
 * rather than a JS masonry, so it stays a server component and keeps source order readable.
 *
 * **The card faces are token-coloured placeholder blocks** (no `<img>`): there is no screenshot per
 * theme at a known path, and a missing file is worse than a flat block. The aspect ratio cycles so
 * the columns stagger the way the reference's do. Cards come from `THEMES`, so a twelfth theme
 * appears here without an edit.
 */
const RATIOS = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]"] as const;
const FACES = [
  "bg-[var(--store-primary-10)]",
  "bg-[var(--store-primary-20)]",
  "bg-[var(--store-neutral-40)]",
  "bg-[var(--store-primary-30)]",
] as const;

export function Gallery() {
  return (
    <section className="mx-auto mt-[var(--tn-space-lg)] w-full max-w-[1200px] px-[var(--tn-space-sm)]">
      <ul className="columns-2 gap-[var(--tn-space-xs)] md:columns-3 lg:columns-4">
        {THEMES.map((theme, index) => (
          <li
            key={theme.id}
            className="tn-reveal mb-[var(--tn-space-xs)] break-inside-avoid"
            style={{ ["--i" as string]: index % 4 }}
          >
            <Link href={`/themes/${theme.id}`} className="group block">
              <div
                aria-hidden="true"
                className={`${RATIOS[index % RATIOS.length]} ${FACES[(index + (index >> 2)) % FACES.length]} overflow-hidden rounded-[var(--tn-radius-xl)] border border-[var(--store-neutral-50)] transition-transform duration-200 group-hover:-translate-y-0.5`}
              />
              <span
                className={`${BODY_3} mt-[var(--tn-space-2xs)] block truncate text-left font-medium text-[var(--store-neutral-100)]`}
              >
                {theme.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
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
