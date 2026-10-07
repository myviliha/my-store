import { BRAND, SKUS, type Sku, skuName } from "./catalogue";
import type { FrameworkSlug, ProductTypeSlug } from "./taxonomy";

/**
 * The marketplace catalogue: every product, in the shape section 115 of the requirements asks for.
 *
 * **Derived from `catalogue.ts`, never a second copy of it.** The six framework editions are
 * still defined once, as SKUs, and this module widens them into marketplace records and adds the
 * four products that are not editions (three component libraries and the block library). Renaming
 * an edition or shipping Angular is still a one-line change in `catalogue.ts`.
 *
 * ## Two rules this file exists to enforce
 *
 * **Nothing here is invented.** Every count is countable in the repository, every version comes
 * from a published `package.json`, and a product type we do not sell has no product rather than a
 * plausible-looking one. Rules 5 to 8 of §122 forbid fabricated products, counts, ratings and
 * reviews, and a marketplace layout is designed to be filled, which is exactly what makes it
 * tempting.
 *
 * **A product has no price.** A licence is bought by *scope* (one framework edition, or every edition
 * available on the purchase date), not per product, so a card says whether a thing is free or licensed
 * and leaves the number to `pricing.ts`. Decision M4 in the spec: printing a price to fill the card
 * layout of §54 would be the fake pricing §27 forbids. This paragraph said "five annual subscription
 * tiers" until 2026-08-22, two price models out of date, which is what a comment costs when the thing it
 * describes moves twice.
 */

/**
 * How a product is paid for.
 *
 * Since `CR-MKT-006`, and §15.2 after it, the model is a one-time licence bought by scope, so a card
 * says either that a thing is free or that it is licensed. It is a union rather than a string
 * so that adding a third answer is a decision somebody makes on purpose.
 */
export type Inclusion = "Free" | "Licensed";

export interface ProductInclusion {
  /** "86 components", "12 pages". A counted fact, never a rounded claim, and it is the
   *  **family** count rather than the file count. See PRODUCT.md § Files against families. */
  value: string;
  label: string;
}

export interface Product {
  slug: string;
  name: string;
  /** One line, on a card and in `og:description`. */
  shortDescription: string;
  /** The paragraph on the product page. */
  description: string;
  /**
   * The meta description: under 155 characters, written for a search result.
   *
   * Not `shortDescription` (too terse for a result) and not `description` (too long, and it gets
   * cut mid-word). §41 wants one per page and means it.
   */
  seoDescription: string;
  productType: ProductTypeSlug;
  /** Same three states as a SKU: buyable, real but incomplete, or not built yet. */
  status: Sku["status"];
  inclusion: Inclusion;
  frameworks: FrameworkSlug[];
  tags: string[];
  /** Section 23 § Features. */
  features: string[];
  /** Section 23 § What's included. Counted. */
  included: ProductInclusion[];
  /** The workspace package behind it, which is also the honesty check: no package, no product. */
  packageName: string | null;
  version: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  /** Shown as a badge. Only states we can prove. */
  badges: string[];
  /** The honest sentence about why it is not buyable yet, for `waitlist`. */
  caveat?: string;
}

/**
 * Versions, read once from the packages this repo publishes.
 *
 * Hardcoded rather than imported: `apps/web/store` does not depend on `@viliha/vui-css`'s
 * internals, and a build-time `require` of a sibling `package.json` would make the marketing site
 * fail to build when a package moves. The trade is that these go stale, so they are stated in one
 * place and **checked by `pnpm check:products`**, which compares each entry against that package's
 * real version and fails `preflight` when they part. Until 2026-08-17 this comment said "checked at
 * release" and nothing checked it, which is the failure mode a comment is worst at preventing.
 *
 * Adding a key here means adding it to `VERSION_PACKAGES` in `scripts/check-products.mjs`, which is
 * deliberate: a version claim nobody can verify is the thing being prevented.
 */
