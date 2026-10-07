"use client";

import { useState } from "react";

import { Composer } from "./composer";
import { BODY_2, FONT } from "./type";

/**
 * The opening screen: eyebrow pill, H1, two lines of subtitle and the prompt card.
 *
 * **Sending does not navigate** (`SD-216`). The card hands its text up to `Conversation`, which
 * swaps this screen for the thread; the form used to GET `/voilet`, a route `SD-215` deleted, so
 * Generate answered with a 404 until this change.
 *
 * **The card's border is `--store-card-border`**, the reference's own grey; on focus it gains a soft
 * ring at their 300ms. Tools, Brand, `+` and the model selector are inert, and live in `Composer`
 * with the reason.
 */

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
    <section className="relative z-30 mx-auto flex w-full flex-col items-center px-[var(--tn-space-sm)] pt-[var(--tn-space-md)] text-center">
      {/* The reference's pill: 6px radius, white ground, 1px grey border (`--store-neutral-50` for
          its #d5d7da), 2px by 8px padding, 12px label at 500. White and grey are structural; only
          the dot is brand. The dot's 2.5px halo is the page background (white), as theirs is. */}
      <p
        className={`${FONT} tn-rise mb-[var(--tn-space-2xs)] inline-flex items-center gap-[6px] rounded-[6px] border border-solid border-[var(--store-neutral-50)] bg-white px-[8px] py-[2px] text-[length:var(--store-body-3)] font-medium leading-[1.5] text-[var(--store-neutral-100)]`}
        style={{ ["--i" as string]: 0 }}
      >
        <span
          aria-hidden="true"
          className="size-[9px] rounded-full bg-[var(--store-primary-40)] shadow-[0_0_0_2.5px_white]"
        />
        Voilet AI
      </p>
      {/* 23px and 32px are the reference's own, set on the element at 600 then overridden to 800 by
          its `font-extrabold`; no step of ours carries 23, and the change is at 1024px (`lg`), not
          at `md`. A neighbouring `--store-headline-*` step would be a whole step off. */}
      <h1
        className={`${FONT} tn-rise text-[23px] font-extrabold leading-[1.5] text-[var(--store-neutral-100)] lg:text-[32px]`}
        style={{ ["--i" as string]: 0 }}
      >
        Describe your admin. Download the source.
      </h1>
      {/* The reference's `.page-description`: 14px (`--store-body-2`) at 400, capped at 850px, the
          card's own width. Their ink is #1f2124, not in our palette; `--store-neutral-100` is nearest. */}
      <p
        className={`${BODY_2} tn-rise mt-[var(--tn-space-2xs)] max-w-[850px] font-normal text-[var(--store-neutral-100)]`}
        style={{ ["--i" as string]: 1 }}
      >
        Six frameworks, three CSS systems and eleven themes, as editable frontend code you connect
        to your own backend.
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
        className={`tn-rise mt-[var(--tn-space-md)] max-w-[850px] ${casting ? "tn-cast" : ""}`}
        style={{ ["--i" as string]: 2 }}
      />
    </section>
  );
}
