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
} from "@viliha/vui-react/icons";
import Link from "next/link";
import { type ComponentType, useState } from "react";

import { FONT } from "./type";

/**
 * The left rail: 350px open, 60px collapsed, down every page with the top bar to its
 * right (the layout puts it in a flex row beside the page column).
 *
 * **Colours are ours, not the reference's three literals** (`SD-204`): ground `--store-primary-10`,
 * hover and active `--store-primary-20`, active label `--store-primary-40`.
 *
 * **The collapsed width is 60px, and it is derived, not copied** (`SD-205`'s rule, as in
 * `../../voilet/_components/sidebar.tsx`). An icon's centre is rail padding + item padding + half the
 * icon: **12 + 9 + 9 = 30**. The collapsed rail is twice that, 60, so the icons stay exactly where
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
 * **60px, and the arithmetic has to agree with it** (`SD-207`). A 24px glyph sits at 8px of rail
 * padding plus 10px of item padding, so its centre is 30 and twice 30 is 60: the reference's own
 * mini width, reached from the paddings rather than copied. At the previous 12 and 11 the centre was
 * 35 and the icons would have slid 5px on every collapse.
 */
const RAIL_COLLAPSED = "w-[60px]";
const RAIL_MOTION =
  "transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";
const LABEL_MOTION =
  "transition-[opacity,transform] duration-[160ms] ease-out motion-reduce:transition-none";

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

const ROW = `${FONT} flex w-full shrink-0 items-center gap-[10px] rounded-[8px] px-[9px] py-[8px] text-[length:var(--store-body-3)] font-normal leading-[1.5] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-primary-20)] focus-visible:bg-[var(--store-primary-20)] focus-visible:outline-none`;

function Label({
  collapsed,
  index,
  children,
  grow = true,
}: {
  collapsed: boolean;
  index: number;
  children: string;
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
      className={`${LABEL_MOTION} ${grow ? "grow text-start" : ""} truncate ${collapsed ? "pointer-events-none w-0 -translate-x-1 opacity-0" : "translate-x-0 opacity-100"}`}
      style={{ transitionDelay: collapsed ? "0ms" : `${60 + index * 20}ms` }}
    >
      {children}
    </span>
  );
}

function RailItem({ item, collapsed, index }: { item: Item; collapsed: boolean; index: number }) {
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
      <Glyph width={18} height={18} className="shrink-0" aria-hidden />
      <Label collapsed={collapsed} index={index}>
        {item.label}
      </Label>
    </>
  );
  const title = collapsed ? item.label : undefined;
  return item.external ? (
    <a href={item.href} className={ROW} title={title}>
      {body}
    </a>
  ) : (
    <Link href={item.href} className={ROW} title={title}>
      {body}
    </Link>
  );
}

export function Rail() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-clip bg-[var(--store-primary-10)] px-[8px] py-[16px] ${RAIL_MOTION} ${collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}`}
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
      <div className="flex items-center justify-between">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-expanded={false}
            aria-label="Expand the menu"
            className="group relative flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 hover:bg-[var(--store-primary-20)]"
          >
            {/* Both states occupy the same cell, so nothing reflows on hover and the swap is a
                cross-fade rather than a jump. */}
            <span className="transition-opacity duration-150 group-hover:opacity-0 motion-reduce:transition-none">
              <VoiletWordmark size="2xs" markOnly />
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="absolute text-[var(--store-neutral-100)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none"
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
              className="flex shrink-0 items-center pl-[10px]"
            >
              <VoiletWordmark size="2xs" />
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

      <nav aria-label="Store" className="mt-[8px] flex flex-col gap-[1px]">
        {MAIN.map((item, i) => (
          <RailItem key={item.label} item={item} collapsed={collapsed} index={i} />
        ))}
      </nav>
      <hr className="my-[8px] border-t border-[var(--store-primary-20)]" />
      <nav aria-label="Account and pricing" className="flex flex-col gap-[1px]">
        {MORE.map((item, i) => (
          <RailItem key={item.label} item={item} collapsed={collapsed} index={i} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-[8px] pt-[12px]">
        <RailItem
          item={{ label: "Sign in", href: "/login", icon: Person }}
          collapsed={collapsed}
          index={0}
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
          className={`${FONT} flex h-[30px] w-full items-center justify-center gap-[6px] rounded-[8px] bg-[var(--store-primary-40)] px-[12px] text-[length:var(--store-body-2)] font-semibold leading-none text-white transition-colors duration-150 hover:bg-[var(--store-primary-50)] active:bg-[var(--store-primary-60)]`}
        >
          <Bolt width={18} height={18} aria-hidden className="shrink-0" />
          <Label collapsed={collapsed} index={1} grow={false}>
            Upgrade
          </Label>
        </Link>
      </div>
    </aside>
  );
}
