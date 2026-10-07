"use client";

import { VoiletWordmark } from "@/app/_vendor/voilet-wordmark";
import {
  Bolt,
  Box,
  Code,
  Cube,
  Dashboard,
  Download,
  File,
  FileText,
  Home,
  Layout,
  Palette,
  Person,
  Reader,
  Rocket,
  Star,
} from "@/app/_vendor/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, useState } from "react";

import { ASSETS } from "@/src/data/assets";

import { accentAt, FONT } from "./type";

/**
 * The left rail: 350px open, 60px collapsed, down every page with the top bar to its
 * right (the layout puts it in a flex row beside the page column).
 *
 * **Colours are ours, not the reference's three literals** (`SD-204`): ground `--store-primary-10`,
 * hover and active `--store-primary-20`, active label `--store-primary-40`.
 *
 * **The collapsed width is 60px, and it is derived, not copied** (`SD-205`'s rule, as in
 * `../../voilet/_components/sidebar.tsx`). An icon's centre is rail padding + item padding + half the
 * icon: **8 + 13 + 9 = 30**. The collapsed rail is twice that, 60, so the icons stay exactly where
 * they were and the rail narrows around them. It happens to equal the reference's own 60.
 *
 * **The three numbers move together, and twice now they have not.** The comment read `12 + 11 + 7`
 * while the row carried 10px of padding and a 24px glyph, which is 34: the icons jumped 4px on every
 * collapse and the arithmetic that was supposed to prevent it was describing a rail from two changes
 * ago. Change the glyph and you change the padding, or the sum stops being true.
 *
 * **Motion is `SD-205`'s too**: width 260ms on a decelerating curve, labels lead out and follow in
 * staggered, and both are empty under `prefers-reduced-motion`.
 *
 * **Destinations are routes that have a `page.tsx`.** Two are approximations, stated here: Frameworks
 * goes to `/themes` because the catalogue is where framework is filtered (there is no per-framework
 * page; the footer does the same), and Documentation is the exported `public/docs`, so it is a plain
 * anchor, which a client router cannot resolve.
 *
 * **Icons are `@viliha/vui-react/icons`** (Radix). The brand mark is `VoiletWordmark`.
 *
 * **The look** (2026-10-07): a soft blue-to-violet ground with a hairline edge; the current page is
 * a white pill with an accent bar and its label in brand blue, found from the URL rather than
 * guessed; each row's icon takes its own accent on hover and when active, the same five accents
 * the home page rotates; the two lists are parted by a 1px rule in a fixed 24px slot; and the foot
 * carries an upgrade card whose count is read from `ASSETS`, so it cannot promise screens that do not exist.
 * None of it moves an icon: paddings and the glyph size are untouched, so the collapse arithmetic
 * below still holds.
 */
/*
 * **192px, from `--sidebar-width`, not 350 from `--t-w-sidebar-v2`** (`SD-208`). The reference's
 * stylesheet carries two sidebar families and only one is live. The corroboration is the collapsed
 * width: `--sidebar-mini-width` is 60 and `--t-w-sidebar-mini-v2` is also 60, but 60 pairs with 192
 * in the family that also declares `--sidebar-details-width`. Picking a variable out of a list
 * without checking which one the element uses is how 350 got here.
 */
const RAIL_EXPANDED = "w-[192px]";
/*
 * **60px, and the arithmetic has to agree with it** (`SD-207`). The 18px glyph sits at 8px of rail
 * padding plus 13px of item padding, so its centre is 8 + 13 + 9 = 30 and twice 30 is 60: centred
 * in the collapsed rail, reached from the paddings rather than copied. **It was 9px of item padding
 * until 2026-10-07**, which put every icon's centre at 26, 4px left of the collapsed rail's middle,
 * while this comment still claimed 30. Everything else in the collapsed rail is held to the same
 * 30: the expand button is `mx-auto` in the 44px between the paddings, and the Upgrade button drops its gap when the label is gone, because a
 * gap beside a zero-width label still pushes the icon 3px left. The rail's edge is an inset shadow,
 * not `border-r`: a border takes a pixel from the content box, which puts everything centred in it
 * half a pixel left of the rail's middle.
 *
 * **`h-dvh`, not `h-screen`.** `100vh` is the viewport with the mobile browser's toolbars retracted,
 * so with them showing the rail's foot, Upgrade included, sat under the toolbar. `dvh` is the
 * height actually visible. The rail staying still at the page's ends is `overscroll-behavior` in
 * `globals.css`, not anything here: `sticky` was never the problem, the whole page bouncing was.
 */
