import { FREE_DESIGN, type Marked, type Tier, tierOf } from "@/src/entitlement-core";

import gallery from "./gallery.generated.json";

/**
 * The catalogue every phase-2 page renders from (`SD-122`, the blueprint's §§ 6 and 7).
 *
 * **Derived from the application, not typed out.** `gallery.generated.json` is written by
 * `pnpm capture:gallery` walking `pro-react/app/nav.ts`, so this catalogue is exactly the screens
 * that exist and every card has a real screenshot of the real thing. A hand-written asset list is a
 * list that promises a screen the product does not have, which is the failure this storefront has
 * recorded five times (`SD-099`, `SD-103`, `SD-106`, `SD-107`, `SD-111`).
 *
 * **The blueprint gates the detail pages and this is how that gate is kept**: "inventory candidates,
 * not claims of delivered screens. Publish each only when its real asset exists." An asset exists
 * here if and only if the capture found it.
 *
 * **Classification is by route, and the rules are ordered.** A screen belongs to exactly one
 * collection, which § 2 requires: "asset type determines one canonical home. A CRM dashboard belongs
 * at /dashboards/crm/, even if it appears in Pages search results."
 */
export type AssetKind = "dashboard" | "application" | "layout" | "page";

export interface Asset extends Marked {
  /** `/products-list` in the app; `products-list` in this storefront's URLs. */
  readonly slug: string;
  readonly route: string;
  readonly title: string;
  readonly kind: AssetKind;
  /** The application family this belongs to, where it belongs to one. Drives `/applications/`. */
  readonly family?: string;
  /** The interaction pattern, for `/explore/`'s Pattern filter. */
  readonly pattern: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Free or Pro, from `tierOf` and never decided here; see `pro` below. */
  readonly tier: Tier;
}

/**
 * Words a route spells in lower case that a reader expects in their own casing. Title-casing turned
 * `/crm` into "Crm" and `/api-keys` into "Api Keys", on gallery cards and in the recipe's page list.
 */
const CASED: Record<string, string> = { crm: "CRM", api: "API", faq: "FAQ", saas: "SaaS", kpi: "KPI" };

/** Title-case a route: `/support-ticket-reply` becomes `Support Ticket Reply`, `/crm` becomes `CRM`. */
const titleOf = (route: string): string => {
  const last = route.split("/").filter(Boolean).at(-1);
  if (!last) return "Dashboard";
  return last
    .split("-")
    .map(
      (word) =>
        CASED[word] ??
        (word.length <= 2 ? word.toUpperCase() : word[0]?.toUpperCase() + word.slice(1)),
    )
    .join(" ");
};

/**
 * Which family a route belongs to, and the order decides ties.
 *
 * `/product-detail` matches both ecommerce and the generic detail pattern; ecommerce is checked
 * first because a screen has one home. Longest, most specific prefixes first.
 */
const FAMILIES: readonly { family: string; label: string; match: RegExp }[] = [
  {
    family: "ecommerce",
    label: "Ecommerce",
    match: /^\/(products-list|product-detail|add-product)$/,
  },
  { family: "invoices", label: "Invoices", match: /^\/(invoices|single-invoice|create-invoice)$/ },
  { family: "blog", label: "Blog", match: /^\/blog/ },
  {
    family: "recruitment",
    label: "Recruitment",
    match: /^\/(jobs|job-detail|job-apply|candidates|candidate-profile)$/,
  },
  {
    family: "ai-assistant",
    label: "AI Assistant",
    match: /^\/(ai|ai-settings|text-generator|image-generator|code-generator|video-generator)$/,
  },
  { family: "tasks", label: "Tasks", match: /^\/task-/ },
  { family: "inbox", label: "Inbox", match: /^\/(inbox|inbox-details|chat)$/ },
  { family: "support", label: "Support", match: /^\/support-/ },
  { family: "file-manager", label: "Files", match: /^\/file-manager$/ },
];

