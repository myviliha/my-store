"use client";

import { useState } from "react";

import { Composer } from "./composer";
import { BODY_2, FONT } from "./type";

/**
 * The opening screen: H1, two lines of subtitle and the prompt card.
 *
 * **Sending does not navigate** (`SD-216`). The card hands its text up to `Conversation`, which
 * swaps this screen for the thread; the form used to GET `/voilet`, a route `SD-215` deleted, so
 * Generate answered with a 404 until this change.
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
  onStart: (prompt: string) => void;
  /** The prompt has been sent and the card is on its way out. */
  casting?: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  /* `relative z-30`: the prompt card's menus hang out of it over the sections below, and a child's
     `z-index` cannot lift it above a later sibling of its parent (`SD-212`, twice now). */
  return (
    <section className="relative z-30 mx-auto flex w-full flex-col items-center px-[var(--tn-space-sm)] pt-[var(--tn-space-md)] pb-[var(--tn-space-lg)] text-center">
      {/* **Four soft glows behind the headline**, one per accent, so the page opens in colour
          rather than on a flat ground. Blurred far enough to read as light, not shapes, and masked
          to fade out top and bottom so there is no hard edge under the top bar; `-z-10`
          keeps them under the copy inside this section's own stacking context, and
          `pointer-events-none` keeps them out of the prompt card's way. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_55%,transparent)]"
      >
        <div className="absolute left-[8%] top-[20px] size-[320px] rounded-full bg-[var(--tn-accent-violet-solid)] opacity-35 blur-[90px]" />
        <div className="absolute right-[10%] top-[40px] size-[300px] rounded-full bg-[var(--tn-accent-pink-solid)] opacity-30 blur-[90px]" />
        <div className="absolute left-[38%] top-[60px] size-[280px] rounded-full bg-[var(--tn-accent-blue-solid)] opacity-25 blur-[100px]" />
        <div className="absolute right-[30%] top-[180px] size-[220px] rounded-full bg-[var(--tn-accent-amber-solid)] opacity-25 blur-[90px]" />
      </div>
      {/* 23px and 32px are the reference's own, set on the element at 600 then overridden to 800 by
          its `font-extrabold`; no step of ours carries 23, and the change is at 1024px (`lg`), not
          at `md`. A neighbouring `--store-headline-*` step would be a whole step off. */}
      <h1
        className={`${FONT} tn-rise text-[23px] font-extrabold leading-[1.5] text-[var(--store-neutral-100)] lg:text-[32px]`}
        style={{ ["--i" as string]: 0 }}
      >
        {/* The gradient sits on a span, not the h1, so it spans the words rather than the full row,
            and `box-decoration-clone` gives each line its own full ramp when it wraps on a phone.
            Ink to brand blue to its deep step, all from our own tokens, panning slowly back and
            forth; `.tn-gradient-text` in `globals.css` holds the gradient and the motion. */}
        <span className="tn-gradient-text">
          Describe your admin. Download the source.
        </span>
      </h1>
      {/* The reference's `.page-description`: 14px (`--store-body-2`) at 400, capped at 850px, wider
          than the 720px card. Their ink is #1f2124, not in our palette; `--store-neutral-100` is nearest. */}
      <p
        className={`${BODY_2} tn-rise mt-[var(--tn-space-2xs)] max-w-[850px] font-normal text-[var(--store-neutral-100)]`}
        style={{ ["--i" as string]: 1 }}
      >
        Six frameworks, three CSS systems and eleven themes, as editable
        frontend code you connect to your own backend.
      </p>
      {/* **`#welcome-user`, a fourth line we never had** (`SD-210`). The reference runs tag,
          headline, description, then this. It is the only line addressed to the reader rather than
          about the product, which is why leaving it out changed the voice of the whole block. */}
      <p
        className={`${BODY_2} tn-rise mt-[var(--tn-space-2xs)] font-normal text-[var(--store-neutral-80)]`}
        style={{ ["--i" as string]: 2 }}
      >
        What kind of admin do you want to generate today?
      </p>

      <Composer
        tall
        busy={casting}
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => onStart(prompt.trim())}
        placeholder="Describe the admin theme you want: a CRM in a calm blue, dense tables, dark mode"
        examples={EXAMPLES}
        className={`tn-rise mt-[var(--tn-space-md)] max-w-[720px] ${casting ? "tn-cast" : ""}`}
        style={{ ["--i" as string]: 2 }}
      />
    </section>
  );
}
