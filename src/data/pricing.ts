import { BRAND, SKUS, type Sku } from "./catalogue";

/**
 * The commercial model: **one-time lifetime licences, priced per framework**.
 *
 * Confirmed by the dev on 2026-08-14, and it replaces both of the models this site has carried:
 * the five annual subscription tiers, and the copy specification's four plans. Recorded as
 * `CR-MKT-006`, and it answers `Q-MKT-04`.
 *
 * ## What changed, and why it touches more than one page
 *
 * A subscription and a lifetime licence disagree about almost every sentence a storefront writes.
 * "You keep every version released while you were subscribed" becomes "you keep it", "seats" stop
 * being per year, and "cancel any time" stops meaning anything. So the FAQ, the licence page, the
 * documentation and the product cards all moved with the price list rather than being left to
 * contradict it, which is the real cost of a pricing change and the reason it is worth doing in
 * one pass.
 *
 * ## Two rules this file enforces
 *
 * **The prices are the dev's, and there is no strikethrough.** The reference design shows a sale
 * price beside a struck-through original. Ours has no sale, and a permanent "was $199" is the
 * fake urgency §78 forbids. `wasPrice` exists in the block for a real sale with an end date.
 *
 * **A framework we cannot deliver has no price.** Angular and Laravel are `waitlist` in the
 * catalogue, so their tab shows the waitlist state instead of a buy button. That rule has held
 * since the first catalogue and a pricing page is exactly where it would quietly stop being true.
 */

export interface LicenceTier {
  slug: "one-edition" | "all-editions";
  name: string;
  badge?: string;
  price: string;
  cadence: string;
  description: string;
  featured?: boolean;
  /** What the licence covers: the selected edition, or every edition available on the purchase date. */
  scope: string;
  /** How long updates, hosted configuration and regeneration are included. */
  included: string;
  /** Whether the redistribution licence is part of this card. It never is: it is sales-assisted. */
  redistribution: boolean;
}

/** The three licences. Identical across frameworks: what differs is which framework you get. */
/**
 * **Two cards, `$49` and `$99`, from the pricing strategy in `odin/product/PRODUCT.md`.**
 *
 * This replaces the `$99 / $299 / $599` per-framework matrix the dev confirmed on 2026-08-14. That
 * confirmation is superseded, not forgotten: §24.1 of the requirement says to replace that matrix or
 * explicitly reject the proposal, and the dev's instruction on 2026-08-21 was that prices follow the
 * requirement. Recorded here because a price list whose comment cites a withdrawn approval is how the
 * old number comes back.
 *
 * Three rules from the same section shape the shape of it:
 *
 *  - **A product page shows no more than two purchase cards.** So there are two, and they differ by
 *    *scope* rather than by tier: one edition, or every edition available on the purchase date.
 *  - **No seat or project counters on an ordinary one-time purchase.** The old cards counted both, so
 *    those fields are gone from the type rather than left holding stale values.
 *  - **No fake crossed-out price and no permanent sale.** There is no `wasPrice` here.
 *
 * Redistribution is absent on purpose: §15.3 makes it sales-assisted from `$199` per product and never
 * part of ordinary checkout, so it cannot be a card.
 */
export const LICENCE_TIERS: readonly LicenceTier[] = [
  {
    slug: "one-edition",
    name: "One Edition",
    price: "$49",
    cadence: "One-time payment",
    description: "The framework edition you build in, as source you own.",
    scope: "The edition you select",
    included: "12 months of updates and regeneration",
    redistribution: false,
  },
  {
    slug: "all-editions",
    name: "All Editions",
    badge: "Best Value",
    price: "$99",
    cadence: "One-time payment",
    description:
      "Every edition that is downloadable today. Switch stacks whenever the project does.",
    featured: true,
    /** "It does not promise frameworks built later", in the requirement's own words. */
    scope: "Every edition available on the purchase date",
    included: "12 months of updates and regeneration",
    redistribution: false,
  },
];

