// Relative rather than `@/`: `apps/e2e` imports this module to derive its route list, and the
// alias only resolves inside this app's tsconfig.
import { SITE } from "../../lib/site";
/**
 * The product catalogue. **One config, five surfaces.**
 *
 * The Products nav, the product pages, the preview links, the pricing table and the FAQ all read
 * this. That is decision F2 in the website spec, and it exists for two reasons the dev stated:
 *
 *   1. "Our Product Name is VuiAdmin for now, later on, we might change." It changed on 2026-08-21, and the rename was the `BRAND`
 *      constant below, not a grep across forty files.
 *   2. Our products will eventually cover the same framework spread as TailAdmin. So every SKU we
 *      intend to sell is listed **now**, with a `status`, and the ones that do not exist yet render
 *      as waitlist. Adding Angular later is changing one word, not building a page.
 *
 * **`status` is a promise to the visitor, so it is not decoration.** There are exactly two states:
 * `available` may show a price and a buy button, and `waitlist` captures interest and takes no
 * money. A checkout for something we cannot deliver is a refund liability and, for a product whose
 * whole pitch is quality, the worst possible first impression.
 *
 * **`beta` was removed on 2026-08-17, and the reason is worth keeping.** A middle state reads as
 * "buyable with caveats", and it was being applied to editions whose package is **not on the npm
 * registry at all**. Hedging is what let a product page promise delivery we could not make. Either
 * someone can install it today or they cannot, and the honest word for the second one is waitlist.
 */

/** Change this one string to rename the product everywhere. */
/**
 * The product name. **VuiAdmin**, by the dev's ruling on 2026-08-22.
 *
 * It went `VuiAdmin` to `VuiAdmin` on 2026-08-21, from the v1.0 landing page, and back now with the
 * second design, whose every page, its `site` and its structured data all say `VuiAdmin`. §28 decision 1
 * is answered by the newer file.
 *
 * Both moves cost one line, which is the point of it living here.
 */
/**
 * The product name, from the one place that reads the environment.
 *
 * It was the literal `"VuiAdmin"` until 2026-08-22. That was harmless while `seo.ts` defined
 * `SITE.name` as `BRAND`, and stopped being harmless the moment `SITE.name` became
 * `NEXT_PUBLIC_SITE_NAME`: a build with that variable set would have shown one name in the header
 * and the title, and this one in the structured data on the same page.
 */
export const BRAND: string = SITE.name;

export type SkuStatus =
  /** Buyable today: a real package, published, that someone can install this minute. */
  | "available"
  /** Not buyable, whatever the reason. No price, no checkout, an email capture instead. The code
   *  may exist and be excellent; if it cannot be installed, this is the honest word. */
  | "waitlist";

export interface Sku {
  /** URL segment: `/products/<slug>`. Never change one after launch without a redirect. */
  slug: string;
  /** Framework or flavour, as a buyer says it. */
  framework: string;
  status: SkuStatus;
  /** One line under the name, the TailAdmin pattern: "Tailwind CSS Admin Dashboard for X". */
  tagline: string;
  /** The workspace package this SKU actually ships, or null when there is nothing behind it. */
  packageName: string | null;
  /** Where "Preview" goes. Null until a demo exists, which is its own feature. */
  previewUrl: string | null;
  /** Shown as a `New` badge, exactly as the reference site does. */
  isNew?: boolean;
  /** For `waitlist`: the honest sentence about why it is not buyable yet. */
  caveat?: string;
}