/**
 * Exported so the header's version badge is the real number.
 *
 * The approved landing page shows `v1.0` beside the wordmark. Hard-coding that here would be a claim
 * with nothing behind it, and `check:products` already checks these against the workspace manifests, so
 * this is the one number in the repo that cannot quietly go stale.
 */
export const VERSIONS = {
  ui: "1.66.0",
  vue: "0.4.0",
  theme: "0.3.0",
  web: "0.2.0",
} as const;

/** Which SKU maps to which framework facet. The SKU's own `framework` field is a display name. */
const SKU_FRAMEWORKS: Record<string, FrameworkSlug[]> = {
  react: ["react", "tailwind"],
  nextjs: ["nextjs", "react", "tailwind"],
  html: ["html", "tailwind"],
  vue: ["vue", "tailwind"],
  angular: ["angular", "tailwind"],
  laravel: ["laravel", "tailwind"],
};

/** What every edition ships, stated once. Identical by construction is the whole product claim. */
const EDITION_FEATURES = [
  "Dashboard, tables, forms, settings and authentication screens",
  "Light and dark, both designed rather than inverted",
  "Responsive from 320px, with navigation and tables built for small screens",
  "Keyboard paths, focus order and landmarks in the component, not a later pass",
  "One token file: change a colour, radius or font in one place",
  "TypeScript source, not a compiled bundle",
];

const editionProduct = (sku: Sku): Product => ({
  slug: sku.slug,
  name: skuName(sku),
  shortDescription: sku.tagline,
  seoDescription: `${sku.tagline}. Navigation, tables, forms and settings screens, from the same design system as every other edition.`,
  description:
    sku.caveat ??
    `${skuName(sku)} is the complete admin application shell for ${sku.framework}: navigation, tables, forms and settings screens, built from the same design tokens as every other edition.`,
  productType: "admin-templates",
  status: sku.status,
  inclusion: "Licensed",
  frameworks: SKU_FRAMEWORKS[sku.slug] ?? ["tailwind"],
  tags: ["Admin", "Dashboard", "SaaS", sku.framework],
  features: EDITION_FEATURES,
  included:
    sku.status === "waitlist"
      ? []
      : [
          { value: "86", label: "components" },
          { value: "8", label: "field states" },
          { value: "1", label: "token file" },
          { value: "2", label: "themes" },
        ],
  packageName: sku.packageName,
  version:
    sku.packageName === "@viliha/vui-react"
      ? VERSIONS.ui
      : sku.packageName === "@viliha/vui-vue"
        ? VERSIONS.vue
        : sku.packageName === "@viliha/vui-css"
          ? VERSIONS.theme
          : null,
  demoUrl: sku.previewUrl,
  docsUrl: sku.status === "waitlist" ? null : "/docs",
  badges: [...(sku.isNew ? ["New"] : []), ...(sku.status === "waitlist" ? ["In design"] : [])],
  caveat: sku.caveat,
});

