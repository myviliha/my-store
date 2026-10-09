"use client";

import { useEffect, useRef, useState } from "react";

/**
 * **`ChatGlow`'s colour, spread down a long page** (`/pricing`, 2026-10-09).
 *
 * `ChatGlow` puts three glows in one row along the foot, which suits a screen-tall conversation but
 * leaves a long page with a band of colour at the bottom and nothing in between. Here the glows run
 * from well below `Aurora` (the three at the top, left alone) down to the top of the footer,
 * **evenly spaced** and never closer than `STEP`, zig-zagging left, centre, right so no two share a
 * row. A longer page simply gets more of them, re-spaced evenly.
 *
 * **Nothing behind the footer**: an earlier version kept `ChatGlow`'s violet tint rising from the
 * bottom edge and let glows fall behind the footer, which made the footer read as a heavy band.
 *
 * Measured after mount with a `ResizeObserver`, so the server renders an empty layer and there is
 * nothing for hydration to disagree about. Same colours, blur and opacity as `ChatGlow`; `-z-10`
 * under the layout column's `isolate`.
 */
const STEP = 560;
/** Well clear of `Aurora` (it lights the top 460px), so the first glow does not crowd its three. */
const START = 900;
const SIZE = 360;
const COLOURS = [
  "var(--tn-accent-violet-solid)",
  "var(--tn-accent-pink-solid)",
  "var(--tn-accent-teal-solid)",
];
/** Left edge as a fraction of the free width: left, right, centre, then again. */
const ACROSS = [0.05, 0.95, 0.5];

export function ScatterGlow() {
  const box = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<{ end: number; width: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const footer = document.querySelector<HTMLElement>('[data-chrome="footer"]');
    const measure = () =>
      setArea({ end: el.offsetHeight - (footer?.offsetHeight ?? 0), width: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (footer) ro.observe(footer);
    return () => ro.disconnect();
  }, []);

  // Glow centres are spaced evenly between START and the footer, the last one's foot at the footer.
  const span = area ? area.end - START - SIZE : 0;
  const count = area && span > 0 ? Math.max(1, Math.floor(span / STEP) + 1) : 0;
  const gap = count > 1 ? span / (count - 1) : 0;

  return (
    <div
      ref={box}
      aria-hidden="true"
      className="tn-fade-in pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {area &&
        Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 blur-[110px]"
            style={{
              top: START + i * gap,
              left: Math.max(0, area.width - SIZE) * ACROSS[i % ACROSS.length],
              width: SIZE,
              height: SIZE,
              background: COLOURS[i % COLOURS.length],
            }}
          />
        ))}
    </div>
  );
}
