"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Glyph } from "./composer";
import type { MasonryCard } from "./masonry";
import { relatedScreens, themePages } from "./screen-cards";
import { FONT } from "./type";

/**
 * **A theme's preview**, opened from a card's Preview in the Explore Themes panel (Figma "AI Builder -
 * Guest - template preview", node 850:7592, as revised; 2026-10-08).
 *
 * The design, top to bottom: the title "Preview · <theme>" (Plus Jakarta Sans SemiBold 28); the
 * device pills with the light/dark + full-screen pill beside them (`850:7921`); the **preview box**
 * (`1062:3936`, 13.96px corners) with the **"What's in this preview" card** (`1069:2324`) under the
 * frame; then the page thumbnails (`850:7884`). Every size, colour and font below is the
 * design's, from its tokens where one exists (`--store-success-50`, `--store-neutral-60/70/90`,
 * `--store-primary-50`, Geist for Apply).
 *
 * **Each device shows its own shape** (by request): the frame inside the box is 1440:900 on Desktop,
 * 768:1024 on Tablet and 390:844 on Mobile, and the capture fills it from the top. The captures are
 * desktop screenshots of the Voilet build, so Tablet and Mobile show the top of that capture in the
 * device's shape, and the note under the preview says so.
 *
 * **Where it departs from the design:** the moon is disabled (no dark captures; the brief asks for
 * light/dark "when the output supports it", § 6); the thumbnails are a grid, not a strip running off
 * the panel (`CLAUDE.md`: no sideways-scrolling rows of buttons); a "← Explore themes" link goes back
 * to the wall; and the summary card sits **under** the frame at every width rather than over its
 * foot (by request), so no part of the page is hidden.
 */

/**
 * Each device's shape, and how much of the box's width its frame takes. **Wider on a phone**: at 38%
 * of a phone-sized box the Mobile frame was 99px across, too small to read, so below `sm` the narrow
 * devices take more of it. The shape (`ratio`) is the same at every width.
 */
const DEVICES = [
  { id: "desktop", label: "Desktop", ratio: "1440 / 900", width: "w-full" },
  { id: "tablet", label: "Tablet", ratio: "768 / 1024", width: "w-[85%] sm:w-[62%]" },
  { id: "mobile", label: "Mobile", ratio: "390 / 844", width: "w-[62%] sm:w-[38%]" },
] as const;
type Device = (typeof DEVICES)[number]["id"];

const PILL =
  "inline-flex h-[39px] shrink-0 cursor-pointer items-center justify-center rounded-[50px] px-[17px] py-[12px] font-[family-name:var(--font-inter)] text-[14px] font-normal leading-[1.2] whitespace-nowrap transition-colors duration-150";
const PILL_ON = "bg-[var(--store-primary-40)] text-white";
const PILL_OFF =
  "border border-[#d3d7dd] bg-white text-[#111418] hover:border-[var(--store-primary-40)]";

/** The summary card's chips (Figma 1069:2330 and 1069:2345). */
const CHIP =
  "inline-flex items-center justify-center overflow-clip rounded-[9.626px] px-[11.23px] py-[6.417px] font-[family-name:var(--font-inter)] text-[11.23px] font-normal leading-[1.2] whitespace-nowrap";
const LABEL =
  "font-[family-name:var(--font-inter)] text-[12px] font-normal leading-[1.2] text-[var(--store-neutral-70)]";
const VALUE = "font-[family-name:var(--font-inter)] text-[14px] font-medium leading-[1.2] text-black";

/*
 * ┌─ DEMO-ONLY(pro-pages) ──────────────────────────────────────────────────────────────────────────┐
 * │ REMOVE WHEN EVERY THEME'S PRO PAGES COME FROM THE CATALOGUE. Find every piece with:              │
 * │   grep -rn "DEMO-ONLY(pro-pages)" app                                                            │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 * The Figma card's own "Unlock with Pro" entries (1069:2345, 1069:2348), shown when a theme has no
 * Pro-only pages to list (a Pro theme, or a domain with none), by request (2026-10-08). They are not
 * pages this catalogue has; to remove, render the section only when real `locked` pages exist.
 */
const MOCK_PRO_PAGES: readonly string[] = ["Notifications", "Authentication"];