const RAIL_COLLAPSED = "w-[60px]";
/*
 * **One box for the wordmark in both states, so the V cannot move vertically.** The full wordmark's
 * box is as tall as its letters (19px text at `leading-none`, so 19px); the mark alone is 17.922px.
 * Each is centred in the 40px brand row, so the mark sat 0.54px lower when the rail was open and
 * hopped on every toggle. Pinning both boxes at 19px puts the mark's top at one y open or shut.
 */
const WORDMARK_BOX = "h-[19px]";
const RAIL_MOTION =
  "transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";
/* The labels' horizontal fade is `.tn-label-x` in `globals.css`: a soft-edged mask that sweeps
   in from the left on open and back out on close. Open, the mask moves over 240ms on the rail's own
   curve; closing, it is 160ms and ease-in, so the text is gone before the rail can clip it. */

/* `className` is here because `SD-208` passes `shrink-0`: a prop a caller sets and the type does
   not declare is a type error, not a convention. */
type Icon = ComponentType<{
  width?: number;
  height?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;
interface Item {
  label: string;
  href: string;
  icon: Icon;
  /** A path in `public/`, not a route. */
  external?: boolean;
}

const MAIN: readonly Item[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Themes", href: "/themes", icon: Palette },
  { label: "Frameworks", href: "/themes", icon: Code },
  { label: "Blocks", href: "/blocks", icon: Cube },
  { label: "Components", href: "/components", icon: Box },
  { label: "Pages", href: "/pages", icon: File },
  { label: "Dashboards", href: "/dashboards", icon: Dashboard },
  { label: "Layouts", href: "/layouts", icon: Layout },
  { label: "Applications", href: "/applications", icon: Rocket },
  { label: "Guides", href: "/guides", icon: Reader },
  { label: "Documentation", href: "/docs", icon: FileText, external: true },
];

const MORE: readonly Item[] = [
  { label: "Pricing", href: "/pricing", icon: Star },
  { label: "Downloads", href: "/download", icon: Download },
  { label: "Account", href: "/account", icon: Person },
];

const ROW = `${FONT} group relative flex w-full shrink-0 items-center gap-[10px] rounded-[8px] px-[13px] py-[8px] text-[length:var(--store-body-3)] leading-[1.5] transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none`;
const ROW_IDLE =
  "font-normal text-[var(--store-neutral-100)] hover:bg-white/70 focus-visible:bg-white/70";
/* The current page: a white pill lifted off the ground, the label in brand blue at 600. */
const ROW_ACTIVE =
  "bg-white font-semibold text-[var(--store-primary-40)] shadow-[0_1px_3px_#0c0c0c14,0_0_0_1px_#0058ee14]";

/** Pro screens that exist today, for the upgrade card. Counted, never typed. */
const PRO_SCREENS = ASSETS.filter((asset) => asset.tier === "pro").length;

/**
 * Which item the URL is on. **The first match wins**, because Themes and Frameworks share
 * `/themes` and two lit rows would say the reader is in two places. Home matches only itself, or
 * every page would light it.
 */
const activeOf = (items: readonly Item[], path: string): string | undefined =>
  items.find((item) =>
    item.href === "/" ? path === "/" : path === item.href || path.startsWith(`${item.href}/`),
  )?.label;

/**
 * An item's text. **Every label sweeps at the same moment**, left to right, rather than rippling
 * down the rail: the timing lives in `.tn-label-x` and is the same for all of them, so there is no
 * per-row index to pass.
 */
function Label({
  collapsed,
  children,
  grow = true,
  className = "",
}: {
  collapsed: boolean;
  children: string;
  className?: string;
  /**
   * **A growing label eats the free space, so `justify-center` has nothing left to centre.** Every
   * navigation row wants it, because the label should fill the row and truncate; the call to action
   * at the foot does not, and this is why its mark and word sat left of centre however many times
   * the button was told to centre them.
   */
  grow?: boolean;
}) {
  return (
    <span
      aria-hidden={collapsed}
      data-hidden={collapsed}
      className={`tn-label-x ${grow ? "grow text-start" : ""} truncate ${collapsed ? "pointer-events-none w-0" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

function RailItem({
  item,
  collapsed,
  index,
  active = false,
  accent = index,
}: {
  item: Item;
  collapsed: boolean;
  index: number;
  active?: boolean;
  /** Which of the five accents the icon takes. Defaults to the row's position. */
  accent?: number;
}) {
  const Glyph = item.icon;
  const body = (
    <>
      {/* **18.** The reference's markup says 24 and this was 24 for that reason, but its labels are
          14 and ours are 12: a 24px glyph beside 12px text is twice the height of the word it
          belongs to, which is what reads as unaligned however centred the row is (`SD-223`). At 18
          the glyph's box and the label's 1.5 line box are both 18px, so they share one centre line
          by construction rather than by eye. */}
      {/* **`shrink-0`, or the icon is what gives way** (`SD-208`). The row is a flex container and
          the label beside it is `whitespace-nowrap`, so the label cannot shrink and the glyph can:
          at 60px the icons were squeezed to nothing while an invisible label kept its width. The
          reference's own markup carries `class="shrink-0 nav-icon"` for exactly this. */}
      {/* The accent bar on the current page's row, in the rail's padding so it moves nothing. */}
      {active ? (
        <span
          aria-hidden="true"
          className="absolute -left-[8px] top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--tn-accent-blue-solid)] to-[var(--tn-accent-violet-solid)]"
        />
      ) : null}
      {/* Grey at rest, its own accent on hover and when current: `--row-accent` is set on the row
          from `ACCENTS`, so the class below is one literal Tailwind can see. */}
      <Glyph
        width={18}
        height={18}
        className={`shrink-0 transition-colors duration-150 ${active ? "text-[var(--row-accent)]" : "text-[var(--store-neutral-80)] group-hover:text-[var(--row-accent)]"}`}
        aria-hidden
      />
      <Label collapsed={collapsed}>
        {item.label}
      </Label>
    </>
  );
  const title = collapsed ? item.label : undefined;
  const className = `${ROW} ${active ? ROW_ACTIVE : ROW_IDLE}`;
  const style = {
    ["--row-accent" as string]: `var(--tn-accent-${accentAt(accent).name}-ink)`,
  };
  return item.external ? (
    <a href={item.href} className={className} title={title} style={style}>
      {body}
    </a>
  ) : (
    <Link
      href={item.href}
      className={className}
      title={title}
      style={style}
      aria-current={active ? "page" : undefined}
    >
      {body}
    </Link>
  );
}

/**
 * The break between the two groups: **a 1px rule in a fixed 24px slot, in both states**.
 *
 * The groups were headed "Browse" and "Account" until 2026-10-07; the names went by request and the
 * rule stayed, so the two lists still read as two. It is one element for both states: the slot
 * carries the rows' own 13px inset and the rule is `w-full` inside it, so it is 150px open and
 * exactly 18px (the icons' width, centred on the rail's 30) collapsed, and it follows the rail's
 * width transition with no swap and no state. The slot's height never changes, so nothing below it
 * moves on a toggle. `aria-hidden` because each `<nav>` already carries its own label.
 */
function Divider() {
  return (
    <div aria-hidden="true" className="flex h-[24px] shrink-0 items-center px-[13px]">
      <span className="h-px w-full bg-[var(--store-primary-30)]" />
    </div>
  );
}

export function Rail() {
  const [collapsed, setCollapsed] = useState(false);
  const path = usePathname() ?? "/";
  const activeMain = activeOf(MAIN, path);
  const activeMore = activeOf(MORE, path);

  return (
    <aside
      className={`sticky top-0 flex h-dvh shrink-0 flex-col overflow-clip bg-gradient-to-b from-[var(--store-primary-10)] via-[var(--store-primary-10)] to-[var(--tn-accent-violet-soft)] px-[8px] py-[16px] shadow-[inset_-1px_0_0_var(--store-primary-20)] ${RAIL_MOTION} ${collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}`}
    >
      {/*
       * **Collapsed, the brand slot is the toggle** (`SD-212`). The reference shows its square
       * mark at rest and swaps it for the expander on hover, so one 40px target does both jobs: it
       * says whose product this is, and it is the only way back. A separate button beside it would
       * need width the 60px rail does not have, which is why the reference does not have one
       * either.
       *
       * Expanded there are two controls, because there is room and because the wordmark should go
       * home rather than fold the rail.
       */}
      {/* **40px in both states** (2026-10-07). Collapsed, the row holds a 40px button; expanded, its
          tallest child is the 30px fold button, so the row was 30 and every item below it dropped
          10px on each collapse. Fixing the row at the larger of the two keeps the list still.

          **The mark sits at the same x in both states**: 12.767px in from the rail's padding in the
          wordmark link and in the collapsed button alike, which is 30 - 8 - 18.467 / 2, so the
          mark's centre is the rail's 30 open or shut. The collapsed button used to be `mx-auto`,
          and at the moment of the swap the rail is still 192px wide, so it appeared in the middle
          of the row and then slid left as the rail narrowed. Left-anchored, nothing moves; the
          hover glyph is `left-[13px]`, the same centre for an 18px box. */}
      <div className="flex h-[40px] shrink-0 items-center justify-between">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-expanded={false}
            aria-label="Expand the menu"
            className="group relative flex h-[40px] w-full shrink-0 cursor-pointer items-center justify-start rounded-[8px] pl-[12.767px] transition-colors duration-150 hover:bg-[var(--store-primary-20)]"
          >
            {/* Both states occupy the same cell, so nothing reflows on hover and the swap is a
                cross-fade rather than a jump. */}
            <span className="transition-opacity duration-150 group-hover:opacity-0 motion-reduce:transition-none">
              <VoiletWordmark size="rail" markOnly className={WORDMARK_BOX} />
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="absolute left-[13px] text-[var(--store-neutral-100)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none"
            >
              {/* The reference's own glyph: three rules and a chevron, pointing the way the rail
                  will move. */}
              <path
                d="M1.47 11.15h7.6M1.47 7.69H7M1.47 4.23h7.6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M10.6 4.6 13 7l-2.4 2.4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <>
            <Link
              href="/"
              aria-label="Voilet home"
              className="flex shrink-0 items-center pl-[12.767px]"
            >
              <VoiletWordmark size="rail" className={WORDMARK_BOX} />
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-expanded
              aria-label="Collapse the menu"
              className="flex shrink-0 cursor-pointer items-center rounded-[8px] px-[10px] py-[8px] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-20)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1.47 11.15h7.6M1.47 7.69H7M1.47 4.23h7.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M13 4.6 10.6 7 13 9.4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* **One column, one 2px rhythm** (2026-10-07): the rows and the divider between the two
          lists are all children of this column, so every step down the rail is 2px plus whatever
          sits in it, and the one break is the divider's fixed 24px slot. */}
      <div className="mt-[8px] flex flex-col gap-[2px]">
        <nav aria-label="Store" className="flex flex-col gap-[2px]">
          {MAIN.map((item, i) => (
            <RailItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              index={i}
              active={item.label === activeMain}
            />
          ))}
        </nav>
        <Divider />
        <nav aria-label="Account and pricing" className="flex flex-col gap-[2px]">
          {MORE.map((item, i) => (
            <RailItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              index={i}
              /* Offset so these three do not repeat the first three colours of the list above. */
              accent={i + 3}
              active={item.label === activeMore}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-[8px] pt-[12px]">
        {/* **The upgrade card**, expanded only: a 60px rail has no room for a sentence, and the
            button below it still says Upgrade there. The number is `PRO_SCREENS`, counted. */}
        {collapsed ? null : (
          <div className="relative overflow-hidden rounded-[12px] border border-white/60 bg-white/70 p-[12px] shadow-[0_4px_16px_-8px_#7c3aed40]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-[24px] -top-[24px] size-[80px] rounded-full bg-[var(--tn-accent-violet-solid)] opacity-20 blur-[24px]"
            />
            <p
              className={`${FONT} relative text-[length:var(--store-body-3)] font-semibold leading-[1.4] text-[var(--store-neutral-100)]`}
            >
              Unlock every screen
            </p>
            <p
              className={`${FONT} relative mt-[2px] text-[11px] leading-[1.45] text-[var(--store-neutral-80)]`}
            >
              {PRO_SCREENS} application screens come with Pro.
            </p>
          </div>
        )}
        <RailItem
          item={{ label: "Sign in", href: "/login", icon: Person }}
          collapsed={collapsed}
          index={0}
          accent={1}
        />
        {/* **`justify-center`, and this is the button the dev kept pointing at.** Every row above it
            is left-aligned because a rail is a list and a list aligns on one edge; this is not a
            row, it is the one call to action in the rail, and its mark and word belong in the
            middle of it. The icon and the label are sized with it, 18 and 14 against the 14 and 12
            they were, because a call to action set smaller than the navigation above it reads as a
            footnote (`SD-223`). */}
        <Link
          href="/pricing"
          title={collapsed ? "Upgrade" : undefined}
          className={`${FONT} inline-flex w-full shrink-0 cursor-pointer items-center justify-center ${collapsed ? "gap-0" : "gap-[6px]"} rounded-[8px] bg-gradient-to-r from-[var(--tn-accent-blue-solid)] to-[var(--tn-accent-violet-solid)] px-[12px] py-[8px] text-[length:var(--store-body-2)] font-semibold leading-none text-white shadow-[0_6px_16px_-6px_var(--tn-accent-violet-solid)] transition-[filter,transform] duration-150 hover:-translate-y-px hover:brightness-110 active:brightness-95`}
        >
          <Bolt width={18} height={18} aria-hidden className="shrink-0" />
          {/* `leading-[1.5]` on the word, not the button's `leading-none`: `truncate` clips to the line
              box, and at 14px tall the descenders of "p" and "g" lost 2px. A 21px box holds them. */}
          <Label collapsed={collapsed} grow={false} className="leading-[1.5]">
            Upgrade
          </Label>
        </Link>
      </div>
    </aside>
  );
}
