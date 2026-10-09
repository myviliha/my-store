"use client";

import { VoiletWordmark } from "@/app/_vendor/voilet-wordmark";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { initialsOf, setAuth, signOut, useUser } from "./auth-store";
import { setDrawer, useDrawer } from "./drawer-store";
import { Panel } from "./menu";
import { BUTTON_PRIMARY, FONT } from "./type";

/**
 * The bar above the content, which is not the storefront's navigation (`SD-208`).
 *
 * **The five-item menu is gone because the rail already carries it.** `VoiletNav` centres Home,
 * Template, Pricing, Framework and Resource on the bar, which is right on a page whose bar is the
 * only chrome and wrong beside a rail listing fourteen destinations: the same question answered
 * twice, in two places, with two different answers about which page you are on.
 *
 * The reference puts four things here and all of them are right-aligned, because its brand sits in
 * the rail: a search affordance, a promotional chip, a primary call to action, and a sign-in link.
 *
 * **The chip is not reproduced.** Theirs is a Google-branded "Add to Chrome" promo for a browser
 * extension we do not ship, and a chip carrying somebody else's mark is the line `SD-204` draws
 * between taking a layout and taking a brand. The space it occupied is left to the three controls
 * that are ours.
 *
 * **The search expands from the icon** (`SD-211`). The reference scopes a second rule to this bar:
 * `.container-new-header .top-header #search-box-csr { width: 0 }`, against the `width: 100%` it
 * takes open, with `justify-content: flex-end`. So the field is not hidden and revealed, it is a box
 * of **zero width** that grows, and it grows leftward because its content is pinned to its right
 * edge. That is why the icon appears to stay put while a field unrolls behind it.
 *
 * The same `.15s` on `cubic-bezier(.4,0,.2,1)` as everything else here, and `overflow-hidden` on the
 * box so the field is clipped rather than spilling while the width is still animating.
 */
/**
 * **On a phone the bar carries the brand and the menu** (2026-10-08, after the Figma mobile frames):
 * the rail is a drawer there, so the wordmark moves into the bar on the left and a menu button on
 * the right opens the drawer. Search, Pricing and Sign up are hidden below `md`: Pricing and Sign in
 * are in the drawer, and the home page has its own theme search. Tablet and desktop are unchanged.
 */