/** The products that are not framework editions. Four, and every number in them is countable. */
const LIBRARIES: readonly Product[] = [
  {
    slug: "components-react",
    name: `${BRAND} Components for React`,
    shortDescription: "86 React components, shipped as TypeScript source with no build step.",
    seoDescription:
      "86 React components as TypeScript source: dialogs, menus, selects, charts and a real data table. Free, with no build step in your app.",
    description:
      "The component library the admin templates are built from. Dialogs, menus, selects, tables, charts and the data table most libraries leave out. Shipped as source, so you read it, fork a component, and keep the tokens.",
    productType: "components",
    status: "available",
    inclusion: "Free",
    frameworks: ["react", "nextjs", "tailwind"],
    tags: ["Components", "React", "TypeScript", "Tailwind"],
    features: [
      "A real data table: sorting, filtering, column control, import and export",
      "Dialogs, menus, selects and popovers built on Radix primitives",
      "Every field state designed: default, focus, filled, error, success, disabled, loading, required",
      "Light and dark from one token file",
      "TypeScript source, no build step in your app",
    ],
    included: [
      { value: "86", label: "components" },
      { value: "0", label: "runtime dependencies added" },
      { value: "1", label: "token file" },
    ],
    packageName: "@viliha/vui-react",
    version: VERSIONS.ui,
    demoUrl: null,
    docsUrl: "/docs/components",
    badges: ["Free"],
  },
  {
    slug: "components-vue",
    name: `${BRAND} Components for Vue`,
    shortDescription: "65 Vue 3 components, rendering the same markup as the React library.",
    seoDescription:
      "65 Vue 3 components on Reka UI, rendering the same markup as the React library because both read one shared class-variant source. Free.",
    description:
      "Not a lookalike port. The class strings live in one shared module that both the React and the Vue components import, and a render test compares the two, so the Vue edition is the same product rather than a similar one.",
    productType: "components",
    status: "waitlist",
    inclusion: "Free",
    frameworks: ["vue", "tailwind"],
    tags: ["Components", "Vue", "Reka UI", "Tailwind"],
    features: [
      "Built on Reka UI, the Radix port for Vue",
      "Class strings shared with React, so the markup matches by construction",
      "The whole record workflow: the Pro table, the form, the profile page",
      "Light and dark from the same token file as every other edition",
    ],
    included: [
      // The family count, not the file count, because the two packages file things differently and
      // only one of those numbers survives someone checking it. `odin/product/PRODUCT.md` explains the
      // one-family offset between this figure and the parity spec's.
      { value: "65", label: "component families" },
      { value: "1", label: "shared class-variant source" },
    ],
    packageName: "@viliha/vui-vue",
    version: VERSIONS.vue,
    demoUrl: null,
    docsUrl: "/docs/frameworks",
    badges: ["Not published yet"],
    caveat:
      "81 of 86 component families are built, the record workflow, the calendar and both tables included. The two that are not are React-only by design: the Recharts wrapper, replaced here by the TanStack chart, and the sonner wrapper. Not on npm yet.",
  },
  {
    slug: "components-css",
    name: `${BRAND} CSS`,
    shortDescription:
      "The whole design system as plain CSS, with no framework and no dependencies.",
    seoDescription:
      "The whole design system as one stylesheet, with no framework and no dependencies. Works with Laravel, Rails, Django or no framework at all.",
    description:
      "The same tokens and component styles as the React library, compiled to a stylesheet you can drop into anything: Laravel, Rails, Django, a static site, or a framework we have never heard of. Two rules keep it neutral, and they are tested.",
    productType: "components",
    status: "available",
    inclusion: "Free",
    frameworks: ["html", "tailwind"],
    tags: ["CSS", "HTML", "Framework-free", "Tailwind"],
    features: [
      "One stylesheet, no JavaScript and no dependencies",
      "Generated from the same token source as the React library, so it cannot drift",
      "Works with any templating language or none",
      "Light and dark through one class on the root element",
    ],
    included: [
      { value: "1", label: "stylesheet" },
      { value: "0", label: "dependencies" },
    ],
    packageName: "@viliha/vui-css",
    version: VERSIONS.theme,
    demoUrl: null,
    docsUrl: "/docs/installation",
    badges: ["Free"],
  },
  {
    slug: "marketing-blocks",
    name: `${BRAND} Blocks`,
    shortDescription: "58 marketing page sections: hero, pricing, testimonials, FAQ, footer.",
    seoDescription:
      "58 marketing page sections: hero, features, pricing, testimonials, FAQ and footer. Content as props, server rendered, and this site is built from them.",
    description:
      "Page sections that take their content as props, so building a page is filling in data rather than writing markup. This website is built from them, which is the demo: what you see is what you get.",
    productType: "blocks",
    status: "available",
    inclusion: "Licensed",
    frameworks: ["react", "nextjs", "tailwind"],
    tags: ["Blocks", "Marketing", "React", "Tailwind"],
    features: [
      "Hero, features, pricing, testimonials, FAQ, article, footer and more",
      "Server components, so a page ships no JavaScript unless it asks for it",
      "Content as props, so a page is data and a rewrite is a diff in one file",
      "The same tokens as the dashboards, so the site and the product match",
    ],
    included: [
      { value: "69", label: "blocks" },
      { value: "0 KB", label: "JavaScript on this page" },
    ],
    packageName: "@viliha/vui-blocks",
    version: VERSIONS.web,
    demoUrl: "/",
    docsUrl: "/docs/blocks",
    badges: [],
  },
];

