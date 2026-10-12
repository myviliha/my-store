"use client";

import { useEffect, useRef, useState } from "react";

import type { Scheme } from "./preview-controls";

/**
 * **The running admin, shrunk to fit a panel** (2026-10-12, by request): the drawer shows the same
 * live page as the full-window preview, not a picture of it.
 *
 * A panel is ~600px wide, and an admin laid out at 600px is a cramped tablet, not the desktop the
 * reader will ship. So the page is laid out at the device's own width (1440 / 768 / 390) and the
 * whole frame is scaled down to the panel: a sharp miniature that still takes clicks. The frame is
 * only mounted while this is on screen.
 *
 * **Until it has loaded, the first page's capture sits underneath** as a placeholder, so the panel
 * is never blank. When screenshots come from the build, that image is what changes.
 */
export const DEVICE_WIDTH = { desktop: 1440, tablet: 768, mobile: 390 } as const;
export type Device = keyof typeof DEVICE_WIDTH;

export function LiveFrame({
  url,
  device,
  title,
  placeholder,
  scheme,
  onScheme,
}: {
  url: string;
  device: Device;
  title: string;
  /**
   * Light or dark, set from the panel's switch by a message to the page (`voilet:scheme`), so a
   * generated build on another origin can take it too; the page's own toggle answers the same way.
   */
  scheme: Scheme;
  onScheme: (scheme: Scheme) => void;
  /** The first page's capture, shown under the frame while it loads. */
  placeholder?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

  /* The panel's own size, kept current as the split is dragged or the window changes. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* A new address (another page set, another theme) loads afresh. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on a new address only
  useEffect(() => setLoaded(false), [url]);

  /* Tell the page the scheme whenever it changes, and once it has loaded. */
  useEffect(() => {
    if (loaded) frame.current?.contentWindow?.postMessage({ type: "voilet:scheme", scheme }, "*");
  }, [scheme, loaded]);
  /* Hear the page's own toggle. */
  useEffect(() => {
    const hear = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data?.type === "voilet:scheme") {
        onScheme(e.data.scheme === "dark" ? "dark" : "light");
      }
    };
    window.addEventListener("message", hear);
    return () => window.removeEventListener("message", hear);
  }, [onScheme]);

  const base = DEVICE_WIDTH[device];
  /* Never enlarged past 1:1: a phone frame in a wide panel stays phone-sized and centred. */
  const scale = size.width > 0 ? Math.min(1, size.width / base) : 0;
  const height = scale > 0 ? size.height / scale : 0;

  return (
    <div ref={box} className="relative h-full w-full overflow-hidden">
      {placeholder && !loaded ? (
        // biome-ignore lint/performance/noImgElement: a placeholder sized to the panel, under the frame
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-x-0 top-0 mx-auto w-full max-w-[var(--frame)] animate-pulse object-cover object-top motion-reduce:animate-none"
          style={{ ["--frame" as string]: `${base * scale}px` }}
        />
      ) : null}
      {scale > 0 ? (
        <div
          className="absolute top-0 left-1/2 origin-top transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: base, height, transform: `translateX(-50%) scale(${scale})` }}
        >
          <iframe
            ref={frame}
            src={url}
            title={title}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full border-0 bg-white transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${device === "desktop" ? "" : "border-x border-[var(--store-card-border)]"}`}
          />
        </div>
      ) : null}
    </div>
  );
}
