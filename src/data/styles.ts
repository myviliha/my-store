import { COMBINATIONS, CSS_SYSTEMS, MOCKED } from "./combinations";
import { BOOTSTRAP_OVERRIDE, BULMA_OVERRIDE, TAILWIND_OVERRIDE } from "./style-examples";

/**
 * The three CSS vocabularies, as pages (`SD-115`, the blueprint's § 9).
 *
 * **The blueprint gates these pages rather than assuming them**: "create /styles/tailwind/,
 * /styles/bootstrap/ or /styles/bulma/ only when each has enough distinct verified implementation
 * material", and "do not assume six frameworks times three CSS systems means eighteen shipped
 * packages". Tailwind has that material because it is what this product is written in. The other two
 * do not, and the dev's instruction is to build the storefront as though every product were
 * finished, so they carry `verified: false` and the same `MOCKED` switch `SD-108` established.
 *
 * **The distinction is recorded rather than blurred.** `verified` says whether the facts on the page
 * were read off a real build; `MOCKED` says whether the storefront is currently presenting the
 * unfinished ones as finished. When the mock comes off, an unverified style page is the thing to
 * withhold, and nobody has to work out which by hand.
 *
 * Every version and every dependency below is read off a real file for Tailwind (`pro-react`'s
 * `package.json`) and marked as pending for the other two, because § 9 says to "omit or resolve
 * unknowns; never print blanket compatibility ticks".
 */
export interface StylePage {
  readonly id: string;
  readonly label: string;
  /** Read off a real build, rather than assumed for the storefront. */
  readonly verified: boolean;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly lead: string;
  /** The exact version this product is built against, when there is one. */
  readonly version: string;
  /** What a buyer has to run or install for this vocabulary to work. */
  readonly build: readonly string[];
  /** What the interactive components depend on beyond the stylesheet. */
  readonly interaction: string;
  /** One real customization, as the shortest thing that works. */
  readonly customize: { readonly file: string; readonly code: string };
}

export const STYLE_PAGES: readonly StylePage[] = [
  {
    id: "tailwind",
    label: "Tailwind CSS",
    verified: true,
    seoTitle: "Tailwind CSS Admin Dashboard Build",
    seoDescription:
      "How the Tailwind CSS build of VuiAdmin works: the exact version, the token layer every component reads, what the build needs, and what the interactive components depend on.",
    lead: "Tailwind is the source rather than one of three ports. Every class string in the product is written here first, and the Bootstrap and Bulma editions are generated from it, which is why a class you look up in the documentation means the same thing in all three.",
    version: "4.3",
    build: [
      "`@tailwindcss/postcss` in your PostCSS config. There is no `tailwind.config.js`: v4 configures in CSS.",
      "An `@source` line pointing at the components, or every class they use is treated as unused and stripped.",
      "Nothing else. No plugin, no preset, no PostCSS chain beyond Tailwind's own.",
    ],
    interaction:
      "Radix UI for the components that need behaviour: dialogs, menus, selects, popovers, tabs. The stylesheet alone draws them; Radix is what makes them keyboard-accessible and focus-managed.",
    customize: { file: "app/globals.css", code: TAILWIND_OVERRIDE },
  },
  {
    id: "bootstrap",
    label: "Bootstrap",
    verified: false,
    seoTitle: "Bootstrap Admin Dashboard Build",
    seoDescription:
      "How the Bootstrap build of VuiAdmin works: the token layer, what the build needs, and what the interactive components depend on.",
    lead: "The same screens and the same component families, rendered through Bootstrap's utilities and components rather than Tailwind's. The token layer is unchanged, so theming works the same way.",
    version: "pending",
    build: [
      "Bootstrap's own stylesheet, plus the VuiAdmin token layer imported after it.",
      "No build step beyond what Bootstrap already needs.",
    ],
    interaction: "Bootstrap's own JavaScript for dropdowns, modals and tooltips.",
    customize: { file: "app/globals.css", code: BOOTSTRAP_OVERRIDE },
  },
  {
    id: "bulma",
    label: "Bulma",
    verified: false,
    seoTitle: "Bulma Admin Dashboard Build",
    seoDescription:
      "How the Bulma build of VuiAdmin works: the token layer, what the build needs, and what the interactive components depend on.",
    lead: "The same screens and the same component families, rendered through Bulma's classes. Bulma ships no JavaScript, so the interactive components carry their own.",
    version: "pending",
    build: [
      "Bulma's stylesheet, plus the VuiAdmin token layer imported after it.",
      "A Sass step only if you are overriding Bulma's own variables rather than ours.",
    ],
    interaction:
      "Bulma is CSS only, so the dialogs, menus and selects bring their own behaviour rather than borrowing the framework's.",
    customize: { file: "app/globals.css", code: BULMA_OVERRIDE },
  },
];

export const styleBySlug = (slug: string): StylePage | undefined =>
  STYLE_PAGES.find((style) => style.id === slug);

/** The editions a style is available in, derived from the same matrix the product pages render. */
export const editionsForStyle = (styleId: string) =>
  COMBINATIONS.filter((c) => c.css === styleId && (MOCKED || c.built));

/** Every style has a page; the guard is that every style in the matrix has one and no more. */
export const STYLE_IDS = CSS_SYSTEMS.map((s) => s.id);
