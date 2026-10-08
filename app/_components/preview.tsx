"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { labelOf } from "@/src/configurator-core";
import { THEMES } from "@/src/data/themes";

import { Glyph } from "./composer";
import { includedPages, pagesOf, type Recipe, useCaseOf } from "./recipe";
import { TierBadge } from "./recipe-ui";
import { BODY_2, BODY_3, BUTTON_PRIMARY, BUTTON_SECONDARY, FONT } from "./type";

/**
 * The recipe preview, beside the conversation (brief § 6).
 *
 * **What it shows is what the recipe ships**: one tab per included page, each the real capture from
 * `public/gallery/`, not the nearest stock thumbnail. The brief's other contents are here too: the
 * name and revision, the framework and CSS, desktop/tablet/mobile, Free/Pro, demo-data labelling,
 * and Download.
 *
 * **Honest about what it is.** The captures are of the Voilet build, so for any other design the
 * panel says the design is applied in the download rather than letting a Voilet screenshot stand
 * in for Console. There are no responsive captures yet, so the tablet and mobile frames say they
 * show the desktop capture narrowed. And a change to the recipe after the preview was drawn marks
 * it **Outdated** until it is refreshed (§ 6: "Configuration changes mark an older preview as
 * outdated until refreshed").
 *
 * Light/dark is left out on purpose: § 6 asks for it "when the output supports it", and nothing in
 * the catalogue says which outputs do.
 */

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
] as const;

type Device = (typeof DEVICES)[number]["id"];

const SEG = `${BODY_3} rounded-full border px-[12px] py-[5px] font-semibold transition-colors duration-150 cursor-pointer`;
const SEG_ON = "border-[var(--store-primary-40)] bg-[var(--store-primary-40)] text-white";
const SEG_OFF =
  "border-[var(--store-card-border)] bg-white text-[var(--store-neutral-100)] hover:border-[var(--store-primary-40)]";

