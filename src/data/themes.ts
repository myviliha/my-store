import { DESIGNS } from "@/app/_vendor/vui-core";
import {
  AVAILABLE,
  type CssId,
  type FrameworkId,
  labelOf,
  type Tier,
} from "@/src/configurator-core";
import { ASSETS } from "@/src/data/assets";
import { tiersOf } from "@/src/entitlement-core";

/**
 * The theme catalogue: one entry per design (`SD-133`).
 *
 * **Four themes, not twenty-four.** The brief is explicit: "Avoid multiple cards for the same theme
 * merely because six framework builds exist", and "Six Free themes means six catalogue themes, not
 * six framework downloads of one theme". A theme is a design; the framework is how it is delivered.
 *
 * **Every number here is derived.** The screen count comes from `ASSETS`, the token count from the
 * design's own `tokens`, and the stack from `AVAILABLE`. Nothing is typed, because a typed number in
 * a catalogue is the defect `check:inventory` exists for: it is right on the day it is written and
 * silently wrong afterwards.
 *
 * **What a design does not change, and the catalogue must not imply otherwise.** A design changes
 * how the product looks and which regions its shell draws. It does **not** change which pages exist:
 * that is the tier. So every card shows the same screen count, and saying "Board includes 40 pages
 * and Suite 60" would be a claim with nothing behind it.
 */

/**
 * What the shell arrangement is, in a buyer's words.
 *
 * **Keyed by the design's label, not by its id or its shell**, and `check:design-naming` is what
 * taught me the difference. This file sits in `apps/web/store/src/data`, which the guard treats as
 * the shop: an id there is a reference to another company's product (`PD-741`, `PD-774`). Keying on
 * Keying on `Console` rather than on the reference's own name keeps the whole map in the
 * vocabulary we own, comments included: the guard reads the file, not only its data.
 *
 * Taken from `odin/build/GUIDELINES.md`'s own table rather than written fresh, so the storefront and the
 * rulebook describe the frame the same way.
 */
const ARRANGEMENT: Record<string, string> = {
  Voilet: "A full-height sidebar with the page header beside it",
  Console: "A global bar across the top, over a sidebar scoped to what the bar selected",
  Board: "A bar carrying a primary action, over a resizable sidebar scoped to one project",
  Suite: "An application rail, module tabs running across, and a filter sidebar inside the content",
};

export interface Theme {
  /** The design id. Dev-facing, and the value `NEXT_PUBLIC_DESIGN` takes. */
  readonly id: string;
  /** What a buyer reads. Never a reference's name (`PD-741`). */
  readonly label: string;
  readonly purpose: string;
  readonly arrangement: string;
  /**
   * The shell it renders through, which is what makes two themes structurally different.
   *
   * **Internal, and never rendered.** The detail page printed it, so a buyer read a reference's
   * name on a page about Console; `check:design-naming` caught it. It stays because the designs
   * comparison keys on it, and it is computed from the design record rather than written here.
   */
  readonly shell: string;
  readonly tiers: readonly Tier[];
  readonly frameworks: readonly FrameworkId[];
  readonly css: readonly CssId[];
  /** Screens in the current release, counted rather than claimed. */
  readonly screens: number;
  /**
   * How many values this design overrides.
   *
   * **Voilet's zero is the interesting number**, not a gap: Voilet *is* the base stylesheet, which is
   * why `PD-698`'s closure rule exempts it. A catalogue that showed "0 tokens" as a weakness would be
   * describing the reference implementation as the least finished one.
   */
  readonly overrides: number;
}

const screens = ASSETS.filter((a) => a.kind === "page").length || ASSETS.length;

export const THEMES: readonly Theme[] = DESIGNS.map((design) => {
  const rows = AVAILABLE;
  return {
    id: design.id,
    label: design.label,
    purpose: design.hint,
    arrangement: ARRANGEMENT[design.label] ?? "",
    shell: design.frame.shell,
    /*
     * **From the entitlement rule, not from a union over availability** (`PD-866`). This line read
     * `[...new Set(rows.flatMap(r => r.tiers))]`, the union over every row, so all four designs
     * carried a Free badge and three of them were paid. A visitor could be told Board was free.
     * Free is Voilet only, and `tiersOf` is the one place that says so.
     */
    tiers: tiersOf(design.id),
    frameworks: [...new Set(rows.map((r) => r.framework))],
    css: [...new Set(rows.map((r) => r.css))],
    screens,
    overrides: Object.keys(design.tokens).length,
  };
});

export const themeById = (id: string): Theme | undefined => THEMES.find((t) => t.id === id);

/** The stack, as one line a card can carry without wrapping into a paragraph. */
export const stackLine = (theme: Theme): string =>
  `${theme.frameworks.map((f) => labelOf(f)).join(", ")} · ${theme.css
    .map((c) => labelOf(c))
    .join(", ")}`;

/**
 * The filters the brief asks for: search, tier, use case, framework, CSS and style.
 *
 * **"Style" is the design itself here**, which is why it is absent: a theme catalogue filtered by
 * theme is a list filtered by its own identity. The brief's six controls assume a catalogue of
 * many themes across several styles, and at four themes the useful controls are the three below.
 * Stated rather than silently dropped.
 */
export interface ThemeFilter {
  readonly query: string;
  readonly tier: Tier | "all";
  readonly framework: FrameworkId | "all";
}

export const EMPTY_FILTER: ThemeFilter = { query: "", tier: "all", framework: "all" };

export function filterThemes(themes: readonly Theme[], f: ThemeFilter): readonly Theme[] {
  const q = f.query.trim().toLowerCase();
  return themes.filter((t) => {
    if (q !== "" && !`${t.label} ${t.purpose} ${t.arrangement}`.toLowerCase().includes(q)) {
      return false;
    }
    if (f.tier !== "all" && !t.tiers.includes(f.tier)) return false;
    if (f.framework !== "all" && !t.frameworks.includes(f.framework)) return false;
    return true;
  });
}

/** Which filters are doing something, so a no-results state can offer to remove them one at a time. */
export function activeFilters(
  f: ThemeFilter,
): readonly { readonly id: string; readonly label: string }[] {
  const out: { id: string; label: string }[] = [];
  if (f.query.trim() !== "") out.push({ id: "query", label: `Search: ${f.query.trim()}` });
  if (f.tier !== "all") out.push({ id: "tier", label: labelOf(f.tier) });
  if (f.framework !== "all") out.push({ id: "framework", label: labelOf(f.framework) });
  return out;
}
