import { freeRepo } from "./free-distribution";

/**
 * The product matrix: a framework crossed with a CSS system (`SD-108`).
 *
 * **This is what is actually sold.** A buyer does not want "the React edition", they want React with
 * the CSS system their team already uses. Six frameworks times three CSS systems is eighteen
 * combinations, and the tier split is the dev's: **free is Tailwind only**, Pro is every cell.
 *
 * **Tailwind is the default and the others are ports of it**, not independent products. The tokens,
 * the page patterns and the component vocabulary are one design system; what changes is the class
 * vocabulary it renders through. That is why a Bootstrap cell is a port of the Tailwind cell beside
 * it rather than a separate edition with its own roadmap.
 *
 * ## Everything here is mocked, and one constant says so
 *
 * `MOCKED` is `true` and the storefront renders a banner while it is. The dev's instruction was
 * explicit: "Can we Mock the Data for now as we are not going to production. Let us assume that we
 * have built everything". That is a legitimate way to build a storefront before it is real, and it
 * is one flag away from being the exact failure this repository has removed four times in a day:
 * `SD-099`'s npm instructions for an unpublished package, `SD-103`'s component counts, `SD-106`'s
 * zero-price offer, `SD-107`'s Bootstrap claim.
 *
 * So the rule from `odin/build/DOCS.md` still holds and is satisfied differently: nothing here is passed
 * off as verified. **What is genuinely true today** is recorded in `odin/product/INVENTORY.md` § 11 and has
 * not been edited to match this file. Turning `MOCKED` off is what makes the storefront claim
 * something, and on that day every `built: false` cell below has to become true or leave.
 */
export const MOCKED = true;

/** The CSS vocabularies a combination can render through. Tailwind is the source, the rest are ports. */
export const CSS_SYSTEMS = [
  { id: "tailwind", label: "Tailwind CSS", isDefault: true },
  { id: "bootstrap", label: "Bootstrap", isDefault: false },
  { id: "bulma", label: "Bulma", isDefault: false },
] as const;

export type CssSystemId = (typeof CSS_SYSTEMS)[number]["id"];

/** The frameworks, in the order a buyer is likeliest to want them. */
export const FRAMEWORKS = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
  { id: "html", label: "HTML" },
  { id: "laravel", label: "Laravel" },
] as const;

export type FrameworkId = (typeof FRAMEWORKS)[number]["id"];

export interface Combination {
  /** `/products/react-tailwind`. Framework first, because that is what a buyer filters by. */
  readonly slug: string;
  readonly framework: FrameworkId;
  readonly frameworkLabel: string;
  readonly css: CssSystemId;
  readonly cssLabel: string;
  /** Free exists for Tailwind only. Every cell has a Pro. */
  readonly hasFree: boolean;
  /** Where the free edition is published, when there is one. */
  readonly freeRepo?: string;
  /**
   * Whether this cell exists outside the mock.
   *
   * **Six of eighteen are real**: the Tailwind row. `MOCKED` is what lets the other twelve render as
   * though they were, and this flag is what tells the truth underneath it, so the day the mock comes
   * off the storefront can drop exactly the cells that were never built rather than guessing.
   */
  readonly built: boolean;
  /** Whether the packer emits a Pro archive for this cell. */
  readonly hasPro: boolean;
}

/**
 * **What `scripts/bundle.mjs` actually emits, per framework** (`PD-1196`).
 *
 * `built` read `css.id === "tailwind"` and therefore claimed **six** cells, while the packer declares
 * four editions covering three frameworks and exactly one Pro archive. The storefront could show
 * React, Vue and Angular as built, take money for Pro, and have no artefact to send: the dev found it
 * by asking what happens when somebody downloads React.
 *
 * Declared here rather than derived, because the packer is a build script this app cannot import,
 * and **paired by a guard rather than by hope**: `check:inventory` reads `EDITIONS` out of
 * `scripts/bundle.mjs` and fails when the two disagree. That is `PD-1190`'s lesson applied before
 * the fact, one measurement in two places being the defect that keeps costing days.
 *
 * Every value here is `false` until an edition exists for it. **Adding a pack means changing this
 * line**, and the guard is what makes that non-optional.
 */
/**
 * **Which CSS systems the packer can actually emit** (`PD-1205`).
 *
 * `css.id === "tailwind"` was written three times below, which is one fact in three places. All
 * three CSS systems have an adapter, and that is what makes the other two look finished: those
 * adapters map this product's tokens onto Bootstrap's and Bulma's variables, and do not translate
 * the Tailwind utilities our own components render through (`PD-233`). `check:inventory` pairs this
 * with the packer's own list.
 */
const BUILT_CSS: readonly CssSystemId[] = ["tailwind"];

const PACKED: Record<FrameworkId, { free: boolean; pro: boolean }> = {
  html: { free: true, pro: true },
  nextjs: { free: true, pro: true },
  laravel: { free: true, pro: true },
  react: { free: true, pro: true },
  vue: { free: true, pro: true },
  angular: { free: true, pro: true },
};

/**
 * Eighteen cells, derived rather than typed.
 *
 * A hand-written list of eighteen is a list that disagrees with itself the first time a framework is
 * added, which is the fault `SD-103` recorded on this very file's neighbour.
 */
export const COMBINATIONS: readonly Combination[] = FRAMEWORKS.flatMap((framework) =>
  CSS_SYSTEMS.map((css) => ({
    slug: `${framework.id}-${css.id}`,
    framework: framework.id,
    frameworkLabel: framework.label,
    css: css.id,
    cssLabel: css.label,
    /*
      **Tailwind gates every tier, and the packer decides the rest** (`PD-1196`). Free is the Tailwind
      row by `SD-108`, and Bootstrap and Bulma have no pack at all, so a non-Tailwind cell is false
      in all three columns regardless of what the packer grows next.
    */
    hasFree: BUILT_CSS.includes(css.id) && PACKED[framework.id].free,
    hasPro: BUILT_CSS.includes(css.id) && PACKED[framework.id].pro,
    freeRepo:
      BUILT_CSS.includes(css.id) && PACKED[framework.id].free
        ? freeRepo(framework.id)?.repo
        : undefined,
    /* Deliverable in either tier. A cell with neither archive is not built, whatever it renders. */
    built: BUILT_CSS.includes(css.id) && (PACKED[framework.id].free || PACKED[framework.id].pro),
  })),
);

export const combinationBySlug = (slug: string): Combination | undefined =>
  COMBINATIONS.find((combination) => combination.slug === slug);

/** The six a visitor can have for nothing, which are the Tailwind row. */
export const FREE_COMBINATIONS = COMBINATIONS.filter((combination) => combination.hasFree);

/** Every cell, because Pro is the whole matrix. */
export const PRO_COMBINATIONS = COMBINATIONS;

/** What is real today, for anything that must not be mocked. */
export const BUILT_COMBINATIONS = COMBINATIONS.filter((combination) => combination.built);