export function Preview({
  recipe,
  revision,
  outdated,
  onRefresh,
  onClose,
  onDownload,
}: {
  /** The recipe as it was when this preview was drawn. */
  recipe: Recipe;
  revision: number;
  /** The live recipe has changed since. */
  outdated: boolean;
  onRefresh: () => void;
  onClose: () => void;
  onDownload: () => void;
}) {
  const pages = includedPages(recipe);
  const all = pagesOf(useCaseOf(recipe.useCase));
  const design = THEMES.find((t) => t.id === recipe.design);
  const [device, setDevice] = useState<Device>("desktop");
  const [page, setPage] = useState(pages[0]?.slug);
  const [full, setFull] = useState(false);
  const current = pages.find((p) => p.slug === page) ?? pages[0];

  /* A refreshed preview may have dropped the page on screen. */
  useEffect(() => {
    if (!pages.some((p) => p.slug === page)) setPage(pages[0]?.slug);
  }, [pages, page]);

  /* Escape leaves full screen, as every full-screen surface does. */
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const width = DEVICES.find((d) => d.id === device)?.width ?? "100%";

  return (
    <aside
      aria-label="Preview"
      className={`flex min-h-0 flex-col gap-[12px] bg-white/80 p-[16px] backdrop-blur ${full ? "fixed inset-0 z-50" : "h-full rounded-[16px] border border-[var(--store-card-border)]"}`}
    >
      <header className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <h2 className={`${FONT} truncate text-[20px] font-bold text-[var(--store-neutral-100)]`}>
            Preview · {design?.label} {useCaseOf(recipe.useCase)?.label}
          </h2>
          <div className="flex flex-wrap items-center gap-[6px]">
            <TierBadge tier={recipe.tier === "pro" ? "pro" : "free"} />
            <span className={`${BODY_3} rounded-full bg-[var(--store-neutral-30)] px-[8px] py-[1px] font-medium text-[var(--store-neutral-100)]`}>
              Revision {revision}
            </span>
            <span className={`${BODY_3} rounded-full bg-[var(--tn-accent-amber-soft)] px-[8px] py-[1px] font-semibold text-[var(--tn-accent-amber-ink)]`}>
              Representative preview · demo data
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[4px]">
          <button
            type="button"
            onClick={() => setFull((f) => !f)}
            aria-label={full ? "Exit full screen" : "Full screen"}
            className="flex size-[32px] cursor-pointer items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
          >
            <Glyph size={18}>
              {full ? (
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
              ) : (
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              )}
            </Glyph>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex size-[32px] cursor-pointer items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
          >
            <Glyph size={18}>
              <path d="M6 6l12 12M18 6L6 18" />
            </Glyph>
          </button>
        </div>
      </header>

      {outdated ? (
        <div role="status" className="flex items-center justify-between gap-[8px] rounded-[10px] bg-[var(--tn-accent-amber-soft)] px-[12px] py-[8px]">
          <span className={`${BODY_2} font-medium text-[var(--tn-accent-amber-ink)]`}>
            Outdated: your configuration changed after this preview.
          </span>
          <button type="button" onClick={onRefresh} className={`${BUTTON_SECONDARY} shrink-0`}>
            Refresh preview
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <div role="group" aria-label="Device" className="flex gap-[6px]">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={device === d.id}
              onClick={() => setDevice(d.id)}
              className={`${SEG} ${device === d.id ? SEG_ON : SEG_OFF}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>
          {labelOf(recipe.framework ?? "")} · {labelOf(recipe.css ?? "")}
        </span>
      </div>

      <div role="tablist" aria-label="Pages" className="flex gap-[6px] overflow-x-auto pb-[2px] [scrollbar-width:thin]">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={current?.slug === p.slug}
            onClick={() => setPage(p.slug)}
            className={`${SEG} shrink-0 ${current?.slug === p.slug ? SEG_ON : SEG_OFF}`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto rounded-[12px] bg-[var(--store-neutral-30)] p-[12px]">
        {current ? (
          <div className="mx-auto overflow-hidden rounded-[10px] border border-[var(--store-card-border)] bg-white shadow-[0_8px_24px_-12px_#0c0c0c33] transition-[width] duration-300" style={{ width, maxWidth: "100%" }}>
            <Shot key={current.src} src={current.src} title={current.title} width={current.width} height={current.height} />
          </div>
        ) : (
          <p className={`${BODY_2} p-[24px] text-center text-[var(--store-neutral-80)]`}>
            No pages selected. Tick at least one page in the summary to preview it.
          </p>
        )}
      </div>

      <p className={`${BODY_3} text-[var(--store-neutral-80)]`}>
        Screens are captured from the Voilet build with demo data
        {design && design.id !== "voilet" ? `; the ${design.label} design is applied in your download` : ""}.
        {device !== "desktop" ? " Tablet and mobile frames show the desktop capture narrowed; responsive captures aren't available yet." : ""}
      </p>

      <footer className="flex flex-wrap items-center justify-between gap-[12px] rounded-[12px] bg-[var(--store-neutral-30)] px-[14px] py-[10px]">
        <dl className={`${BODY_3} flex flex-wrap gap-x-[20px] gap-y-[4px]`}>
          <div>
            <dt className="text-[var(--store-neutral-80)]">Format</dt>
            <dd className="font-semibold text-[var(--store-neutral-100)]">ZIP + setup guide</dd>
          </div>
          <div>
            <dt className="text-[var(--store-neutral-80)]">Pages included</dt>
            <dd className="font-semibold text-[var(--store-neutral-100)]">
              {pages.length} of {all.length}
              {recipe.tier !== "pro" && all.length > pages.length ? " (Pro unlocks all)" : ""}
            </dd>
          </div>
        </dl>
        <button type="button" onClick={onDownload} className={BUTTON_PRIMARY}>
          Download
        </button>
      </footer>
    </aside>
  );
}

/**
 * One page's capture, with its own loading and error state.
 *
 * **The image is always in the layout, with the placeholder laid over it.** It used to be
 * `display: none` until `onLoad`, and a lazily loaded image that is not displayed is never fetched,
 * so the panel sat on its placeholder for ever. Keyed on the source by the caller, so moving to
 * another page starts a fresh state rather than resetting one in an effect that can lose the race
 * with a cached image's `load`.
 */
export function Shot({ src, title, width, height }: { src: string; title: string; width: number; height: number }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  return (
    <div className="relative min-h-[200px]">
      <Image
        src={src}
        alt={`${title} page`}
        width={width}
        height={height}
        priority
        sizes="(min-width: 1024px) 55vw, 100vw"
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className="block h-auto w-full"
      />
      {state === "loading" ? (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[var(--store-neutral-40)] motion-reduce:animate-none" />
      ) : null}
      {state === "error" ? (
        <div className={`${BODY_2} absolute inset-0 flex items-center justify-center bg-white p-[16px] text-center text-[var(--store-neutral-80)]`}>
          This page's preview couldn't load. The page is still in your download.
        </div>
      ) : null}
    </div>
  );
}
