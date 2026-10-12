"use client";

import { useEffect, useState } from "react";

import { BODY_2, BODY_3, FONT } from "./type";

/**
 * **Generating the admin** (2026-10-12, by request): after a theme is chosen, the conversation shows
 * the build working through the reader's requirements before the summary arrives, rather than the
 * summary appearing at once as if nothing had to be made.
 *
 * Each step names something the reader chose (the admin, the stack, the theme, the page count), and
 * ticks off in turn; the bar fills with them. `role="status"` announces the start once; the steps are
 * a list a screen reader can walk. Under reduced motion the spinner stands still.
 *
 * DEMO-ONLY(generate): the steps advance on a timer (`STEP_MS` each), because nothing is generated
 * yet. Replace the timer with the build's own progress events; the steps and the card stay.
 */

/** How long each step takes in the demo; the summary follows the last. */
export const STEP_MS = 850;

export function Generating({ steps }: { steps: readonly string[] }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= steps.length) return;
    const t = window.setTimeout(() => setDone((d) => d + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [done, steps.length]);

  const share = Math.round((Math.min(done, steps.length) / steps.length) * 100);

  return (
    <div className="tn-message-in mt-[var(--tn-space-2xs)] flex w-full max-w-[520px] flex-col gap-[12px] rounded-[16px] border border-[var(--store-card-border)] bg-white/80 p-[16px] backdrop-blur-sm">
      <div className="flex items-center gap-[10px]">
        <span
          aria-hidden="true"
          className="size-[16px] shrink-0 animate-spin rounded-full border-2 border-[var(--store-primary-20)] border-t-[var(--store-primary-40)] motion-reduce:animate-none"
        />
        <p role="status" className={`${FONT} text-[length:var(--store-body-1)] font-semibold text-[var(--store-neutral-100)]`}>
          Generating your admin…
        </p>
        <span className={`${BODY_3} ml-auto font-medium text-[var(--store-neutral-80)]`}>{share}%</span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--store-neutral-40)]">
        <div
          className="h-full rounded-full bg-[var(--store-primary-40)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${share}%` }}
        />
      </div>
      <ol className="flex flex-col gap-[8px]">
        {steps.map((step, i) => {
          const state = i < done ? "done" : i === done ? "now" : "next";
          return (
            <li
              key={step}
              className={`${BODY_2} flex items-center gap-[10px] ${state === "next" ? "text-[var(--store-neutral-70)]" : "text-[var(--store-neutral-100)]"}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-[18px] shrink-0 items-center justify-center rounded-full ${state === "done" ? "bg-[var(--store-success-50)] text-white" : state === "now" ? "border-2 border-[var(--store-primary-40)]" : "border border-[var(--store-neutral-50)]"}`}
              >
                {state === "done" ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                ) : null}
              </span>
              <span className={state === "now" ? "font-medium" : ""}>{step}</span>
              <span className="sr-only">{state === "done" ? "(done)" : state === "now" ? "(in progress)" : ""}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
