"use client";

import { type DotLottie, DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

/*
 * **The renderer is served from this site, not a CDN.** dotLottie draws with a WebAssembly build of
 * ThorVG, and by default fetches it from jsDelivr, then unpkg. `scripts/copy-dotlottie-wasm.mjs`
 * copies the installed build into `public/` on every install, and this points the player at it.
 */
setWasmUrl("/lottieAnimations/dotlottie-player.wasm");

/** The robot's own canvas, 500 x 394, so the box is reserved at the right shape before it loads. */
const ASPECT = "aspect-[500/394]";

/**
 * The robot that waves above the hero headline (`robot-say-hello.lottie`, 140 frames at 60fps).
 *
 * **It waves continuously, at `SPEED`** (2026-10-08, by request). It first played once and stopped,
 * which read as a pause between rounds. The file loops cleanly: every animated value at its last
 * frame equals its first (arm back at -105°, body at rest height, sign at -14°), checked against the
 * keyframes, so rounds run back to back with no jump. The first 30 frames are not dead time to trim:
 * they are the arm swinging up into the wave. At 1.5x a round is 1.56s instead of 2.33s.
 *
 * **Reduced motion gets a still robot**, drawn at `REST_FRAME` and never played: the player is told
 * not to autoplay, and the choice to play is made on `load`, once the media query has been read, so
 * there is no first frame of motion before the preference is known.
 *
 * Decorative (`aria-hidden`): the headline beside it says everything it does.
 */
const REST_FRAME = 0;
/** Playback rate. 1 is the file's own 2.33s round; raise it for a quicker wave, lower to calm it. */
const SPEED = 1.5;

export function HelloBot({ className = "" }: { className?: string }) {
  const [bot, setBot] = useState<DotLottie | null>(null);
  const [still, setStill] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!bot) return;
    const start = () => {
      if (still) {
        bot.stop();
        bot.setFrame(REST_FRAME);
      } else {
        bot.play();
      }
    };
    if (bot.isLoaded) start();
    bot.addEventListener("load", start);
    return () => bot.removeEventListener("load", start);
  }, [bot, still]);

  return (
    <div
      aria-hidden="true"
      className={`${ASPECT} h-[64px] shrink-0 ${className}`}
    >
      <DotLottieReact
        src="/lottieAnimations/robot-say-hello.lottie"
        autoplay={false}
        loop
        speed={SPEED}
        dotLottieRefCallback={setBot}
        className="size-full"
      />
    </div>
  );
}