export const PRODUCTS: readonly Product[] = [...SKUS.map(editionProduct), ...LIBRARIES];

/**
 * The catalogue, which is the editions and nothing else (`SD-019`, `SD-021`).
 *
 * Components and blocks stopped being products on 2026-08-22: they are inventory a visitor looks at,
 * they carry no price, and `/components` and `/blocks` show them. `PRODUCTS` still holds all ten
 * because the libraries remain real things with versions and packages; what changed is that only six
 * of them are for sale, and `/products` lists those six.
 */
export const EDITIONS: readonly Product[] = SKUS.map(editionProduct);

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const productsOfType = (type: ProductTypeSlug): readonly Product[] =>
  PRODUCTS.filter((p) => p.productType === type);

export const countOfType = (type: ProductTypeSlug): number => productsOfType(type).length;

/** The frameworks a type actually has products in. This is what generates the facet pages. */
export const frameworksOfType = (type: ProductTypeSlug): FrameworkSlug[] => {
  const seen = new Set<FrameworkSlug>();
  for (const p of productsOfType(type)) for (const f of p.frameworks) seen.add(f);
  return [...seen];
};

export const productsOfTypeAndFramework = (
  type: ProductTypeSlug,
  fw: FrameworkSlug,
): readonly Product[] => productsOfType(type).filter((p) => p.frameworks.includes(fw));

export const productsOfFramework = (fw: FrameworkSlug): readonly Product[] =>
  PRODUCTS.filter((p) => p.frameworks.includes(fw));

/**
 * Related products, rule-based as §67 allows: same type first, then same framework.
 *
 * Deliberately not "customers also bought", which needs customers.
 */
export const relatedTo = (product: Product, limit = 3): readonly Product[] => {
  const sameType = productsOfType(product.productType).filter((p) => p.slug !== product.slug);
  const sameFramework = PRODUCTS.filter(
    (p) =>
      p.slug !== product.slug &&
      p.productType !== product.productType &&
      p.frameworks.some((f) => product.frameworks.includes(f)),
  );
  return [...sameType, ...sameFramework].slice(0, limit);
};

/** Buyable, in the sense the storefront already uses: never offer what we cannot deliver. */
export const isOffered = (p: Product): boolean => p.status !== "waitlist";

/**
 * What the version chip in the header opens.
 *
 * Every published package and the version it ships at, so a visitor can see what is current without
 * leaving the page. Derived from `VERSIONS`, which `check:products` already holds to the workspace
 * manifests, so nothing here can claim a release that was never cut.
 *
 * **Not a version switcher.** TailAdmin's chip moves between major versions of their template, and
 * doing the same would need versioned docs and versioned downloads, neither of which exists. This
 * discloses rather than switches, and the full history is one link away.
 */
export const VERSION_MENU = {
  current: VERSIONS.ui,
  packages: [
    { name: "@viliha/vui-react", label: "React components", version: VERSIONS.ui },
    { name: "@viliha/vui-vue", label: "Vue components", version: VERSIONS.vue },
    { name: "@viliha/vui-css", label: "Plain CSS theme", version: VERSIONS.theme },
    { name: "@viliha/vui-blocks", label: "Marketing blocks", version: VERSIONS.web },
  ],
  changelogHref: "/docs/changelog",
} as const;