export function TopBar() {
  const [open, setOpen] = useState(false);
  const drawer = useDrawer();
  const user = useUser();
  const field = useRef<HTMLInputElement>(null);

  /* Focus follows the expansion rather than racing it: a field focused while its box is still zero
     wide scrolls the page to a control nobody can see yet. */
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  return (
    /*
     * **No rule, and `--header-height: 56px`** (`SD-209`). I gave this a bottom border and a white
     * ground; the reference has neither. The bar sits on the page's own colour and is separated from
     * the content by space rather than a line, which is why a line reads as an extra band: with the
     * rail beside it there is already an edge doing that work.
     */
    <div className="flex h-[56px] w-full items-center justify-between gap-[16px] px-[16px] md:justify-end md:px-[24px]">
      <Link href="/" aria-label="Voilet home" className="flex items-center md:hidden">
        <VoiletWordmark size="rail" />
      </Link>
      {/*
       * HIDDEN FOR NOW (2026-10-09, by request), kept to bring back later: the search, a field that
       * unrolls to the left of its icon. To restore, delete this note (from its opening brace to the
       * blank line under it) and the closing brace line after the button. `open`, `field` and the
       * effect that focuses the field stay in place for it.
       *
       * The field's box is `justify-end` inside, so its right edge stays under the icon and it grows
       * to the left rather than pushing the controls beside it.

      <div
        className={`flex justify-end overflow-hidden max-md:hidden transition-[width] duration-150 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${open ? "w-[320px] max-w-[50vw]" : "w-0"}`}
      >
        <input
          ref={field}
          type="search"
          name="q"
          autoComplete="off"
          aria-label="Search themes"
          placeholder="Search themes"
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="h-[36px] w-[320px] rounded-full border border-[var(--store-card-border)] bg-white px-[16px] text-[length:var(--store-body-2)] leading-[1.375rem] text-[var(--store-neutral-100)] outline-none placeholder:text-[var(--store-neutral-70)] focus:border-[var(--store-primary-40)]"
        />
      </div>
      <button
        type="button"
        aria-label={open ? "Close search" : "Search themes"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-[32px] shrink-0 max-md:hidden cursor-pointer items-center justify-center rounded-full text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-10)]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m13.5 13.5 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      */}

      {/*
       * HIDDEN FOR NOW (2026-10-09, by request), kept to bring back later: the Pricing button and the
       * account control (Sign up when signed out, the avatar menu when signed in). To restore, delete
       * this note (from its opening brace to the blank line under it) and the closing brace line after
       * the account block. Everything they use stays in place: `AccountMenu`
       * below, `useUser`, `setAuth`, `Panel` and `BUTTON_PRIMARY`. Sign in is still in the rail.
       *
       * Pricing: the crown is the reference's own mark for the paid tier, and it is a generic glyph
       * rather than anybody's brand, so it stays. Account: signed out it opens the auth modal on
       * sign-up (`AuthModal`), which links back to sign-in; signed in it is the avatar and its menu.

      <Link
        href="/pricing"
        className={`${BUTTON_PRIMARY} max-md:hidden`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2.5 5.5 5 9l4-5.5L13 9l2.5-3.5v7.25a1.25 1.25 0 0 1-1.25 1.25H3.75A1.25 1.25 0 0 1 2.5 12.75V5.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        Pricing
      </Link>

      {user ? (
        <AccountMenu name={user.name} email={user.email} />
      ) : (
        <button
          type="button"
          onClick={() => setAuth("signup")}
          className={`${FONT} shrink-0 cursor-pointer text-[length:var(--store-body-2)] font-medium leading-[1.5] text-[var(--store-neutral-100)] transition-colors duration-150 hover:text-[var(--store-primary-40)] max-md:hidden`}
        >
          Sign up
        </button>
      )}
      */}

      <button
        id="rail-menu-button"
        type="button"
        aria-label="Open the menu"
        aria-controls="rail"
        aria-expanded={drawer}
        onClick={() => setDrawer(true)}
        className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-10)] md:hidden"
      >
        {/* The rail's own glyph, pointing the way the drawer comes in from. */}
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1.47 11.15h7.6M1.47 7.69H7M1.47 4.23h7.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 4.6 10.6 7 13 9.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/**
 * **The signed-in account, in the bar** (2026-10-09, the full-flow demo): the initials in a gradient
 * circle, the size of the bar's other round buttons, opening the shared `Panel` with the name, the
 * email and Sign out. Hidden below `md` with the rest of the bar's right side; on a phone the drawer
 * shows the account instead (`Rail`).
 */
function AccountMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0 max-md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Account: ${name}`}
        title={name}
        className={`${FONT} flex size-[32px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[var(--tn-accent-blue-solid)] to-[var(--tn-accent-violet-solid)] text-[length:var(--store-body-3)] font-semibold text-white transition-[filter] duration-150 hover:brightness-110`}
      >
        {initialsOf(name)}
      </button>
      <Panel open={open} onClose={() => setOpen(false)} label="Account" heading={false} width={240}>
        <div className="flex flex-col gap-[2px] px-[8px] pt-[6px] pb-[10px]">
          <p className={`${FONT} truncate text-[length:var(--store-body-2)] font-semibold text-[var(--store-neutral-100)]`}>
            {name}
          </p>
          <p className={`${FONT} truncate text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>{email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            signOut();
          }}
          className={`${FONT} flex w-full cursor-pointer items-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left text-[length:var(--store-body-2)] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)]`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
          </svg>
          Sign out
        </button>
      </Panel>
    </div>
  );
}
