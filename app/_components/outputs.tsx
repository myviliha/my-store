import type { ComponentType } from "react";
import {
  type SimpleIcon,
  siAngular,
  siBootstrap,
  siBulma,
  siHtml5,
  siLaravel,
  siNextdotjs,
  siReact,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
} from "simple-icons";

import { Archive, Tokens } from "@/app/_vendor/icons";
import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { STYLE_PAGES } from "@/src/data/styles";

import { accentAt, BODY_3, FONT, H2, LEAD, SECTION } from "./type";

/**
 * "What types of outputs": an H2, a paragraph, then the reference's grid of icon tiles. Theirs is
 * file and destination formats; ours is what a buyer receives, by framework, CSS system and
 * artefact.
 *
 * **Each framework and CSS system wears its own official mark**, from `simple-icons` (CC0): the
 * project's published logo path and brand colour, not a drawing of ours, so nothing here is an
 * invented mark. The tile is a 12% tint of that brand colour with the logo in full colour, which
 * keeps the row colourful without seven brands fighting one palette. The two artefacts that are not
 * brands, design tokens and the zip, take a Radix glyph in the page's accents instead.
 *
 * **Keyed by id, not by label**, so renaming "Vue" to "Vue.js" in `LABELS` cannot drop its logo.
 * An id with no entry here (a seventh framework, say) falls back to the two-letter monogram this
 * section used to show for everything, so a new edition still renders rather than vanishing.
 *
 * The tile is 56px with the 12px label under it at 150% line height, from the reference.
 * Frameworks and CSS systems are read from the same matrix the theme pages use, so this row
 * cannot list an edition that does not build.
 */
const BRANDS: Record<string, SimpleIcon> = {
  react: siReact,
  nextjs: siNextdotjs,
  vue: siVuedotjs,
  angular: siAngular,
  html: siHtml5,
  laravel: siLaravel,
  tailwind: siTailwindcss,
  bootstrap: siBootstrap,
  bulma: siBulma,
  typescript: siTypescript,
};

type Glyph = ComponentType<{ className?: string }>;

interface Item {
  readonly id: string;
  readonly label: string;
  /** A non-brand artefact's glyph. Brands are looked up in `BRANDS` by `id`. */
  readonly glyph?: Glyph;
}

const ITEMS: readonly Item[] = [
  ...[...new Set(AVAILABLE.map((row) => row.framework))].map((id) => ({ id, label: labelOf(id) })),
  ...STYLE_PAGES.map((style) => ({ id: style.id, label: style.label })),
  { id: "typescript", label: "TypeScript" },
  { id: "tokens", label: "Design tokens", glyph: Tokens },
  { id: "zip", label: "Zip", glyph: Archive },
];

const TILE =
  "grid size-14 place-items-center rounded-[var(--tn-radius-xl)] transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-[-4deg]";

function Tile({ item, index }: { item: Item; index: number }) {
  const brand = BRANDS[item.id];
  if (brand) {
    return (
      <span
        aria-hidden="true"
        className={TILE}
        style={{ backgroundColor: `color-mix(in oklab, #${brand.hex} 12%, white)` }}
      >
        <svg viewBox="0 0 24 24" className="size-7" fill={`#${brand.hex}`}>
          <path d={brand.path} />
        </svg>
      </span>
    );
  }
  const accent = accentAt(index);
  const Glyph = item.glyph;
  return (
    <span aria-hidden="true" className={`${TILE} ${accent.soft} ${accent.ink}`}>
      {Glyph ? (
        <Glyph className="size-7" />
      ) : (
        <span className={`${FONT} text-[length:var(--store-body-1)] font-bold`}>
          {item.label.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

export function Outputs() {
  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <div className="tn-reveal flex max-w-[850px] flex-col gap-[var(--tn-space-2xs)]">
        <h2 className={H2}>What does Voilet generate?</h2>
        <p className={LEAD}>
          One description, delivered as a zip of source in the framework you pick, styled with the
          CSS system you pick, on the theme you pick. Nothing is hosted and nothing is locked in.
        </p>
      </div>
      <ul className="flex w-full max-w-[1000px] flex-wrap justify-center gap-[var(--tn-space-sm)]">
        {ITEMS.map((item, index) => (
          <li
            key={item.id}
            className="tn-reveal flex w-24 flex-col items-center gap-[var(--tn-space-2xs)] px-[var(--tn-space-2xs)] py-[10px]"
            style={{ ["--i" as string]: index % 6 }}
          >
            <Tile item={item} index={index} />
            <span className={`${BODY_3} text-[var(--store-neutral-100)]`}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
