"use client";

import { Download, Eye } from "@/app/_vendor/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Tier } from "@/src/entitlement-core";

import { BODY_3, BUTTON_PRIMARY, BUTTON_SECONDARY } from "./type";

export interface MasonryCard {
  readonly key: string;
  /** The screen's own page, which is what Preview opens. */
  readonly href: string;
  /** Where Download goes. */
  readonly download: string;
  readonly src: string;
  readonly title: string;
  /** Shown as a tag in the card's top-right corner. */
  readonly tier: Tier;
  /** Width over height, as CSS `aspect-ratio` takes it: `[16, 9]` is a landscape card. */
  readonly ratio: readonly [number, number];
}

/**
 * The gallery's grid: **a CSS grid whose cells are columns**, with the cards dealt into them.
 *
 * This is the reference's own build (template.net's `.masonry-grid-columns`): the grid is
 * `repeat(n, minmax(0, 1fr))`, each cell is a stack, and every card keeps its own aspect ratio, so
 * the columns end ragged and the wall reads as loose rather than ruled. CSS multi-column gets the
 * look but fills top to bottom, so card 2 lands under card 1; a row grid keeps order but leaves a
 * hole under every short card. Dealing by hand is the only way to have both.
 *
 * **The column count is measured, not a breakpoint**: as many 220px columns as the width fits,
 * never fewer than two, so a full-width gallery on a wide screen gains columns instead of stretching
 * its cards into banners. Each card goes to the **shortest column so far**, and the heights are
 * known before any image loads because the ratio is on the card, so nothing reflows as they arrive.
 *
 * The server render assumes four columns; the first measurement corrects it.
 *
 * **Hover shows Preview and Download**, over a dark fade from the bottom so white buttons read on
 * any screenshot. They are siblings of the image link, not children, because a link inside a link
 * is invalid HTML and browsers split it. Keyboard users get them on `:focus-visible`, not
 * `focus-within`: a click focuses the link too, and coming Back to the page restores that focus,
 * so `focus-within` left the buttons stuck open until the next click elsewhere. A mouse click never
 * matches `:focus-visible`, so only a keyboard reveals them. A touch screen
 * has no hover, so there the image and the caption are plain links to the preview.
 *
 * **The Free or Pro tag sits top-right**, where the hover fade (which rises from the bottom) never
 * reaches it, so it reads the same hovered or not. Free is teal on its tint; Pro is a solid dark
 * pill with a violet edge, so the paid one is the one that stands out. It is text in the card, not
 * `aria-hidden`, because the tier is information a screen reader user needs as well.
 */
const MIN_COLUMN = 220;
const GAP = 16;
/** The caption under each card, as a fraction of a column's width. Close enough to balance by. */
const CAPTION = 0.14;

const TAG: Record<Tier, { label: string; className: string }> = {
  free: {
    label: "Free",
    className:
      "bg-[var(--tn-accent-teal-soft)] text-[var(--tn-accent-teal-ink)] border-[var(--tn-accent-teal-soft)]",
  },
  pro: {
    label: "Pro",
    className:
      "bg-[var(--store-neutral-100)] text-white border-[var(--tn-accent-violet-solid)]",
  },
};

const deal = (cards: readonly MasonryCard[], count: number): MasonryCard[][] => {
  const columns: MasonryCard[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  for (const card of cards) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest]?.push(card);
    heights[shortest] = (heights[shortest] ?? 0) + card.ratio[1] / card.ratio[0] + CAPTION;
  }
  return columns;
};

export function Masonry({ cards }: { cards: readonly MasonryCard[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(4);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      setCount(Math.max(2, Math.floor((width + GAP) / (MIN_COLUMN + GAP))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={grid}
      className="grid items-start"
      style={{ gap: GAP, gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {deal(cards, count).map((column, c) => (
        <ul key={c} className="flex min-w-0 flex-col" style={{ gap: GAP }}>
          {column.map((card, row) => (
            <li
              key={card.key}
              className="tn-reveal group relative"
              style={{ ["--i" as string]: row % 4 }}
            >
              <div
                className="relative overflow-hidden rounded-[var(--tn-radius-xl)] border border-[var(--store-neutral-50)] bg-[var(--store-neutral-40)] transition-transform duration-300 group-hover:-translate-y-1"
                style={{ aspectRatio: `${card.ratio[0]} / ${card.ratio[1]}` }}
              >
                <Link href={card.href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
                  <Image
                    src={card.src}
                    alt=""
                    fill
                    sizes={`(min-width: 640px) ${Math.round(100 / count)}vw, 50vw`}
                    className="object-cover object-top"
                    priority={row === 0}
                  />
                </Link>
                <span
                  className={`${BODY_3} ${TAG[card.tier].className} pointer-events-none absolute right-[8px] top-[8px] z-[1] rounded-full border px-[8px] py-[1px] font-semibold shadow-[0_2px_6px_#0c0c0c1f]`}
                >
                  {TAG[card.tier].label}
                </span>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-has-[:focus-visible]:opacity-100 group-hover:opacity-100"
                />
                <div className="pointer-events-none absolute inset-x-[8px] bottom-[8px] flex gap-[6px] opacity-0 transition-opacity duration-300 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
                  <Link
                    href={card.href}
                    aria-label={`Preview ${card.title}`}
                    className={`${BUTTON_SECONDARY} min-w-0 flex-1 border-transparent`}
                  >
                    <Eye aria-hidden="true" className="size-[14px] shrink-0" />
                    Preview
                  </Link>
                  <Link
                    href={card.download}
                    aria-label={`Download ${card.title}`}
                    className={`${BUTTON_PRIMARY} min-w-0 flex-1`}
                  >
                    <Download aria-hidden="true" className="size-[14px] shrink-0" />
                    Download
                  </Link>
                </div>
              </div>
              <Link
                href={card.href}
                tabIndex={-1}
                className={`${BODY_3} mt-[var(--tn-space-2xs)] block truncate text-left font-semibold text-[var(--store-neutral-100)]`}
              >
                {card.title}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
