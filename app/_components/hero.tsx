"use client";

import { useRef, useState } from "react";

import { Composer } from "./composer";
import type { CardRect } from "./conversation";
import { BODY_2, FONT } from "./type";

/**
 * The opening screen: H1, one line of subtitle and the prompt card.
 *
 * **Sending does not navigate** (`SD-216`). The card hands its text up to `Conversation`, which
 * swaps this screen for the thread; the form used to GET `/voilet`, a route `SD-215` deleted, so
 * Generate answered with a 404 until this change.
 *
 * **Sending hands over where the card is.** The headline and its two lines leave (`.tn-leave`) and
 * the card stays put; `onStart` carries the card's rectangle so the thread can begin its own card
 * exactly there and slide it down to the dock. The glow behind all this is `Aurora`, drawn by
 * `Conversation`, so it is not this screen's to take away.
 *
 * **The card's border is `--store-card-border`**, the reference's own grey; on focus it gains a soft
 * ring at their 300ms. Tools, Brand, `+` and the model selector are inert, and live in `Composer`
 * with the reason.
 */

/** What the prompt card types out while it is empty: one admin per line, each a real kind of
    screen this product generates, so the examples double as a list of what it can do. */
const EXAMPLES = [
  "A CRM in a calm blue, dense tables, dark mode",
  "An inventory dashboard for a coffee roaster, warm browns",
  "A support inbox with SLA timers and a violet accent",
  "A recruitment pipeline with kanban stages and candidate cards",
  "A finance admin with invoices, charts and a compact layout",
] as const;

export function Hero({
  onStart,
  casting = false,
}: {
  onStart: (prompt: string, card: CardRect | null) => void;
  /** The prompt has been sent: the text around the card is leaving. */
  casting?: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const card = useRef<HTMLFormElement>(null);
  const leave = casting ? "tn-leave" : "tn-rise";
  const start = () => {
    const r = card.current?.getBoundingClientRect();
    onStart(
      prompt.trim(),
      r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null,
    );
  };

  /* `relative z-30`: the prompt card's menus hang out of it over the sections below, and a child's
     `z-index` cannot lift it above a later sibling of its parent (`SD-212`, twice now). */
  return (
    <section className="relative z-30 mx-auto flex w-full flex-col items-center px-[var(--tn-space-sm)] pt-[var(--tn-space-md)] pb-[var(--tn-space-lg)] text-center">
      {/* **24px at every width, `--store-headline-11`** (2026-10-07, by request). It was the
          reference's 23px stepping up to 32px at `lg`; one size now, from our own scale, so the
          headline is the same weight beside the 720px card on a phone and on a desktop. */}
      <h1
        className={`${FONT} ${leave} text-[length:var(--store-headline-11)] font-extrabold leading-[1.5] text-[var(--store-neutral-100)]`}
        style={{ ["--i" as string]: 0 }}
      >
        {/* The gradient sits on a span, not the h1, so it spans the words rather than the full row,
            and `box-decoration-clone` gives each line its own full ramp when it wraps on a phone.
            Ink to brand blue to its deep step, all from our own tokens, panning slowly back and
            forth; `.tn-gradient-text` in `globals.css` holds the gradient and the motion. */}
        <span className="tn-gradient-text">
          Describe your app. Get full-stack templates in seconds
        </span>
      </h1>
      {/* The reference's `.page-description`: 14px (`--store-body-2`) at 400, capped at 850px, wider
          than the 720px card. Their ink is #1f2124, not in our palette; `--store-neutral-100` is nearest. */}
      <p
        className={`${BODY_2} ${leave} mt-[var(--tn-space-2xs)] max-w-[850px] font-normal text-[var(--store-neutral-100)]`}
        style={{ ["--i" as string]: 1 }}
      >
        Choose from 200+ templates or build your own with a single prompt
      </p>

      <Composer
        tall
        busy={casting}
        value={prompt}
        onChange={setPrompt}
        onSubmit={start}
        formRef={card}
        placeholder="Describe the admin theme you want: a CRM in a calm blue, dense tables, dark mode"
        examples={EXAMPLES}
        className="tn-rise mt-[var(--tn-space-md)] max-w-[720px]"
        style={{ ["--i" as string]: 2 }}
      />
    </section>
  );
}
