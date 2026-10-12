"use client";

import { Bookmark, Download, Share } from "@/app/_vendor/icons";
import { useEffect, useId, useRef, useState } from "react";

import { labelOf } from "@/src/configurator-core";
import { livePreviewUrl } from "@/src/data/live-preview";
import { THEMES } from "@/src/data/themes";

import { useUser } from "./auth-store";
import { Glyph } from "./composer";
import { includedPages, type Recipe, swatchOf } from "./recipe";
import { designKey, useSaved } from "./saved-store";
import { ShareDialog } from "./share-dialog";
import { shareUrlFor } from "./share-link";
import { FONT } from "./type";

/**
 * **The generated admin, running** (2026-10-12, by request): the summary's Show Preview opens the
 * final theme full-window, as a web app the reader can click through, not as a picture.
 *
 * A native `<dialog>` with `showModal()`, like sign-in: Escape closes it, the page behind is inert
 * and does not scroll (`globals.css`).
 *
 * **The bar stays out of the way and opens on hover** (2026-10-12, by request): a thin strip with the
 * theme's name and close, which grows on hover or keyboard focus into the actions, **Download, Share
 * and Save**, the device widths and open in a new tab, so the reader acts without leaving the
 * preview. Collapsed, Download and Share stay in view with More for the rest on a touch
 * screen, which has no hover; a desktop opens it by hovering, so More is not shown there. Download needs an
 * account (business rule: sign-in waits for Download); the sign-in dialog opens over the preview and
 * the download carries on once they are in. Share opens the share dialog (`ShareDialog`); Save keeps
 * the design in this browser for a guest and on the account when signed in (`saved-store.ts`). Each
 * action answers with a short note in the preview. The frame's address is `livePreviewUrl` (DEMO-ONLY(live-preview)): a stand-in admin today,
 * the generated build's URL later, with nothing here changing.
 */

/** The running admin's address for a recipe and its pages: the drawer and the full window share it. */
export const previewUrlFor = (recipe: Recipe, pages: ReturnType<typeof includedPages>): string => {
  const theme = THEMES.find((t) => t.id === recipe.design);
  const swatch = theme ? swatchOf(theme) : "";
  return livePreviewUrl({
    theme: theme?.label ?? "Admin",
    primary: swatch.startsWith("#") ? swatch : "",
    stack: `${labelOf(recipe.framework ?? "")} + ${labelOf(recipe.css ?? "")}`,
    pages: pages.map((p) => ({ slug: p.slug, title: p.title, src: p.src })),
  });
};

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
] as const;
type Device = (typeof DEVICES)[number]["id"];