export interface LicenceFeatureRow {
  label: string;
  /** Names an icon the block draws. Astro cannot pass a node per row. */
  icon: "seats" | "projects" | "support" | "components" | "design" | "updates" | "product" | "saas";
  values: readonly (string | boolean)[];
}

/**
 * The matrix rows, derived from the tiers rather than typed a second time.
 *
 * A price list that disagrees with its own comparison table is a support ticket, and the way that
 * happens is two lists of the same facts.
 */
export const LICENCE_FEATURES: readonly LicenceFeatureRow[] = [
  /**
   * The rows are §15.2's inclusion list, in its order.
   *
   * What left, and why, so nobody restores it from memory:
   *
   *  - **Seats** and **Projects**: "There are no developer-seat or project counters on ordinary one-time
   *    purchases." Both cards now include unlimited projects, so a column of numbers would be inventing
   *    a distinction the licence does not make.
   *  - **Email support** by duration: the requirement includes a service period rather than a support
   *    tier, so it is one row about what the period covers.
   *  - **Figma design source**: §24.3, no distributable Figma product exists.
   *  - **Lifetime free updates**: replaced by the real term, which is 12 months of updates, hosted
   *    configuration and regeneration, after which downloaded source keeps working forever. Calling that
   *    "lifetime updates" was the claim §24 asks to correct.
   */
  { label: "Licence covers", icon: "components", values: LICENCE_TIERS.map((t) => t.scope) },
  {
    label: "Perpetual use of downloaded source",
    icon: "product",
    values: LICENCE_TIERS.map(() => true),
  },
  {
    label: "Unlimited personal and commercial projects",
    icon: "projects",
    values: LICENCE_TIERS.map(() => true),
  },
  { label: "Client projects", icon: "seats", values: LICENCE_TIERS.map(() => true) },
  { label: "Ordinary hosted SaaS products", icon: "saas", values: LICENCE_TIERS.map(() => true) },
  {
    label: "Updates, hosted configuration and regeneration",
    icon: "updates",
    values: LICENCE_TIERS.map((t) => t.included),
  },
  {
    /** Sales-assisted from `$199` per product (§15.3), so it is never a tick on a checkout card. */
    label: "Redistribution licence",
    icon: "design",
    values: LICENCE_TIERS.map((t) => t.redistribution),
  },
];

/** A logo the block can draw, paired with the label under it. */
export interface LicenceLogoRef {
  name: "html" | "react" | "nextjs" | "vue" | "angular" | "laravel" | "tailwind" | "bundle";
  label: string;
}

export interface LicenceOption {
  /** URL segment under `/pricing`. `null` for the default page. */
  slug: string | null;
  /** Tab label. */
  label: string;
  /** The panel heading: what the licence covers. */
  title: string;
  note: string;
  /** Drawn as chips in the first column, and on the tab. */
  logos: readonly LicenceLogoRef[];
  /** The tab's own logo. */
  tabLogo: LicenceLogoRef["name"];
  /**
   * What state this option is in.
   *
   * - `sale`: real prices, real buy buttons.
   * - `quote`: the products exist, the price for this combination does not. The table renders
   *   with "On request" where the number goes, because the features are real and only the
   *   number is missing.
   * - `waitlist`: the product itself does not exist. **No table**, because a feature matrix for
   *   something we cannot deliver is a lie with a tick in it.
   */
  state: "sale" | "quote" | "waitlist";
  /** Green pill on the tab. One tab only. */
  badge?: string;
  caveat?: string;
}

/** The SKU slug is also the logo name, except where the framework is written differently. */
const LOGOS: Record<string, LicenceLogoRef> = {
  html: { name: "html", label: "HTML" },
  react: { name: "react", label: "React" },
  nextjs: { name: "nextjs", label: "Next.js" },
  vue: { name: "vue", label: "Vue" },
  angular: { name: "angular", label: "Angular" },
  laravel: { name: "laravel", label: "Laravel" },
};
const TAILWIND: LicenceLogoRef = { name: "tailwind", label: "Tailwind" };

