"use client";

import { useState } from "react";

import { Glyph } from "./composer";
import { Masonry, type MasonryCard } from "./masonry";
import { EXPLORE_CARDS, LANDING_CARDS } from "./screen-cards";
import { FONT } from "./type";

/**
 * **Explore Themes**, beside the conversation (Figma "AI Builder - Guest", node 850:6870).
 *
 * Opened by the style step's Explore themes button. The layout is the design's: the title, a row of
 * category tabs, then the themes. **The themes are the home page's masonry**, not the design's
 * two-column card grid (by request): the same `Masonry` and card builder from `screen-cards.ts`, Free
 * and Pro tags, and Preview and Download on hover, so a screen looks the same here as on the home page.
 * **Each tab shows at most ten**, the chat brief's curated ten (`EXPLORE_CARDS`, § 4 and § 11).
 *
 * **The tabs are the brief's categories** (§ 3): Dashboard UI first and selected, Landing Page, and
 * the two that are not built yet, Email Templates and Docker, shown at the design's 40% and
 * disabled, so they read as coming rather than as broken. Their labels are the design's own,
 * " . soon" included.
 *
 * The title and tabs are drawn to the design's values: the title is Plus Jakarta Sans SemiBold 28 at
 * 1.2 (`--store-headline-10`), the tabs 39px pills 10px apart, 17px across, a 1px #D3D7DD edge and
 * Inter 14 in #111418. The design shows no selected tab, so the selected one takes the brand tint
 * the conversation's other choices use.
 */

type Category = "dashboard" | "landing" | "email" | "docker";

const CATEGORIES: readonly {
  readonly id: Category;
  readonly label: string;
  readonly cards?: readonly MasonryCard[];
}[] = [
  { id: "dashboard", label: "Dashboard UI", cards: EXPLORE_CARDS },
  { id: "landing", label: "Landing Page", cards: LANDING_CARDS },
  { id: "email", label: "Email Templates . soon" },
  { id: "docker", label: "Docker . soon" },
];

const TAB =
  "inline-flex h-[39px] shrink-0 items-center justify-center rounded-[50px] border bg-white px-[17px] py-[12px] font-[family-name:var(--font-inter)] text-[14px] font-normal leading-[1.2] whitespace-nowrap text-[#111418] transition-colors duration-150 enabled:cursor-pointer enabled:hover:border-[var(--store-primary-40)] disabled:cursor-not-allowed disabled:opacity-40";

export function Explore({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<Category>("dashboard");
  const cards = CATEGORIES.find((c) => c.id === category)?.cards ?? [];

  return (
    <aside
      aria-label="Explore themes"
      className="flex h-full min-h-0 flex-col gap-[16px] rounded-[16px] border border-[var(--store-card-border)] bg-white/80 p-[16px] backdrop-blur"
    >
      <header className="flex items-start justify-between gap-[12px]">
        <h2
          className={`${FONT} font-[family-name:var(--store-font-headline)] text-[length:var(--store-headline-10)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}
        >
          Explore Themes
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close themes"
          className="flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
        >
          <Glyph size={18}>
            <path d="M6 6l12 12M18 6L6 18" />
          </Glyph>
        </button>
      </header>

      {/* **Not a scroll container** (2026-10-08). The row was made to scroll sideways so the four tabs
          stayed on one line, and with its scrollbar hidden the cursor flickered between the pointer
          and the arrow while moving over a tab: Chrome keeps asking whether the pointer is over a
          scrollbar there. The tabs now wrap when the panel is narrow and sit on one row, as the
          design has them, when it is wide enough. */}
      <div role="tablist" aria-label="Categories" className="flex shrink-0 flex-wrap items-center gap-[10px]">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            disabled={!c.cards}
            title={c.cards ? undefined : "Coming soon"}
            onClick={() => setCategory(c.id)}
            className={`${TAB} ${category === c.id ? "border-[var(--store-primary-40)] bg-[var(--store-primary-10)]" : "border-[#d3d7dd]"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* The wall scrolls on its own, and keeps its scroll to itself (`overscroll-contain`), so the
          end of the list does not hand the wheel to the page. `key` restarts the masonry's reveal
          when the category changes.
          **4px of room above the top row** (`pt-[4px]`): a hovered card lifts 4px
          (`group-hover:-translate-y-1` in `masonry.tsx`) and the scroll box clipped the top row's
          lift. The matching `-mt-[4px]` keeps the cards exactly where they were. */}
      <div
        role="tabpanel"
        className="-mt-[4px] min-h-0 flex-1 overflow-y-auto overscroll-contain pt-[4px] pr-[2px]"
      >
        <Masonry key={category} cards={cards} />
      </div>
    </aside>
  );
}
