"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Glyph } from "./composer";
import type { MasonryCard } from "./masonry";
import { relatedScreens, themePages } from "./screen-cards";
import { type Scheme, SchemeExpand } from "./preview-controls";
import { FONT } from "./type";

/**
 * **A theme's preview**, opened from a card's Preview in the Explore Themes panel (Figma "AI Builder -
 * Guest - template preview", node 850:7592, as revised; 2026-10-08).
 *
 * **Top to bottom, by request (2026-10-09): details, then pages, then the big picture.**
 * 1. The title "Preview · <theme>" (Plus Jakarta Sans SemiBold 28) and the **"What's in this
 *    preview" card** (`1069:2324`) with Apply, so what the theme includes is read first.
 * 2. The page thumbnails (`850:7884`).
 * 3. The device pills with the light/dark + full-screen pill (`850:7921`), then the **preview box**
 *    (`1062:3936`) showing the chosen page **whole, at its real shape, never
 *    cropped**: the image's own pixels set its height.
 *
 * Colours and fonts are the design's, from its tokens where one exists (`--store-success-50`,
 * `--store-neutral-60/70/90`, `--store-primary-50`, Geist for Apply). **Sizes are the storefront's
 * scale, not the frame's** (2026-10-12, by request, as for the auth modal): the frame is drawn larger
 * than the home page, so the title is 20px, body 14px, controls 32 to 36px and the gaps 12 to 16px.
 *
 * **A device sets the frame's width only.** It used to force the device's shape (1440:900, 768:1024,
 * 390:844) and crop the capture to fit; the captures are desktop screenshots of the Voilet build, so
 * that cut off most of every page. Now Tablet and Mobile show the whole capture at a narrower width,
 * and the note under the preview says so.
 *
 * **Where it departs from the design:** the moon is disabled (no dark captures; the brief asks for
 * light/dark "when the output supports it", § 6); the thumbnails are a grid, not a strip running off
 * the panel (`CLAUDE.md`: no sideways-scrolling rows of buttons); a "← Explore themes" link goes back
 * to the wall; and the summary card sits **under** the frame at every width rather than over its
 * foot (by request), so no part of the page is hidden.
 */

/**
 * How much of the box's width each device's frame takes; the height is the capture's own. **Wider on
 * a phone**: at 38% of a phone-sized box the Mobile frame was 99px across, too small to read, so
 * below `sm` the narrow devices take more of it.
 */
const DEVICES = [
  { id: "desktop", label: "Desktop", width: "w-full" },
  { id: "tablet", label: "Tablet", width: "w-[85%] sm:w-[62%]" },
  { id: "mobile", label: "Mobile", width: "w-[62%] sm:w-[38%]" },
] as const;
type Device = (typeof DEVICES)[number]["id"];

/* The shared button scale (`btn` in `globals.css`). */
const PILL = "btn btn-md";
const PILL_ON = "btn-primary";
const PILL_OFF = "btn-secondary";

/** The summary card's chips (Figma 1069:2330 and 1069:2345). */
const CHIP =
  "inline-flex items-center justify-center overflow-clip rounded-[9.626px] px-[11.23px] py-[6.417px] font-[family-name:var(--font-inter)] text-[11.23px] font-normal leading-[1.2] whitespace-nowrap";
const LABEL =
  "font-[family-name:var(--font-inter)] text-[12px] font-normal leading-[1.2] text-[var(--store-neutral-70)]";
const VALUE = "font-[family-name:var(--font-inter)] text-[length:var(--store-body-2)] font-medium leading-[1.2] text-black";

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
  /** The preview's colour scheme (2026-10-12, by request: the group is usable). */
  const [scheme, setScheme] = useState<Scheme>("light");
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
      className={`flex min-h-0 flex-col gap-[16px] overflow-y-auto overscroll-contain bg-white/80 p-[16px] backdrop-blur ${full ? "fixed inset-0 z-50" : "h-full rounded-[16px] border border-[var(--store-card-border)]"}`}
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

      {/* 1. The theme's details: the title, then "What's in this preview" with Apply. */}
      <div className="flex shrink-0 flex-col gap-[16px]">
        <h2
          className={`${FONT} font-[family-name:var(--store-font-headline)] text-[length:var(--store-headline-12)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}
        >
          Preview · {card.theme.label}
        </h2>
        <section
          aria-label="What's in this preview"
          className="flex flex-col gap-[16px] rounded-[16px] bg-white p-[16px] drop-shadow-[0_0_5px_rgba(0,0,0,0.12)]"
        >
          <h3 className="font-[family-name:var(--font-inter)] text-[length:var(--store-body-2)] font-medium leading-[1.2] text-[var(--store-neutral-90)]">
            What's in this preview
          </h3>
          <div className="flex flex-col gap-[12px] sm:flex-row sm:gap-[16px]">
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
            <dl className="flex gap-[16px]">
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
              className="btn btn-md btn-primary"
            >
              Apply
            </button>
          </div>
        </section>
      </div>

      {/* 2. The theme's pages (Figma 850:7884), at the design's 260:172 tile and 10.2px corners. */}
      <div role="tablist" aria-label="Pages" className="grid shrink-0 grid-cols-2 gap-[12px] sm:grid-cols-4">
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

      {/* 3. The chosen page, whole: devices and the light/dark + full-screen pill (Figma 850:7923),
          then the capture at its own shape, never cropped. */}
      <div className="flex shrink-0 flex-col gap-[12px]">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div role="group" aria-label="Device" className="flex flex-wrap items-center gap-[8px]">
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
          {/* One shared group (`SchemeExpand`), as in the live Preview drawer: light, dark and full screen. */}
          <SchemeExpand
            scheme={scheme}
            onScheme={setScheme}
            onExpand={() => setFull((f) => !f)}
            expandLabel={full ? "Exit full screen" : "Full screen"}
            expanded={full}
          />
        </div>
        <div className="rounded-[12px] bg-[var(--store-neutral-30)] p-[12px] sm:p-[16px]">
          {current ? (
            <div
              className={`relative mx-auto overflow-hidden rounded-[10px] border border-[var(--store-card-border)] bg-white shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--store-neutral-100)_20%,transparent)] transition-[width] duration-300 motion-reduce:transition-none ${frame.width}`}
            >
              {/* `h-auto` with the capture's own pixels sets the height, so the page is shown in full
                  at its real shape; 1440x900 is only the placeholder's shape while it loads. */}
              <Image
                key={current.src}
                src={current.src}
                alt={`${current.title} page, ${frame.label.toLowerCase()} view`}
                width={1440}
                height={900}
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                onLoad={() => setLoaded(current.src)}
                onError={() => setFailed(current.src)}
                /* DEMO-ONLY(theme-dark): there are no dark captures yet, so dark inverts the light one
                   and turns its hues back, which keeps blues blue. Replace with the build's dark
                   screenshots when they exist; the caption below says it is simulated. */
                className={`block h-auto w-full transition-[filter] duration-300 ${scheme === "dark" ? "[filter:invert(0.92)_hue-rotate(180deg)]" : ""}`}
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
        </div>
        <p className={`${FONT} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>
          Demo preview: screens are desktop captures of the Voilet build with demo data, shown under the{" "}
          {card.theme.label} name.
          {device !== "desktop" ? ` The ${frame.label.toLowerCase()} frame shows the whole capture at that width.` : ""}
          {scheme === "dark" ? " Dark is simulated from the light capture." : ""}
        </p>
      </div>
    </aside>
  );
}
