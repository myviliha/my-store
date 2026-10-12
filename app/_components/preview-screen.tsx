"use client";

import { Bookmark, Download, Share } from "@/app/_vendor/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { THEMES } from "@/src/data/themes";

import { setAuth, unlocksPro, useUser } from "./auth-store";
import { previewUrlFor } from "./preview-url";
import { includedPages, type Recipe } from "./recipe";
import { designKey, useSaved } from "./saved-store";
import { ShareDialog } from "./share-dialog";
import { readShared, shareUrlFor } from "./share-link";
import { FONT } from "./type";

/**
 * **The final theme in its own tab** (`/preview?design=…`, 2026-10-12, by request): the Preview
 * drawer's expand opens this in a new browser tab, so the reader gets the whole window and keeps the
 * conversation in the tab they came from.
 *
 * **One bar, one line, always open** (by request): the theme's name, Download, Share, Save, the device
 * widths, and the way back to the store. It wears the store's colours (the accent gradient), so it
 * reads as the store's frame round the admin rather than the admin's own top bar. The page covers
 * the store's chrome (`fixed inset-0`), so nothing of the rail or top bar shows behind it.
 *
 * Download needs an account (sign-in waits for Download): the sign-in dialog opens here, and as
 * nothing is generated yet the note says so. Share and Save work as in the drawer.
 */

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
] as const;
type Device = (typeof DEVICES)[number]["id"];

export function PreviewScreen() {
  const account = useUser();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [loaded, setLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const waiting = useRef(false);

  /* The design comes in the address, read after hydration (`SD-177`). */
  useEffect(() => {
    setRecipe(readShared());
    setScheme(new URLSearchParams(window.location.search).get("scheme") === "dark" ? "dark" : "light");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 3000);
    return () => window.clearTimeout(t);
  }, [note]);

  const { saved, toggle } = useSaved(designKey(recipe ?? {}));
  const theme = THEMES.find((t) => t.id === recipe?.design);

  /* DEMO-ONLY(generate): nothing is generated yet, so a signed-in Download says so plainly. */
  const downloaded = () => setNote("Your package would download now. Downloads aren't connected in this demo yet.");
  const download = () => {
    if (account) return downloaded();
    waiting.current = true;
    setAuth("signin");
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the account arrives
  useEffect(() => {
    if (!account || !waiting.current) return;
    waiting.current = false;
    downloaded();
  }, [account]);
  const save = async () => {
    const now = await toggle();
    setNote(now ? (account ? "Saved to your account." : "Saved in this browser. Sign in to keep it on your account.") : "Removed from your saved designs.");
  };

  if (!ready) return <div className="fixed inset-0 z-[60] bg-[var(--store-neutral-30)]" />;

  if (!recipe) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-[12px] bg-[var(--store-neutral-30)] p-[24px] text-center">
        <p className={`${FONT} text-[length:var(--store-body-1)] font-semibold text-[var(--store-neutral-100)]`}>This preview link isn&apos;t valid.</p>
        <Link href="/" className="btn btn-md btn-primary">
          Go to Voilet
        </Link>
      </div>
    );
  }

  const pages = includedPages(recipe).filter((p) => p.tier === "free" || unlocksPro(account, recipe.design));
  const url = previewUrlFor(recipe, pages);
  const width = DEVICES.find((d) => d.id === device)?.width ?? "100%";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--store-neutral-30)]">
      <header className="flex h-[52px] shrink-0 items-center gap-[8px] overflow-x-auto border-b border-white/60 bg-gradient-to-r from-[color-mix(in_srgb,var(--tn-accent-violet-solid)_24%,white)] via-[color-mix(in_srgb,var(--tn-accent-blue-solid)_18%,white)] to-[color-mix(in_srgb,var(--tn-accent-pink-solid)_22%,white)] px-[12px] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--tn-accent-violet-solid)_45%,transparent)] [scrollbar-width:none]">
        <h1 className={`${FONT} mr-auto min-w-0 shrink truncate text-[length:var(--store-body-2)] font-semibold text-[var(--store-neutral-100)]`}>
          {theme?.label ?? "Admin"} <span className="font-normal text-[var(--store-neutral-70)] max-md:hidden">· Live preview</span>
        </h1>
        <div role="group" aria-label="Device" className="flex items-center gap-[4px] max-md:hidden">
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
        <span aria-hidden="true" className="mx-[4px] h-[20px] w-px shrink-0 bg-[var(--store-neutral-50)] max-md:hidden" />
        <button type="button" onClick={() => void save()} aria-pressed={saved} className={`btn btn-sm ${saved ? "btn-outline" : "btn-secondary"}`}>
          <Bookmark width={14} height={14} aria-hidden="true" />
          <span className="max-sm:hidden">{saved ? "Saved" : "Save"}</span>
        </button>
        <button type="button" onClick={() => setSharing(true)} className="btn btn-sm btn-secondary">
          <Share width={14} height={14} aria-hidden="true" />
          <span className="max-sm:hidden">Share</span>
        </button>
        <button type="button" onClick={download} className="btn btn-sm btn-primary">
          <Download width={14} height={14} aria-hidden="true" />
          Download
        </button>
        <Link href="/" className="btn btn-sm btn-ghost">
          Back to Voilet
        </Link>
      </header>

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
        {loaded ? null : (
          <div className={`${FONT} absolute inset-0 flex items-center justify-center gap-[10px] bg-[var(--store-neutral-30)] text-[length:var(--store-body-2)] text-[var(--store-neutral-80)]`}>
            <span aria-hidden="true" className="size-[18px] animate-spin rounded-full border-2 border-[var(--store-neutral-50)] border-t-[var(--store-primary-40)] motion-reduce:animate-none" />
            <span role="status">Starting your admin…</span>
          </div>
        )}
        {note ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[20px] flex justify-center px-[16px]">
            <p role="status" className={`${FONT} tn-auth-up rounded-full bg-[var(--store-neutral-100)] px-[16px] py-[8px] text-center text-[length:var(--store-body-3)] font-medium text-white shadow-[var(--shadow-float)]`}>
              {note}
            </p>
          </div>
        ) : null}
      </div>

      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        url={shareUrlFor(recipe)}
        title={`My ${theme?.label ?? ""} admin on Voilet`}
      />
    </div>
  );
}