/** The pattern a screen is, for the Pattern filter. First match wins. */
const PATTERNS: readonly { pattern: string; match: RegExp }[] = [
  { pattern: "Dashboard", match: /^\/$|^\/(analytics|crm|marketing|saas|stocks)$/ },
  { pattern: "Authentication", match: /signin|signup|reset-password/ },
  { pattern: "Error", match: /error-|not-found|maintenance|coming-soon|success/ },
  { pattern: "Calendar", match: /calendar/ },
  { pattern: "Kanban", match: /kanban/ },
  { pattern: "Inbox", match: /inbox|chat|mail/ },
  { pattern: "Form", match: /form|add-|create-|apply|editor|settings/ },
  /*
   * **A component showcase is not an application screen.** Twenty of the 116 routes are the demo
   * pages for a single element: buttons, badges, avatars, tabs, tooltips. Leaving them in `List`
   * put seventy screens in one bucket and made the Pattern filter useless, which is the one thing
   * a filter cannot be.
   */
  {
    pattern: "UI element",
    match:
      /^\/(alerts|avatars|badge|breadcrumb|buttons|buttons-group|cards|carousel|dropdowns|images|links|list|modals|notifications|pagination|popovers|progress-bar|ribbons|spinners|steps|tabs|tooltips|videos|empty-states)$/,
  },
  { pattern: "Marketing", match: /^\/blocks\// },
  { pattern: "Chart", match: /-chart$|^\/(maps|vector-maps)$/ },
  { pattern: "Table", match: /table/ },
  { pattern: "Detail", match: /-detail$|-profile$|single-|-post$|-reply$/ },
  { pattern: "List", match: /list$|s$/ },
];

/** Screens that are the shell rather than a screen: the layout pickers and the blank frame. */
/**
 * The shell rather than a screen.
 *
 * Only `/blank` and `/form-layout` are in the sidebar; the six numbered layout demos and the theme
 * picker are reachable from the Layouts screen rather than the menu, so the capture does not see
 * them and this catalogue does not claim them.
 */
const LAYOUT = /^\/(blank|form-layout)$/;

const classify = (route: string): { kind: AssetKind; family?: string; pattern: string } => {
  const pattern = PATTERNS.find((p) => p.match.test(route))?.pattern ?? "List";
  if (LAYOUT.test(route)) return { kind: "layout", pattern: "Layout" };
  const family = FAMILIES.find((f) => f.match.test(route))?.family;
  if (family) return { kind: "application", family, pattern };
  if (pattern === "Dashboard") return { kind: "dashboard", pattern };
  return { kind: "page", pattern };
};

/**
 * **Application screens are Pro; dashboards, layouts and pages are Free.** The owner's call,
 * 2026-10-07, recorded as the `pro` mark `entitlement-core` reads, so the tier still comes from
 * the one rule (`tierOf`) rather than from a second opinion here. The captures are all Voilet's,
 * the Free design, so an unmarked screen is Free and a marked one is Pro.
 */
const isPro = (kind: AssetKind): boolean => kind === "application";

export const ASSETS: readonly Asset[] = gallery.screens
  .map((shot) => {
    const { kind, family, pattern } = classify(shot.route);
    const pro = isPro(kind);
    return {
      slug: shot.route.replace(/^\//, "") || "dashboard",
      route: shot.route,
      title: titleOf(shot.route),
      kind,
      family,
      pattern,
      src: `/gallery/${shot.file}`,
      width: shot.width,
      height: shot.height,
      pro,
      tier: tierOf(FREE_DESIGN, { pro }),
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export const assetBySlug = (slug: string): Asset | undefined =>
  ASSETS.find((asset) => asset.slug === slug);

export const assetsOfKind = (kind: AssetKind): readonly Asset[] =>
  ASSETS.filter((asset) => asset.kind === kind);

/** The application families that actually have screens, with their counts. */
export const ASSET_FAMILIES: readonly { family: string; label: string; count: number }[] =
  FAMILIES.map((f) => ({
    family: f.family,
    label: f.label,
    count: ASSETS.filter((a) => a.family === f.family).length,
  })).filter((f) => f.count > 0);

export const ASSET_PATTERNS: readonly string[] = [...new Set(ASSETS.map((a) => a.pattern))].sort();

export const KIND_LABEL: Record<AssetKind, string> = {
  dashboard: "Dashboard",
  application: "Application screen",
  layout: "Layout",
  page: "Page",
};

/** `/dashboards/`, `/applications/`, `/layouts/`, `/pages/`: the collection a kind lives at. */
export const KIND_COLLECTION: Record<AssetKind, string> = {
  dashboard: "/dashboards",
  application: "/applications",
  layout: "/layouts",
  page: "/pages",
};
