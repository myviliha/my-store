/**
 * **Four soft glows behind the top of the page**, one per accent, so it opens in colour rather than
 * on a flat ground.
 *
 * **Its own component because it belongs to neither screen.** It used to sit inside the hero, so
 * sending a prompt unmounted it with the headline and the conversation arrived on a bare ground: the
 * one thing that should have stayed still changed. `Conversation` now draws it once, behind both
 * screens, and it does not move when one replaces the other.
 *
 * Blurred far enough to read as light, not shapes, and masked to fade out top and bottom so there is
 * no hard edge under the top bar. `-z-10` puts it under everything in `Conversation`'s own stacking
 * context (the wrapper is `isolate`), and `pointer-events-none` keeps it out of the card's way.
 */
export function Aurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_55%,transparent)]"
    >
      <div className="absolute left-[8%] top-[20px] size-[320px] rounded-full bg-[var(--tn-accent-violet-solid)] opacity-35 blur-[90px]" />
      <div className="absolute right-[10%] top-[40px] size-[300px] rounded-full bg-[var(--tn-accent-pink-solid)] opacity-30 blur-[90px]" />
      <div className="absolute left-[38%] top-[60px] size-[280px] rounded-full bg-[var(--tn-accent-blue-solid)] opacity-25 blur-[100px]" />
      <div className="absolute right-[30%] top-[180px] size-[220px] rounded-full bg-[var(--tn-accent-amber-solid)] opacity-25 blur-[90px]" />
    </div>
  );
}

/**
 * **The conversation's own colour**, under the shared top glow (2026-10-07).
 *
 * `Aurora` covers the top 460px of both screens; below it the thread was bare ground, and the card
 * docked on nothing. This adds three glows along the foot, violet, pink and teal, behind and around
 * the card, and a faint violet tint rising from the bottom edge. It is masked to fade out towards
 * the top so it meets `Aurora` without a seam.
 *
 * **It fades in (`.tn-fade-in`) rather than appearing**, because it mounts with the thread and a
 * ground that snaps on is the one thing the hand-off promised would not move. Opacities are low:
 * the reader's bubble and the card are opaque, and Voilet's answers, which sit on the ground itself,
 * were checked over the strongest point of the violet glow with no blur at all (#d2bdfa): body text
 * 11.55:1 and the grey action icons 3.89:1, both clear of AA (4.5 for text, 3 for icons).
 */
export function ChatGlow() {
  return (
    <div
      aria-hidden="true"
      className="tn-fade-in pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_top,black_45%,transparent)]"
    >
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[var(--tn-accent-violet-soft)] to-transparent" />
      <div className="absolute bottom-[-120px] left-[4%] size-[380px] rounded-full bg-[var(--tn-accent-teal-solid)] opacity-20 blur-[110px]" />
      <div className="absolute bottom-[-80px] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[var(--tn-accent-violet-solid)] opacity-25 blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[6%] size-[360px] rounded-full bg-[var(--tn-accent-pink-solid)] opacity-20 blur-[110px]" />
    </div>
  );
}