const skuOption = (sku: Sku): LicenceOption => {
  const logo = LOGOS[sku.slug] ?? { name: "bundle" as const, label: sku.framework };
  return {
    slug: sku.slug,
    label: sku.framework,
    title: `${sku.framework} and Tailwind CSS`,
    note: `Every ${BRAND} component and page template for ${sku.framework}, yours to keep.`,
    logos: [logo, TAILWIND],
    tabLogo: logo.name,
    state: sku.status === "waitlist" ? "waitlist" : "sale",
    caveat: sku.caveat,
  };
};

/** Tab order, which is the reference design's rather than the catalogue's. */
const TAB_ORDER = ["html", "react", "nextjs", "vue", "angular", "laravel"] as const;

/**
 * The framework tabs: the bundle first, then the frameworks.
 *
 * **React is the page you land on** rather than the bundle, because the bundle has no agreed
 * price and a default page with no numbers on it is a worse first impression than one framework's
 * numbers. The bundle keeps its place at the head of the row and asks people to write to us,
 * which is what "contact sales" means when the answer is genuinely per customer.
 */
export const LICENCE_OPTIONS: readonly LicenceOption[] = [
  {
    slug: "bundle",
    label: "All together, bundle",
    title: `Get all together, the bundle: every ${BRAND} edition in one licence.`,
    note: "HTML, React, Next.js and Vue today, plus Angular and Laravel the day they ship.",
    logos: [...Object.values(LOGOS), TAILWIND],
    tabLogo: "bundle",
    badge: "Best Value",
    state: "quote",
    caveat:
      "Bundle pricing is per customer and is not published yet. Tell us which editions you need and we will quote it.",
  },
  ...TAB_ORDER.map((slug) => {
    const sku = SKUS.find((s) => s.slug === slug) as Sku;
    // React is the default route, so it is the one option with no slug of its own.
    return slug === "react" ? { ...skuOption(sku), slug: null } : skuOption(sku);
  }),
];

export const licenceHref = (option: LicenceOption): string =>
  option.slug ? `/pricing/${option.slug}` : "/pricing";

export const licenceBySlug = (slug: string): LicenceOption | undefined =>
  LICENCE_OPTIONS.find((option) => option.slug === slug);

/** The lowest price on the site, quoted on product cards so a card never has to invent one. */
/**
 * The lowest price on the site, for a card that must quote one number.
 *
 * **It is the one-edition tier, and it is not the bundle price.** Two places used it for the
 * all-editions promo and published `from $49` for a `$99` licence: the header's bundle panel and the
 * products page's bundle band. Review caught the second and the first was its sibling. If you want the
 * bundle, ask for it by slug.
 */
export const FROM_PRICE = LICENCE_TIERS[0]?.price ?? "";

/**
 * The third card (`SD-022`, `SD-023`).
 *
 * §15.2 sets the price, so it may be published. What may not be published is a purchase path: no
 * ready-made portal exists, they are Phase F of the generator epic, and a checkout button here
 * would sell something the catalogue cannot deliver. It points at the waitlist instead.
 *
 * It is deliberately not a `LicenceTier`: those two are what a product page may show, and §15.2 caps
 * a product page at two purchase cards. This one appears on the pricing page and the home page,
 * which compare all offers rather than sell one.
 */
export const READY_MADE = {
  slug: "ready-made",
  name: "Ready-Made Portal",
  price: "$149",
  cadence: "One-time payment, when it ships",
  description: "A finished portal rather than a starting point. Named, not yet on sale.",
  scope: "One ready-made portal",
  included: "12 months of updates and regeneration",
  /** The absence of a checkout is the point, so it is a field rather than an omission. */
  purchasable: false,
  href: "/waitlist?edition=ready-made",
  action: "Join the waitlist",
} as const;
