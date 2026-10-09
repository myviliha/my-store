"use client";

import { type ReactNode, useEffect, useState } from "react";

import { ChatGlow } from "./aurora";
import { Hero } from "./hero";
import { Thread } from "./thread";

/**
 * Which of the two screens the home page is showing (`SD-216`).
 *
 * **The state lives here because both halves of the page answer to it.** Sending a prompt does not
 * navigate: the marketing sections go, the headline goes, and the thread takes the page. A route
 * would have been the other way to do it and the wrong one, because going `Back` should return the
 * reader to the page they were reading rather than to a fresh load of it.
 *
 * The sections arrive as `children` so the page itself stays a server component and only this
 * wrapper and the two screens it switches are sent to the browser.
 *
 * **The hand-off** (2026-10-07, replacing `SD-220`'s upward cast):
 *
 * 1. Generate: everything but the card fades and lifts out over `LEAVE_MS` (`.tn-leave`), the
 *    headline in `Hero` and the sections here. The card does not move, and its rectangle is kept.
 * 2. The thread mounts with its own card **starting at that rectangle** and sliding down to the dock,
 *    widening to the column as it goes; the reader's message rises into the space it leaves.
 * 3. **The background never changes.** `Aurora` is the root layout's (2026-10-09), behind both
 *    screens, so it is the one thing on the page that does not move while the rest is replaced.
 *    The thread adds its own colour beneath it (`ChatGlow`), which fades in rather than replacing
 *    anything.
 *
 * `prefers-reduced-motion` gets the switch on the same tick and no slide, because a reader who asked
 * for less motion is asking for exactly that.
 */

/** How long the home screen takes to leave. Matches `.tn-leave` in `globals.css`. */
const LEAVE_MS = 260;

/** Where the home card was, in viewport pixels, at the moment Generate was pressed. */
export interface CardRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export function Conversation({ children }: { children: ReactNode }) {
  const [first, setFirst] = useState<{ prompt: string; from: CardRect | null } | null>(null);
  /** The prompt that has been sent and is waiting out the leave, with where its card was. */
  const [leaving, setLeaving] = useState<{ prompt: string; from: CardRect | null } | null>(null);

  useEffect(() => {
    if (leaving === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(
      () => {
        setFirst(reduced ? { prompt: leaving.prompt, from: null } : leaving);
        setLeaving(null);
      },
      reduced ? 0 : LEAVE_MS,
    );
    return () => clearTimeout(timer);
  }, [leaving]);

  return (
    /* `isolate` so `ChatGlow`'s `-z-10` sits behind this wrapper's content rather than behind the
       page ground, where it would not be seen at all. */
    <div className="relative isolate">
      {first !== null ? <ChatGlow /> : null}
      {first !== null ? (
        <Thread first={first.prompt} from={first.from} onBack={() => setFirst(null)} />
      ) : (
        <>
          <Hero
            onStart={(prompt, from) => setLeaving({ prompt, from })}
            casting={leaving !== null}
          />
          <div className={leaving !== null ? "tn-leave" : undefined}>{children}</div>
        </>
      )}
    </div>
  );
}