export function LivePreview({
  recipe,
  pages,
  open,
  onClose,
  onDownload,
  scheme = "light",
}: {
  recipe: Recipe;
  /** The pages to run: the ones the reader can ship (Free, or Pro when unlocked). */
  pages: ReturnType<typeof includedPages>;
  open: boolean;
  onClose: () => void;
  /** The conversation's Download: the package card, in the chat behind (it asks to sign in first). */
  onDownload: () => void;
  /** Light or dark, as the drawer had it: told to the page once it loads (`voilet:scheme`). */
  scheme?: "light" | "dark";
}) {
  const account = useUser();
  /** A short note in the preview after an action ("Link copied"), cleared on its own. */
  const [note, setNote] = useState<string | null>(null);
  /** An action a guest started, waiting for them to sign in. */
  const waiting = useRef<"download" | null>(null);
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 2600);
    return () => window.clearTimeout(t);
  }, [note]);
  const dialog = useRef<HTMLDialogElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setLoaded(false);
      setMore(false);
      setDevice("desktop");
      el.showModal();
      /* Focus the dialog, not its first button (Close, in the bar), so the bar starts thin; Tab
         moves into it, and keyboard focus opens it as hover does. */
      el.focus();
    } else if (!open && el.open) el.close();
  }, [open]);

  const theme = THEMES.find((t) => t.id === recipe.design);
  const url = previewUrlFor(recipe, pages);
  const width = DEVICES.find((d) => d.id === device)?.width ?? "100%";

  /* Save: this browser for a guest, the account for a signed-in reader (`saved-store.ts`). */
  const { saved, toggle } = useSaved(designKey(recipe));
  const [sharing, setSharing] = useState(false);
  /** The bar opened by More (touch, or a click), as hover and keyboard focus open it too. */
  const [more, setMore] = useState(false);
  const moreId = useId();

  const doDownload = () => {
    onDownload();
    setNote("Your package is ready in the chat, below this preview.");
  };
  /* Download needs an account: the conversation's Download asks to sign in and carries on after. */
  const download = () => {
    if (account) return doDownload();
    waiting.current = "download";
    onDownload();
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the account arrives
  useEffect(() => {
    if (!account || !waiting.current) return;
    waiting.current = null;
    setNote("Signed in. Your package is ready in the chat, below this preview.");
  }, [account]);
  const save = async () => {
    const now = await toggle();
    setNote(now ? (account ? "Saved to your account." : "Saved in this browser. Sign in to keep it on your account.") : "Removed from your saved designs.");
  };
  return (
    <dialog
      ref={dialog}
      aria-label={`${theme?.label ?? "Admin"}, live preview`}
      tabIndex={-1}
      onClose={onClose}
      className="tn-modal-in m-0 h-dvh outline-none max-h-none w-screen max-w-none bg-[var(--store-neutral-30)] p-0 backdrop:bg-[rgba(9,6,6,0.5)]"
    >
      {open ? (
        <div className="flex h-full flex-col">
          {/* Thin until hovered or focused; always open where there is no hover (touch). */}
          {/* The site's own colours behind the bar (the accent colours `Aurora` glows in, mixed a little stronger than its tints), so it reads as
              the store's frame round the reader's admin, not as part of the admin (2026-10-12, by
              request: a white bar was taken for the admin's own top bar). */}
          <div className="group/bar relative z-10 shrink-0 border-b border-white/60 bg-gradient-to-r from-[color-mix(in_srgb,var(--tn-accent-violet-solid)_24%,white)] via-[color-mix(in_srgb,var(--tn-accent-blue-solid)_18%,white)] to-[color-mix(in_srgb,var(--tn-accent-pink-solid)_22%,white)] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--tn-accent-violet-solid)_45%,transparent)]">
            {/* Collapsed, the two actions people come for stay in view, Download and Share, with More
                for the rest (2026-10-12, by request): a bar of only a name was easy to miss, and a
                touch screen cannot hover. Hover and keyboard focus still open it as before. */}
            <div className="relative flex h-[44px] items-center gap-[8px] px-[12px]">
              <p className={`${FONT} mr-auto min-w-0 truncate text-[length:var(--store-body-2)] font-semibold text-[var(--store-neutral-100)]`}>
                {theme?.label ?? "Admin"} <span className="font-normal text-[var(--store-neutral-70)] max-sm:hidden">· Live preview</span>
              </p>
              <button type="button" onClick={download} className="btn btn-sm btn-primary">
                <Download width={14} height={14} aria-hidden="true" />
                Download
              </button>
              <button type="button" onClick={() => setSharing(true)} className="btn btn-sm btn-secondary">
                <Share width={14} height={14} aria-hidden="true" />
                <span className="max-sm:hidden">Share</span>
              </button>
              <button
                type="button"
                onClick={() => setMore((m) => !m)}
                aria-expanded={more}
                aria-controls={moreId}
                /* Only where there is no hover (touch): on a desktop, hovering the bar opens it. */
                className="btn btn-sm btn-ghost [@media(hover:hover)]:hidden"
              >
                More
                <Glyph size={14}>
                  <path d={more ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
                </Glyph>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close live preview"
                className="btn btn-sm btn-ghost btn-icon"
              >
                <Glyph size={18}>
                  <path d="M6 6l12 12M18 6L6 18" />
                </Glyph>
              </button>
            </div>
            <div
              id={moreId}
              className={`relative grid transition-[grid-template-rows] duration-200 ease-out group-has-[:focus-visible]/bar:grid-rows-[1fr] group-hover/bar:grid-rows-[1fr] motion-reduce:transition-none ${more ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-[8px] px-[12px] pb-[10px]">
                  <button
                    type="button"
                    onClick={() => void save()}
                    aria-pressed={saved}
                    className={`btn btn-sm ${saved ? "btn-outline" : "btn-secondary"}`}
                  >
                    <Bookmark width={14} height={14} aria-hidden="true" />
                    {saved ? "Saved" : "Save"}
                  </button>
                  <div role="group" aria-label="Device" className="mx-auto hidden items-center gap-[6px] sm:flex">
                    {DEVICES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        aria-pressed={device === d.id}
                        onClick={() => setDevice(d.id)}
                        className={`btn btn-sm ${device === d.id ? "btn-primary" : "btn-ghost"}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost ml-auto sm:ml-0">
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 justify-center overflow-hidden">
            <iframe
              src={url}
              title={`${theme?.label ?? "Admin"} live preview`}
              onLoad={(e) => {
                setLoaded(true);
                e.currentTarget.contentWindow?.postMessage({ type: "voilet:scheme", scheme }, "*");
              }}
              style={{ width }}
              className={`h-full max-w-full border-0 bg-white transition-[width] duration-300 motion-reduce:transition-none ${device === "desktop" ? "" : "border-x border-[var(--store-card-border)]"}`}
            />
            {note ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-[20px] flex justify-center px-[16px]">
                <p
                  role="status"
                  className={`${FONT} tn-auth-up rounded-full bg-[var(--store-neutral-100)] px-[16px] py-[8px] text-center text-[length:var(--store-body-3)] font-medium text-white shadow-[var(--shadow-float)]`}
                >
                  {note}
                </p>
              </div>
            ) : null}
            {loaded ? null : (
              <div className={`${FONT} absolute inset-0 flex items-center justify-center gap-[10px] bg-[var(--store-neutral-30)] text-[length:var(--store-body-2)] text-[var(--store-neutral-80)]`}>
                <span
                  aria-hidden="true"
                  className="size-[18px] animate-spin rounded-full border-2 border-[var(--store-neutral-50)] border-t-[var(--store-primary-40)] motion-reduce:animate-none"
                />
                <span role="status">Starting your admin…</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        url={shareUrlFor(recipe)}
        title={`My ${theme?.label ?? ""} admin on Voilet`}
      />
    </dialog>
  );
}