/**
 * The scrolling strip under the hero: what the product is **built on**.
 *
 * Not "trusted by". The reference runs customer logos there and we have no customers, so borrowing
 * that shape would be fabricated social proof, which is a worse lie than a made-up star count: it
 * names other companies. This says something true instead, and it is checkable.
 *
 * Every `pkg` is a real dependency of `@viliha/vui-react` or `@viliha/vui-vue`, and `built-with.test.ts`
 * fails if one stops being one. A list of impressive names nobody verified is how a marketing page
 * ends up advertising a library the product dropped two releases ago.
 */
export const BUILT_WITH: readonly { label: string; pkg: string }[] = [
  { label: "Radix UI", pkg: "radix-ui" },
  { label: "Recharts", pkg: "recharts" },
  { label: "React Hook Form", pkg: "react-hook-form" },
  { label: "TanStack Charts", pkg: "@tanstack/charts" },
  { label: "Lucide", pkg: "lucide-react" },
  { label: "cmdk", pkg: "cmdk" },
  { label: "Sonner", pkg: "sonner" },
  { label: "React Day Picker", pkg: "react-day-picker" },
  { label: "Class Variance Authority", pkg: "class-variance-authority" },
  { label: "Tailwind Merge", pkg: "tailwind-merge" },
];

/**
 * The per-edition page copy, following the reference's `/vue`, `/angular` and the rest (`SD-055`).
 *
 * Generated from the SKU rather than written six times: the reference's pages differ only by the
 * framework's name, and six hand-written copies of one paragraph is six places for a stale sentence
 * to hide. What is genuinely per-edition, the tagline and the caveat, already lives on the SKU.
 */
export const editionPage = (sku: Sku) => {
  const on = sku.framework;
  const available = sku.status !== "waitlist";
  return {
    badge: available
      ? `Tailwind CSS dashboard kit for ${on}`
      : `Tailwind CSS dashboard kit, ${on} in build`,
    /**
     * The `<title>`, and therefore what a search result and a shared link claim.
     *
     * **Branches on availability, and must keep branching.** It read `"${on} Tailwind CSS admin
     * dashboard template"` for every edition until review caught it: four of the six are on the
     * waitlist, so a crawler was told there is a Laravel template on a page whose own body says the
     * Laravel edition is not built yet. That is `SD-032`, inventing a product, committed in the one
     * field a reader sees before they reach the page.
     */
    title: available
      ? `${on} Tailwind CSS Admin Dashboard Template`
      : `${on} Tailwind CSS Admin Dashboard Template, in Build`,
    lead: available
      ? `${BRAND} for ${on} is an admin dashboard built on ${on} and Tailwind CSS, with the components, elements and pages needed to ship a data-heavy back office rather than a demo. The same screens as every other edition, rendered natively by ${on}.`
      : `${BRAND} for ${on} is in build. The design, the screens and the component set are settled and shared with every other edition; what is left is rendering them natively in ${on}. ${sku.caveat ?? ""}`.trim(),
    /** The stack chips under the lead. Tailwind, then the edition, then what it builds with. */
    stack: ["tailwind", sku.slug],
    features: [
      {
        title: `Tailwind CSS and ${on}`,
        body: `Tailwind v4 and one token file underneath, so a change to a variable reaches every ${on} screen at once.`,
      },
      {
        title: `${on} UI Components`,
        body: `The component set as native ${on}, not a wrapper around another framework's output.`,
      },
      {
        title: "One Dashboard, Every Framework",
        body: `The same screens as the other editions, from one source of truth, so a team on ${on} and a team on React are looking at one product.`,
      },
      {
        title: "Easy to Customise",
        body: "Tokens first, then props, then fork the component. You have the source either way.",
      },
    ],
  } as const;
};