export function ThemePreview({
  card,
  onBack,
  onClose,
  onApply,
}: {
  card: MasonryCard;
  onBack: () => void;
  onClose: () => void;
  onApply: (theme: MasonryCard["theme"]) => void;
}) {
  const thumbs = relatedScreens(card.slug);
  const all = themePages(card.slug);
  /* A Free theme includes the Free pages and Pro unlocks the rest; a Pro theme is Pro throughout. */
  const free = card.tier === "free";
  const included = free ? all.filter((p) => p.tier === "free") : all;
  const locked = free ? all.filter((p) => p.tier === "pro") : [];
  /* DEMO-ONLY(pro-pages): when a theme has no Pro-only pages of its own, the design's two stand-ins
     fill "Unlock with Pro", so the section is always shown as the Figma shows it. */
  const proPages: readonly string[] = locked.length > 0 ? locked.map((p) => p.title) : MOCK_PRO_PAGES;

  const [page, setPage] = useState(thumbs[0]?.slug);
  const [device, setDevice] = useState<Device>("desktop");
  const [full, setFull] = useState(false);
  /* Keyed to the image, not reset in an effect: a cached image can finish loading before an effect
     runs, and a reset after it left the placeholder over a loaded picture. */
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const current = thumbs.find((p) => p.slug === page) ?? thumbs[0];
  const frame = DEVICES.find((d) => d.id === device) ?? DEVICES[0];

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new card opens on its own first page
  useEffect(() => {
    setPage(thumbs[0]?.slug);
  }, [card.slug]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return (
    <aside
      aria-label={`Preview of ${card.theme.label}`}
      className={`flex min-h-0 flex-col gap-[24px] overflow-y-auto overscroll-contain bg-white/80 p-[16px] backdrop-blur ${full ? "fixed inset-0 z-50" : "h-full rounded-[16px] border border-[var(--store-card-border)]"}`}
    >
      <div className="-mb-[8px] flex items-center justify-between gap-[12px]">
        <button
          type="button"
          onClick={onBack}
          className={`${FONT} inline-flex cursor-pointer items-center gap-[4px] text-[length:var(--store-body-2)] font-medium text-[var(--store-neutral-80)] hover:text-[var(--store-primary-40)]`}
        >
          <Glyph size={16}>
            <path d="M14 6l-6 6 6 6" />
          </Glyph>
          Explore themes
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
        >
          <Glyph size={18}>
            <path d="M6 6l12 12M18 6L6 18" />
          </Glyph>
        </button>
      </div>

      {/* Title, then devices and the light/dark + full-screen pill (Figma 850:7923). */}
      <div className="flex flex-col gap-[24px]">
        <h2
          className={`${FONT} font-[family-name:var(--store-font-headline)] text-[length:var(--store-headline-10)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}
        >
          Preview · {card.theme.label}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div role="group" aria-label="Device" className="flex flex-wrap items-center gap-[10px]">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={device === d.id}
                onClick={() => setDevice(d.id)}
                className={`${PILL} ${device === d.id ? PILL_ON : PILL_OFF}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-[29.274px] rounded-[100px] border border-black px-[12px] py-[8px]">
            <div className="flex items-center overflow-clip rounded-[121.974px] bg-white">
              <span
                role="img"
                aria-label="Light"
                className="flex items-center justify-center bg-[var(--store-primary-40)] px-[9.758px] py-[7.318px]"
              >
                {/* biome-ignore lint/performance/noImgElement: the design's 19.5px SVG */}
                <img src="/recipe/sun.svg" alt="" width={19.5158} height={19.5158} className="block" />
              </span>
              <button
                type="button"
                disabled
                title="Dark previews aren't available yet"
                aria-label="Dark (not available yet)"
                className="flex cursor-not-allowed items-center justify-center px-[9.758px] py-[7.318px] opacity-50"
              >
                {/* biome-ignore lint/performance/noImgElement: the design's 19.5px SVG */}
                <img src="/recipe/moon.svg" alt="" width={19.5158} height={19.5158} className="block" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFull((f) => !f)}
              aria-label={full ? "Exit full screen" : "Full screen"}
              className="flex cursor-pointer items-center justify-center rounded-[6px]"
            >
              {/* biome-ignore lint/performance/noImgElement: the design's 24px SVG */}
              <img src="/recipe/arrows-out.svg" alt="" width={24.3947} height={24.3947} className="block" />
            </button>
          </div>
        </div>
      </div>

      {/* The preview box (Figma 1062:3936), with the summary card under the frame. */}
      <div className="relative shrink-0 rounded-[13.96px] bg-[var(--store-neutral-30)] p-[24px]">
        {current ? (
          <div
            className={`relative mx-auto overflow-hidden rounded-[10px] border border-[var(--store-card-border)] bg-white shadow-[0_8px_24px_-12px_#0c0c0c33] transition-[width] duration-300 motion-reduce:transition-none ${frame.width}`}
            style={{ aspectRatio: frame.ratio }}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={`${current.title} page, ${frame.label.toLowerCase()} view`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              onLoad={() => setLoaded(current.src)}
              onError={() => setFailed(current.src)}
              className="object-cover object-top"
            />
            {loaded !== current.src && failed !== current.src ? (
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[var(--store-neutral-40)] motion-reduce:animate-none" />
            ) : null}
            {failed === current.src ? (
              <div className={`${FONT} absolute inset-0 flex items-center justify-center bg-white p-[16px] text-center text-[length:var(--store-body-2)] text-[var(--store-neutral-80)]`}>
                This page's preview couldn't load.
              </div>
            ) : null}
          </div>
        ) : null}

        {/* "What's in this preview" (Figma 1069:2324), **under the frame, never over it**
            (2026-10-08, by request): the design floats it across the image's foot, which hid the
            bottom of every page. Its own styling is the design's. */}
        <section
          aria-label="What's in this preview"
          className="mt-[20.92px] flex flex-col gap-[24px] rounded-[24px] bg-white px-[24px] py-[18px] drop-shadow-[0_0_5px_rgba(0,0,0,0.12)]"
        >
          <h3 className="font-[family-name:var(--font-inter)] text-[16px] font-medium leading-[1.2] text-[var(--store-neutral-90)]">
            What's in this preview
          </h3>
          <div className="flex flex-col gap-[16px] sm:flex-row sm:gap-[24px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <p className={LABEL}>Included{free ? "" : " with Pro"}</p>
              <ul className="flex flex-wrap items-center gap-[8.561px]">
                {included.map((p) => (
                  <li key={p.slug} className={`${CHIP} bg-[var(--store-success-50)] text-white`}>
                    {p.title}
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro pages are shown disabled, as the design draws them: an outline, grey text, and a
                "Requires Pro" title, never something that reads as included. */}
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <p className={LABEL}>Unlock with Pro</p>
              <ul className="flex flex-wrap items-start gap-[4px]">
                {proPages.map((title) => (
                  <li
                    key={title}
                    aria-disabled="true"
                    title="Requires Pro"
                    className={`${CHIP} cursor-not-allowed border-[0.802px] border-[var(--store-neutral-60)] text-[var(--store-neutral-70)]`}
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-[16px]">
            <dl className="flex gap-[24px]">
              <div className="flex flex-col gap-[4px]">
                <dt className={LABEL}>Format</dt>
                <dd className={VALUE}>ZIP + setup guide</dd>
              </div>
              <div className="flex flex-col gap-[4px]">
                <dt className={LABEL}>Pages included</dt>
                <dd className={VALUE}>
                  {included.length} of {all.length}
                  {free && locked.length > 0 ? ` (Pro Unlocks ${all.length} of ${all.length})` : free ? "" : " with Pro"}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onApply(card.theme)}
              className="inline-flex h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[89.505px] bg-[var(--store-primary-50)] px-[24px] font-[family-name:var(--store-font-prompt)] text-[14.321px] font-medium leading-none tracking-[-0.1575px] text-white transition-colors duration-150 hover:bg-[var(--store-primary-60)]"
            >
              Apply
            </button>
          </div>
        </section>
      </div>

      {/* The theme's pages (Figma 850:7884), at the design's 260:172 tile and 10.2px corners. */}
      <div role="tablist" aria-label="Pages" className="grid shrink-0 grid-cols-2 gap-[14.45px] sm:grid-cols-4">
        {thumbs.map((p) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={current?.slug === p.slug}
            aria-label={p.title}
            title={p.title}
            onClick={() => setPage(p.slug)}
            className={`relative aspect-[260/172] cursor-pointer overflow-hidden rounded-[10.2px] border bg-[var(--store-neutral-30)] transition-shadow duration-150 ${current?.slug === p.slug ? "border-[var(--store-primary-40)] shadow-[0_0_0_2px_var(--store-primary-20)]" : "border-[var(--store-card-border)] hover:border-[var(--store-primary-40)]"}`}
          >
            <Image src={p.src} alt="" fill sizes="(min-width: 640px) 15vw, 45vw" className="object-cover object-top" />
          </button>
        ))}
      </div>

      <p className={`${FONT} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>
        Demo preview: screens are desktop captures of the Voilet build with demo data, shown under the{" "}
        {card.theme.label} name.
        {device !== "desktop" ? ` The ${frame.label.toLowerCase()} frame shows the top of that capture in the device's shape.` : ""}
      </p>
    </aside>
  );
}