export const SKUS: readonly Sku[] = [
  {
    slug: "react",
    framework: "React",
    status: "available",
    tagline: `Tailwind CSS admin dashboard for React`,
    packageName: "@viliha/vui-react",
    // `apps/web/reactjs`: 50 screens of the real admin application, exported statically and copied
    // into this site's `public/` by its own build. It lands on the dashboard rather than the export's
    // root, because the root redirects to the documentation and a demo should open on the product.
    //
    // It runs with no server. `NEXT_PUBLIC_API_URL` is unset in this build, `AUTH_CONFIGURED` is
    // therefore false, and the screens fall back to their demo adapter, which is a property the app
    // already had for the published starter rather than something added for the storefront.
    previewUrl: "/preview/react/dashboard/",
  },
  {
    slug: "nextjs",
    framework: "Next.js",
    status: "available",
    tagline: `Tailwind CSS admin dashboard for Next.js`,
    packageName: "@viliha/vui-react",
    // The same demo, and pointing both rows at it is accurate rather than lazy: the export *is* a
    // Next.js App Router application, so it is simultaneously the honest demo of the React components
    // and of the Next.js starter built on them. Two SKUs, one artifact, because that is the truth of
    // what is built.
    previewUrl: "/preview/react/dashboard/",
  },
  {
    slug: "html",
    framework: "HTML",
    status: "waitlist",
    tagline: `Tailwind CSS admin dashboard for plain HTML`,
    packageName: "@viliha/vui-css",
    // Live since 2026-08-23 (`H-4`). It was `null` because there was no export, which was the honest
    // value: `PREVIEWS` filters on this field, so the dropdown simply had no HTML row rather than a
    // row that 404s.
    previewUrl: "/preview/html/",
    // Updated 2026-08-21, when this edition stopped being a stylesheet. Deliberately specific, because
    // a buyer comparing editions is owed the count rather than an adjective: 36 families ship as
    // copyable markup: 36 rendered from the React source, and 11 overlays as the native element for the
    // job wearing the same classes, because React builds those at runtime through a portal. 15 are data
    // driven and land with the page templates, and the rest are providers with no markup to ship.
    //
    // The page templates are 38 of 50 rather than all 50, and the shortfall is stated rather than
    // rounded up: three of those routes are client redirects with no content in their export, four bail
    // out of server rendering, and five ship a widget frozen mid-hydration. `dist/pages/manifest.json`
    // lists them. Review of the first version caught seven shells being counted as screens.
    //
    // **The denominator is the family count, not the module count.** `check:html` classifies all 82
    // modules under `packages/web/ui/react/src` because its job is that none is unaccounted for; only 78 of
    // them are component families, which is what `FAMILY_COUNT` derives and what this sentence must
    // divide by.
    //
    // **Every number in the caveat below is asserted against that source** by
    // `catalogue-counts.test.ts` (`SD-103`). Three of them were wrong when it was written: this
    // edition shipped 67 families while the page said 49, 44 page templates while it said 38, and 51
    // components rendered from source while it said thirty-seven. Understating the product by
    // eighteen families on the page that sells it is the same fault this file has now had three
    // times, and the previous two were also caught by a reader rather than by a check.
    caveat:
      "The design tokens and every component style are built, 71 of 86 component families ship as plain HTML you can copy, and 44 of the 50 admin screens ship as page templates extracted from the React application's own build. Fifty-three components are rendered from the React source so the markup matches exactly, and sixteen are overlays shipped as the native element for the job wearing the same classes. The package is not published yet.",
  },
  {
    slug: "vue",
    framework: "Vue.js",
    status: "waitlist",
    tagline: `Tailwind CSS admin dashboard for Vue.js`,
    packageName: "@viliha/vui-vue",
    // The first `previewUrl` in this file to be filled in, and the reason it can be is that the
    // screens are built into this site's own `public/` rather than hosted as a fifth app: a relative
    // path is correct in every environment, where a hardcoded host would be correct in none of them,
    // since every stage in `AGENT-ARCHITECTURE.md` is still a placeholder.
    //
    // The trailing slash matches every other route on this site, and the smoke test's internal-link
    // crawler follows this href from all 89 pages: without it, whether it resolves depends on the
    // host's directory-index behaviour.
    previewUrl: "/preview/vue/",
    // Corrected twice, and the second time is the interesting one. On 2026-08-14 this said the data
    // table was missing; it had already shipped. On 2026-08-20 it still said 21 of 67 while the
    // parity epic had closed at 65 of 68, so the storefront was understating the product by
    // forty-four families. The comment that has been here throughout is the reason it matters:
    // claiming less than we ship costs sales the same way claiming more costs trust.
    caveat:
      "81 of 86 component families are built, the record workflow, the calendar and both tables included. The two that are not are React-only by design: the Recharts wrapper, whose cross-framework replacement is the TanStack chart this edition does ship, and the sonner wrapper. The package is not published yet.",
  },
  {
    slug: "angular",
    framework: "Angular",
    status: "waitlist",
    tagline: `Tailwind CSS admin dashboard for Angular`,
    // `null` and "in design" until 2026-08-24, by which point the package existed with 65 of 68
    // families and a preview on :3004. A caveat that is out of date is worse than a blunt one: it is
    // the line a visitor reads to decide whether to wait, and it was telling them to wait for
    // something already built.
    packageName: "@viliha/vui-angular",
    previewUrl: "/preview/angular/",
    isNew: true,
    caveat:
      "Built: 75 of 86 component families, as standalone directives on Angular CDK. Not on npm yet, " +
      "so there is nothing to install this minute. Join the list and we will tell you the day it ships.",
  },
  {
    slug: "laravel",
    framework: "Laravel",
    status: "waitlist",
    tagline: `Tailwind CSS admin dashboard for Laravel`,
    packageName: "@viliha/vui-laravel",
    // No preview of its own, and it does not need one: the edition is Blade partials wrapping the
    // markup the HTML export already serves, so `/preview/html/` *is* what a Laravel buyer would be
    // looking at. Pointing at a second copy of the same page would be a maintenance cost with no
    // information in it.
    previewUrl: "/preview/html/",
    isNew: true,
    caveat:
      "Built: 61 Blade partials, generated from the React source, plus the stylesheet and the " +
      "behaviour script. Not on npm yet. Join the list and we will tell you the day it ships.",
  },
];

