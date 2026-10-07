"use client";

import { Search as SearchIcon } from "../_vendor/icons";
import Link from "next/link";
import { useRef, useState } from "react";
import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { THEMES } from "@/src/data/themes";

import { BODY_2, BODY_3, FONT } from "./type";

/**
 * The search field and the chip strip under the prompt card.
 *
 * **The search expands on focus, and that is the reference's actual behaviour** (`SD-210`). Its
 * `#search-box-csr` goes from `width: 0` to `width: 100%`, carrying an inline `1098px` once open,
 * and a result panel appears beneath it. Collapsed, it shares the row with the chips; open, it takes
 * the row. The transition is the page's own default, `.15s` on `cubic-bezier(.4,0,.2,1)`, and the
 * chips fade rather than reflow so nothing jumps sideways while the field grows.
 *
 * **One row, not two.** The reference lays the search and the chips side by side: the search takes
 * `margin: 0 8px 0 0` and the tag strip is `flex: 1 1 auto` with `min-width: 0`. The chips are
 * `flex-wrap: nowrap` inside `overflow: auto`, so a long strip scrolls rather than growing a second
 * line and pushing the gallery down.
 *
 * **The panel's three lists are the reference's three**: a filter row, a trending list, and a
 * generate list. Ours are filled from `THEMES` and `AVAILABLE`, the modules `/themes/[id]` and the
 * footer already read, so a row here cannot point at a page that does not exist.
 */

/** The reference's `.form-control-xl`: `.5rem .75rem`, 14px, line-height `1.375rem`. */
const FIELD =
  "h-[40px] w-full rounded-full border border-[var(--store-card-border)] bg-white " +
  "py-[0.5rem] pr-[0.75rem] pl-[40px] text-[length:var(--store-body-2)] leading-[1.375rem] " +
  "text-[var(--store-neutral-100)] outline-none transition-colors duration-150 " +
  "placeholder:text-[var(--store-neutral-70)] focus:border-[var(--store-primary-40)]";

const PANEL_HEADING = `${BODY_3} px-[12px] pt-[12px] pb-[4px] text-start font-medium text-[var(--store-neutral-70)]`;
const PANEL_ROW = `${BODY_2} flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-10)]`;

export function Search() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  return (
    <section
      /* **`z-20` belongs on the section, not on the panel** (`SD-212`). A `z-index` orders a child
         inside its parent's stacking context; it cannot lift that child above a **later sibling of
         the parent**. The panel carried `z-10` and the gallery below it still painted over the top,
         because the section itself was at `auto` and the gallery simply came after it. Lifting the
         section is what puts the whole search block in front; the panel's own `z-10` then only has
         to beat the chips beside it. */
      /* **`lg` above, matching the `lg` below** (`SD-213`). This row sat on `sm`, 24px, while the
         gallery beneath it takes `lg`, 40px, so the search read as attached to the prompt card and
         detached from the results it filters. It belongs to neither more than the other, so the two
         gaps are the same. */
      className="tn-rise relative z-20 mx-auto mt-[var(--tn-space-lg)] flex w-full max-w-[1180px] items-start gap-[8px] px-[var(--tn-space-sm)]"
      style={{ ["--i" as string]: 3 }}
      /* Closes when focus leaves the whole box rather than the input, so a click on a row inside
         the panel is not cancelled by the blur that precedes it. */
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      ref={box}
    >
      {/* **This one does not grow** (`SD-211`). The reference expands its field in the header,
          where the box starts at `width: 0`; here the field is already at its size and the only
          thing that changes is the panel beneath it. Two searches, two behaviours, and conflating
          them made the chips beside this one dodge out of the way for no reason. */}
      <div className="relative mr-[8px] w-[390px] shrink-0">
        <form action="/themes" method="get" role="search" className="relative">
          <label htmlFor="search" className="sr-only">
            Search themes
          </label>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-[16px] top-1/2 size-[18px] -translate-y-1/2 text-[var(--store-neutral-70)]"
          />
          <input
            id="search"
            name="q"
            type="search"
            autoComplete="off"
            onFocus={() => setOpen(true)}
            /* Static here. The reference swaps its placeholder as the field grows, and this field
               does not grow, so a line that changes under the cursor would be churn. */
            placeholder="Search themes"
            className={`${FONT} ${FIELD}`}
          />
        </form>

        {open && (
          <div className="tn-fall absolute inset-x-0 top-[48px] z-10 overflow-hidden rounded-[8px] border border-[var(--store-card-border)] bg-white shadow-[0px_16px_32px_0px_#1f21241f]">
            <div className="flex items-center gap-[8px] border-b border-[var(--store-neutral-40)] px-[12px] py-[8px]">
              {["All", "Frameworks", "Your downloads"].map((tag, i) => (
                <span
                  key={tag}
                  className={`${BODY_3} cursor-pointer rounded-full px-[10px] py-[4px] ${i === 0 ? "bg-[var(--store-primary-40)] text-white" : "text-[var(--store-neutral-80)] hover:bg-[var(--store-primary-10)]"}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="max-h-[320px] overflow-y-auto pb-[8px]">
              <p className={PANEL_HEADING}>Trending themes</p>
              {THEMES.slice(0, 6).map((theme, i) => (
                <Link
                  key={theme.id}
                  href={`/themes/${theme.id}`}
                  className={`${PANEL_ROW} tn-fall-row`}
                  style={{ ["--i" as string]: i }}
                >
                  <SearchIcon
                    aria-hidden="true"
                    className="size-[16px] shrink-0 text-[var(--store-neutral-70)]"
                  />
                  {theme.label}
                </Link>
              ))}

              <p className={PANEL_HEADING}>Generate for a framework</p>
              {/* `AVAILABLE` is framework-by-CSS pairs, so the frameworks are its distinct first
                  column rather than the list itself, and `labelOf` turns an id into what a buyer
                  reads. Mapping the pairs straight would have rendered six objects. */}
              {[...new Set(AVAILABLE.map((a) => a.framework))].map((framework, i) => (
                <Link
                  key={framework}
                  href="/voilet"
                  className={`${PANEL_ROW} tn-fall-row`}
                  style={{ ["--i" as string]: i + 6 }}
                >
                  <span
                    aria-hidden="true"
                    className="size-[16px] shrink-0 rounded-[4px] bg-[var(--store-primary-20)]"
                  />
                  {labelOf(framework)} &mdash; generate with AI
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex flex-nowrap items-center gap-[8px]">
          {THEMES.map((theme) => (
            <li key={theme.id} className="shrink-0">
              <Link
                href={`/themes/${theme.id}`}
                className={`${BODY_2} inline-block whitespace-nowrap rounded-[8px] border border-[var(--store-card-border)] bg-white px-[12px] py-[8px] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 hover:border-[var(--store-primary-40)] hover:text-[var(--store-primary-40)]`}
              >
                {theme.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
