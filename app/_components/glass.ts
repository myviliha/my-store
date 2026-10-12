/**
 * **The home page's card: frosted glass over the site's glow** (2026-10-11, by request). It began as
 * the Standards section's card and is now every content card on the home page: Standards, the
 * buyers' quotes (`Proof`), `Capabilities` and the `How` frame. One surface, one place to change it.
 *
 * The shadow's colours are hex because the owner kept this glass as drawn (`CLAUDE.md`, "Kept by
 * the owner").
 */
export const GLASS_SURFACE =
  "relative overflow-hidden rounded-[12px] border border-white/70 bg-gradient-to-br from-white/60 to-white/25 shadow-[inset_0_1px_0_#ffffffcc,0_8px_24px_-12px_#7c3aed59] backdrop-blur-xl backdrop-saturate-150";

/** A soft light across a card's top edge, decoration only: the first child of a `GLASS_SURFACE`. */
export const SHEEN =
  "pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/50 to-transparent";