/** The everything bundle. Priced as one thing, so it is not an `Sku` with a slug of its own. */
export const BUNDLE = {
  slug: "bundle",
  name: "Get all together",
  tagline: `Every ${BRAND} edition in one licence, including the ones still to come`,
  /** Derived, never restated: the bundle is by definition all of them. */
  get includes(): string {
    return SKUS.map((s) => s.framework).join(", ");
  },
} as const;

export const skuBySlug = (slug: string): Sku | undefined => SKUS.find((s) => s.slug === slug);

/** Buyable SKUs. The only ones a pricing table or a checkout may offer. */
export const buyable = (): readonly Sku[] => SKUS.filter((s) => s.status !== "waitlist");

/** Display name for a SKU, so `VuiAdmin for Vue.js` is assembled in one place. */
export const skuName = (sku: Sku): string => `${BRAND} for ${sku.framework}`;

/**
 * The Live Preview panel's rows, derived from the SKUs above so the two cannot disagree.
 *
 * **Every edition appears**, which is what the dev asked for: "add to Live View all, which we
 * implement". An edition with no demo yet is shown rather than hidden, because a buyer comparing
 * frameworks needs to know it exists, and it is shown as text rather than as a link, because a link
 * that goes nowhere is worse than a sentence explaining itself.
 *
 * `caveat` is reused as that sentence rather than a second copy being written here: it is already the
 * honest one, it is already what the product page shows, and one string cannot drift from itself.
 */
export const LIVE_PREVIEW_ENTRIES = SKUS.map((sku) => {
  // An edition with nothing behind it says so once, as a pill.
  const status = sku.status === "waitlist" && !sku.packageName ? "In design" : undefined;
  /**
   * **The whole caveat, not its first sentence.** An earlier version took `caveat.split(". ")[0]`, and
   * both halves of that were wrong. The HTML row became "The design tokens and every component style
   * are built", which keeps the good news and discards "the package is not published yet, and there are
   * no page templates": the panel advertised the one edition that cannot be installed as done. And it
   * was punctuation-sensitive by construction, so a caveat containing "e.g. " would have been cut in a
   * different place. The row wraps, so there is no reason to trim it.
   */
  const reason = sku.previewUrl ? undefined : (sku.caveat ?? "No demo yet");
  return {
    framework: sku.framework,
    logo: (sku.slug === "nextjs" ? "nextjs" : sku.slug) as
      | "html"
      | "react"
      | "nextjs"
      | "vue"
      | "angular"
      | "laravel",
    href: sku.previewUrl ?? undefined,
    // Not both. Angular and Laravel print "In design" as the pill, and their caveat opens with the
    // same two words, so the row read "In design · In design. Join the list...". The pill wins and the
    // reason is dropped when it only repeats it.
    reason: status && reason?.startsWith(status) ? undefined : reason,
    status,
  };
});

/**
 * The stack strip in the hero: what the product is built on, then every edition it ships as.
 *
 * Derived from `SKUS`, so a seventh edition joins the strip without anyone editing it. Tailwind is
 * prepended by hand because it is the one thing here that is not an edition: it is what all six are
 * built with, and leading with it is the honest ordering.
 *
 * **Figma is deliberately absent**, and this is the place it would creep back in. §24.3 forbids
 * promising a design source we do not ship, and a logo in a strip like this reads as a promise.
 */
export const HERO_STACK: readonly { logo: string; label: string }[] = [
  { logo: "tailwind", label: "Tailwind" },
  ...SKUS.map((sku) => ({ logo: sku.slug, label: sku.framework })),
];
