"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { FONT } from "./type";

/**
 * The composer's menus (`SD-219`): one panel, four callers.
 *
 * **Plain, not Radix.** `@viliha/vui-react`'s popover draws itself with `.vui-*` rules that live in
 * `theme.css`, and this app does not import the product's stylesheet by ruling (`SD-214`). A panel
 * that closes on Escape, on a click outside and on a selection is forty lines; a second stylesheet
 * in the storefront is a decision nobody took.
 *
 * **It opens upward.** Every one of these buttons sits in the composer's foot row, and the composer
 * is at the foot of the window, so a panel that opens downward opens off-screen.
 */

export function Panel({
  open,
  onClose,
  label,
  heading = true,
  children,
  width = 320,
  /** Where the panel's left edge sits, in pixels from the card's left edge. */
  left = 0,
}: {
  open: boolean;
  onClose: () => void;
  /** Shown as the panel's heading, and read as its accessible name. */
  /** The heading, and the panel's accessible name. The add menu has no visible heading, as the
   *  reference's has none: six rows that say what they do do not need a label over them. */
  label: string;
  heading?: boolean;
  children: ReactNode;
  width?: number;
  left?: number;
}) {
  const panel = useRef<HTMLDivElement>(null);
  /**
   * Where the panel goes and how tall it may be.
   *
   * **It shrinks before it flips.** The first rule was "flip up if the panel overflows", and a tall
   * list overflows almost anywhere, so the model menu kept jumping above the card and reading as a
   * sheet floating over the page. The panel is a drawer in the card's bottom edge: it keeps that
   * edge and takes the room that is there, down to a floor of 240px, and only goes above the card
   * when there is less than that below it.
   */
  const [place, setPlace] = useState<{ up: boolean; max: number }>({ up: false, max: 560 });

  useEffect(() => {
    if (!open) return;
    const card = panel.current?.closest("form")?.getBoundingClientRect();
    if (card) {
      const below = window.innerHeight - card.bottom - 12;
      const above = card.top - 12;
      setPlace(below >= 240 || below >= above ? { up: false, max: below } : { up: true, max: above });
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    /* `mousedown` rather than `click`: a click that starts inside the panel and ends outside it,
       which is what a drag on a scrollbar looks like, should not close it. */
    const away = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", away);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", away);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={label}
      style={{ width, left, maxWidth: "calc(100vw - 32px)", maxHeight: place.max }}
      className={`absolute z-50 overflow-y-auto border border-[var(--store-card-border)] bg-white p-[8px] shadow-[var(--shadow-float)] ${
        place.up
          ? "tn-drop-up bottom-full rounded-t-[16px] rounded-b-none"
          : "tn-drop top-full rounded-t-none rounded-b-[16px]"
      }`}
    >
      {/* The reference's heading is **12px at 600**, not 14: it is a label for the list, not a title
          for a page, and at 14 it competes with the rows it is introducing. */}
      <div className={`items-center justify-between px-[8px] pt-[6px] pb-[8px] ${heading ? "flex" : "hidden"}`}>
        <p className={`${FONT} text-[length:var(--store-body-3)] font-semibold text-[var(--store-neutral-100)]`}>
          {label}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-[var(--store-neutral-80)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] hover:text-[var(--store-neutral-100)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

/**
 * Where a trigger sits inside the card, so a panel can hang from the card's own bottom edge rather
 * than from the button (`SD-222`).
 *
 * **The card is the anchor, not the control.** Four buttons of different widths each opened their
 * panel from their own left edge and their own top, so four panels arrived at four heights; the
 * reference hangs every one of them off the bottom border of the prompt card. This returns the
 * trigger's offset within that card, which is the only part that still differs.
 */
export function useAnchor() {
  const trigger = useRef<HTMLButtonElement>(null);
  const [left, setLeft] = useState(0);
  const measure = () => {
    const el = trigger.current;
    const card = el?.closest("form");
    if (!el || !card) return;
    setLeft(el.getBoundingClientRect().left - card.getBoundingClientRect().left);
  };
  return { trigger, left, measure };
}

/**
 * A row in one of those panels: tile, title, one line of what it does.
 *
 * **50px, which is the reference's row height**, and the geometry under it is theirs too: a 40px
 * tile with a 20px glyph, the title at 14 and the line under it at 12. The first cut used 36 and a
 * 12px gap, which is a row that is nearly right and reads as loose.
 *
 * **One line, and it must fit.** The note is truncated rather than wrapped, so a row never becomes
 * two, which means the panel has to be wide enough for the longest note it holds. "tokens you can
 * ch…" is the panel being too narrow, not the note being too long.
 *
 * **Hover is the brand tint, and selection is a tick.** Painting the selected row the same colour
 * as the hovered one is how a reader loses track of which is which.
 */
export function Choice({
  icon,
  title,
  note,
  selected = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  note?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={selected}
      className={`${FONT} flex h-[56px] w-full cursor-pointer items-center gap-[12px] rounded-[10px] px-[8px] text-left transition-colors duration-150 hover:bg-[var(--store-primary-10)]`}
    >
      <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--store-primary-10)] text-[var(--store-neutral-100)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[length:var(--store-body-2)] font-medium leading-[20px] text-[var(--store-neutral-100)]">
          {title}
        </span>
        {note ? (
          <span className="mt-[2px] block truncate text-[length:var(--store-body-3)] leading-[18px] text-[var(--store-neutral-80)]">
            {note}
          </span>
        ) : null}
      </span>
      {selected ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mr-[6px] shrink-0 text-[var(--store-primary-40)]"
        >
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      ) : null}
    </button>
  );
}

/** The hairline the reference puts between bands of a menu. */
export function Divider() {
  return <hr className="my-[6px] border-0 border-t border-[var(--store-neutral-40)]" />;
}

/**
 * A group heading inside a panel: **12px at 600**, the reference's own, with its 8px above and 4px
 * below. A list of ten rows with no grouping is a list nobody reads to the end of.
 */
export function Group({ children }: { children: ReactNode }) {
  return (
    <p
      className={`${FONT} px-[8px] pt-[8px] pb-[4px] text-[length:var(--store-body-3)] font-semibold leading-[18px] text-[var(--store-neutral-100)]`}
    >
      {children}
    </p>
  );
}

/**
 * The reference's **See All**: a full-width pale button that reveals the rest of a group.
 *
 * It exists because a group of six makes the panel taller than the window it opens into. Four and a
 * button is the reference's own compromise and it is the right one.
 */
export function SeeAll({ open, onClick, hidden }: { open: boolean; onClick: () => void; hidden: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${FONT} mt-[4px] flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[10px] bg-[var(--store-neutral-30)] py-[9px] text-[length:var(--store-body-2)] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-10)]`}
    >
      {open ? "See less" : `See all ${hidden} more`}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

/** The panel's search field, with the reference's magnifier inside it. */
export function Search({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative px-[4px] pb-[6px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[16px] flex items-center text-[var(--store-neutral-80)]"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.944 16.944L12.539 12.539" />
          <circle cx="8.611" cy="8.611" r="5.556" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${FONT} h-[44px] w-full rounded-[22px] border border-[var(--store-card-border)] pl-[42px] pr-[14px] text-[length:var(--store-body-2)] text-[var(--store-neutral-100)] outline-none placeholder:text-[var(--store-neutral-70)] focus:border-[var(--store-primary-40)]`}
      />
    </div>
  );
}

/**
 * A monogram tile, for a row whose subject has no icon in our set.
 *
 * The reference does the same: its own model row is a rounded square with a `T` in it. The
 * alternative was one generic frame repeated down the list, which is what the first cut shipped and
 * what the dev sent back, because a reader finds a row by its shape before they read it.
 */
export function Mono({ children }: { children: ReactNode }) {
  return (
    <span className={`${FONT} text-[length:var(--store-body-2)] font-semibold`}>{children}</span>
  );
}

/** Opens the file picker and hands back what was chosen. The one control here that reaches the OS. */
export function useFilePicker(onPick: (files: FileList) => void, accept?: string) {
  const [input] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("input");
    el.type = "file";
    el.multiple = true;
    return el;
  });
  return () => {
    if (!input) return;
    if (accept) input.accept = accept;
    input.onchange = () => {
      if (input.files?.length) onPick(input.files);
      input.value = "";
    };
    input.click();
  };
}
