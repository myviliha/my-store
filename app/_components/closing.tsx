import Link from "next/link";

import { H2, LEAD } from "./type";

/**
 * The closing section: a headline, a four-word line, one button, and slow columns behind them.
 *
 * **The columns are the reference's vertical drift** (`tn-drift` and its mirror in `globals.css`),
 * applied to token-coloured placeholder blocks. Their section is `clamp(26rem, 35vw, 36rem)` tall
 * and so is this one. The columns are decorative: `aria-hidden`, hidden below `md` where they
 * would crowd the copy, and inert under `prefers-reduced-motion` (the animation is removed, not
 * just shortened).
 *
 * "Start for free" goes to the theme catalogue because the Free tier is a theme, not a signup.
 */
const COLUMNS = [
  { side: "start-[4%]", motion: "tn-drift", heights: ["h-40", "h-56", "h-32", "h-48", "h-40"] },
  {
    side: "start-[16%]",
    motion: "tn-drift-reverse",
    heights: ["h-56", "h-32", "h-48", "h-40", "h-56"],
  },
  { side: "end-[16%]", motion: "tn-drift", heights: ["h-32", "h-48", "h-56", "h-40", "h-32"] },
  {
    side: "end-[4%]",
    motion: "tn-drift-reverse",
    heights: ["h-48", "h-40", "h-32", "h-56", "h-48"],
  },
] as const;

const TINTS = [
  "bg-[var(--store-primary-10)]",
  "bg-[var(--store-primary-20)]",
  "bg-[var(--store-neutral-40)]",
] as const;

export function Closing() {
  return (
    <section className="relative mx-auto mt-[var(--tn-space-3xl)] flex min-h-[clamp(26rem,35vw,36rem)] w-full max-w-[1440px] flex-col items-center justify-center overflow-hidden px-[var(--tn-space-sm)] text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        {COLUMNS.map((column) => (
          <div
            key={column.side}
            className={`${column.side} ${column.motion} absolute top-0 flex w-[8%] min-w-[96px] flex-col gap-[var(--tn-space-xs)]`}
          >
            {column.heights.map((height, index) => (
              <div
                key={index}
                className={`${height} ${TINTS[index % TINTS.length]} rounded-[var(--tn-radius-2xl)]`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="tn-reveal relative flex max-w-[850px] flex-col items-center gap-[var(--tn-space-2xs)]">
        <h2 className={H2}>From a description to a working admin</h2>
        <p className={LEAD}>Describe. Generate. Download. Connect.</p>
        <Link
          href="/themes"
          className="mt-[var(--tn-space-xs)] rounded-[var(--tn-radius-lg)] bg-[var(--store-primary-40)] px-[var(--tn-space-md)] py-[var(--tn-space-2xs)] text-[length:var(--store-body-1)] font-semibold text-white transition-colors duration-200 hover:bg-[var(--store-primary-50)] active:bg-[var(--store-primary-60)]"
        >
          Start for free
        </Link>
      </div>
    </section>
  );
}
