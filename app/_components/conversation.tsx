"use client";

import { type ReactNode, useEffect, useState } from "react";

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
 * **There is a beat between the two** (`SD-220`). Pressing Generate casts the card upward on one
 * pass of brand light, the control says Voilet is working and takes nothing further, and the thread
 * arrives 420ms later. Switching on the same tick is correct and reads as a page that blinked;
 * `prefers-reduced-motion` gets the blink, because a reader who asked for less motion is asking for
 * exactly that.
 */

/** How long the hand-off runs. Matches `.tn-cast` in `globals.css`; both change together. */
const CAST_MS = 420;
export function Conversation({ children }: { children: ReactNode }) {
  const [first, setFirst] = useState<string | null>(null);
  /** The prompt that has been sent and is waiting out the cast. */
  const [casting, setCasting] = useState<string | null>(null);

  useEffect(() => {
    if (casting === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(
      () => {
        setFirst(casting);
        setCasting(null);
      },
      reduced ? 0 : CAST_MS,
    );
    return () => clearTimeout(timer);
  }, [casting]);

  if (first !== null) {
    return <Thread first={first} onBack={() => setFirst(null)} />;
  }
  return (
    <>
      <Hero onStart={setCasting} casting={casting !== null} />
      {children}
    </>
  );
}
