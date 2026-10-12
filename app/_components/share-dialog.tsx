"use client";

import { Check, Copy, Mail } from "@/app/_vendor/icons";
import { useEffect, useRef, useState } from "react";

import { FONT } from "./type";

/**
 * **Share the preview** (2026-10-12, by request): a dialog of the usual places, Messenger, WhatsApp,
 * Telegram, X, LinkedIn and email, plus copy link, and the device's own share sheet where there is one.
 *
 * **Each place shows its own logo on its brand colour** (the owner, 2026-10-12, over `CLAUDE.md`'s "no
 * third-party marks", for this dialog only): the marks are Simple Icons' (CC0) in `public/share/`,
 * drawn white on the brand colours in `globals.css` (`--brand-*`), unaltered, as each brand's share
 * guidelines ask. Email is a plain envelope: it is nobody's mark. Each opens that service's own
 * share page in a new tab with the link filled in; nothing is sent by us.
 *
 * A native `<dialog>` with `showModal()`, so it stacks over the drawer or the full-window preview,
 * holds focus, and closes on Escape or a click on the scrim.
 */

const enc = encodeURIComponent;
const TARGETS: readonly {
  readonly id: string;
  readonly name: string;
  /** The tile's colour, a `--brand-*` variable; email has none. */
  readonly bg: string;
  readonly href: (url: string, text: string) => string;
}[] = [
  /* Messenger has no web share address that works without a registered app id, so on a phone it
     is the app's own share link, and elsewhere the link is copied and Messenger opens to paste it. */
  { id: "messenger", name: "Messenger", bg: "bg-[var(--brand-messenger)]", href: (url) => `fb-messenger://share/?link=${enc(url)}` },
  { id: "whatsapp", name: "WhatsApp", bg: "bg-[var(--brand-whatsapp)]", href: (url, text) => `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  { id: "telegram", name: "Telegram", bg: "bg-[var(--brand-telegram)]", href: (url, text) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
  { id: "x", name: "X", bg: "bg-[var(--brand-x)]", href: (url, text) => `https://x.com/intent/post?url=${enc(url)}&text=${enc(text)}` },
  { id: "linkedin", name: "LinkedIn", bg: "bg-[var(--brand-linkedin)]", href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  { id: "email", name: "Email", bg: "bg-[var(--store-neutral-40)]", href: (url, text) => `mailto:?subject=${enc(text)}&body=${enc(`${text}\n${url}`)}` },
];

export function ShareDialog({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  /** The address to share, absolute. */
  url: string;
  /** One line that goes with it ("My Voilet CRM admin"). */
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  /** A line under the link, when a tile needs a word of explanation (Messenger on a computer). */
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setCopied(false);
      setHint(null);
      setNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
      el.showModal();
    } else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="tn-modal-in m-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px] bg-white p-0 text-left shadow-[var(--shadow-float)] backdrop:bg-[rgba(9,6,6,0.5)]"
    >
      <div className="flex flex-col gap-[20px] p-[20px] sm:p-[24px]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="flex flex-col gap-[4px]">
            <h2 id="share-title" className={`${FONT} font-[family-name:var(--store-font-headline)] text-[length:var(--store-headline-12)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}>
              Share your admin
            </h2>
            <p className={`${FONT} text-[length:var(--store-body-3)] leading-[1.5] text-[var(--store-neutral-80)]`}>
              Anyone with the link can open this design and its live preview.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-sm btn-ghost btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul className="grid grid-cols-3 gap-[12px]">
          {TARGETS.map((t) => (
            <li key={t.id}>
              <a
                href={t.href(url, title)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (t.id !== "messenger" || window.matchMedia("(pointer: coarse)").matches) return;
                  e.preventDefault();
                  void copy().then(() => window.open("https://www.messenger.com/", "_blank", "noreferrer"));
                  setHint("Link copied: paste it into a Messenger chat.");
                }}
                className={`${FONT} flex flex-col items-center gap-[6px] rounded-[12px] p-[8px] text-[length:var(--store-body-3)] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] focus-visible:outline-2 focus-visible:outline-[var(--store-primary-40)]`}
              >
                <span aria-hidden="true" className={`flex size-[44px] items-center justify-center rounded-full ${t.bg}`}>
                  {t.id === "email" ? (
                    <Mail width={22} height={22} className="text-[var(--store-neutral-100)]" />
                  ) : (
                    // biome-ignore lint/performance/noImgElement: the brand's own 24px SVG mark
                    <img src={`/share/${t.id}.svg`} alt="" width={24} height={24} className="block size-[22px]" />
                  )}
                </span>
                {t.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-[8px]">
          <label htmlFor="share-link" className={`${FONT} text-[length:var(--store-body-3)] font-medium text-[var(--store-neutral-100)]`}>
            Link
          </label>
          <div className="flex items-center gap-[8px]">
            <input
              id="share-link"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              className={`${FONT} h-[40px] min-w-0 flex-1 rounded-[10px] border border-[var(--store-control-border)] bg-[var(--store-neutral-30)] px-[12px] text-[length:var(--store-body-3)] text-[var(--store-neutral-80)] outline-none focus:border-[var(--store-primary-40)]`}
            />
            <button type="button" onClick={copy} className="btn btn-lg btn-primary">
              {copied ? <Check width={16} height={16} aria-hidden="true" /> : <Copy width={16} height={16} aria-hidden="true" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p role="status" className={`${FONT} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)] ${hint ? "" : "sr-only"}`}>
            {hint ?? (copied ? "Link copied" : "")}
          </p>
        </div>

        {native ? (
          <button
            type="button"
            onClick={() => void navigator.share({ title, url }).catch(() => {})}
            className="btn btn-md btn-secondary w-full"
          >
            More options…
          </button>
        ) : null}
      </div>
    </dialog>
  );
}
