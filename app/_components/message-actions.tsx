"use client";

import { Check, Copy, Reload } from "@/app/_vendor/icons";
import { type ReactNode, useEffect, useState } from "react";

/**
 * The actions under a message (`SD-217`), **one component for both sides of the conversation**.
 *
 * It was one component until the guided-recipe rewrite (`b5fdb7f`) dropped the system reply's row
 * and left the reader's written out inline; restored 2026-10-08 so both rows share one button, one
 * size and one hover, and a change to either is made once.
 *
 * **No card.** The glyphs sit on the page in grey under the message they belong to, ChatGPT's way,
 * which the dev chose over the first reference's floating white surface. **Both rows are always
 * shown** (2026-10-08, by request), not revealed on hover or focus.
 *
 * **Copy and Edit do their jobs. The two votes do not leave the browser**, and that is the honest
 * state rather than a toast thanking nobody for their feedback. They toggle, so a reader can see
 * the click registered, and the moment there is somewhere to send a vote this is the one place
 * that changes.
 *
 * **Try again re-asks the newest question, fresh** (restored 2026-10-08). Replies come from the
 * guided recipe, so it cannot word an answer differently; what it does is redraw the question's card
 * from the recipe as it stands, which clears anything half-chosen (a framework picked but not
 * continued) and keeps every answer already given. Only the newest reply has it: retrying an older
 * one would discard every turn after it, and a button that quietly deletes four messages is worse
 * than no button.
 */
export interface Action {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
  /** Drawn as held down. The votes use it; copy uses its own tick instead. */
  readonly active?: boolean;
  /** Shown but not usable, with the reason as its tooltip (Edit while a reply is on its way). */
  readonly disabled?: string;
}

export const ACTION_BUTTON =
  "flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-[var(--store-neutral-80)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] hover:text-[var(--store-neutral-100)]";

export function Actions({
  items,
  align,
}: {
  items: readonly Action[];
  align: "start" | "end";
}) {
  return (
    <div
      className={`flex items-center gap-[4px] ${align === "end" ? "justify-end" : "justify-start"}`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          aria-pressed={item.active}
          onClick={item.onClick}
          disabled={Boolean(item.disabled)}
          title={item.disabled}
          className={`${ACTION_BUTTON} disabled:cursor-not-allowed disabled:opacity-40 ${item.active ? "text-[var(--store-primary-40)]" : ""}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

/** Copies, and says so for a moment. The tick is the whole confirmation; a toast for a copy is noise. */
function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);
  return {
    copied,
    copy: () => {
      void navigator.clipboard?.writeText(text).then(() => setCopied(true));
    },
  };
}

/** Copy, with its tick while the copy is fresh. Both rows lead with it. */
export function useCopyAction(text: string): Action {
  const { copied, copy } = useCopy(text);
  return {
    label: copied ? "Copied" : "Copy",
    icon: copied ? (
      <Check width={16} height={16} />
    ) : (
      <Copy width={16} height={16} />
    ),
    onClick: copy,
  };
}

/**
 * **Radix ships no thumb**, and neither does the reference page, so these two are drawn here and
 * nowhere else; swap them for the real pair the moment there is one (`SD-217`). Every other glyph on
 * these rows is `@viliha/vui-react/icons`, which is where an icon belongs.
 */
function Thumb({ down = false }: { down?: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${down ? "rotate-180 scale-x-[-1]" : ""}`}
    >
      <path d="M7 21V10l4.5-7a2 2 0 0 1 2 2.6L12.5 9h5.3a2.2 2.2 0 0 1 2.1 2.7l-1.8 7A2.2 2.2 0 0 1 16 20.4H7z" />
      <path d="M7 10H4.8A1.8 1.8 0 0 0 3 11.8v7.4A1.8 1.8 0 0 0 4.8 21H7" />
    </svg>
  );
}

/** Under a system reply: copy its words, rate it, and on the newest one, try again. */
export function ReplyActions({ text, onRetry }: { text: string; onRetry?: () => void }) {
  const copy = useCopyAction(text);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  return (
    <Actions
      align="start"
      items={[
        copy,
        {
          label: "Good answer",
          icon: <Thumb />,
          active: vote === "up",
          onClick: () => setVote((v) => (v === "up" ? null : "up")),
        },
        {
          label: "Bad answer",
          icon: <Thumb down />,
          active: vote === "down",
          onClick: () => setVote((v) => (v === "down" ? null : "down")),
        },
        ...(onRetry
          ? [{ label: "Try again", icon: <Reload width={16} height={16} />, onClick: onRetry }]
          : []),
      ]}
    />
  );
}
