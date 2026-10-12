/**
 * **Plans and entitlements: the rules, as types and functions** (`PD-1246`, the dev, 2026-10-09).
 *
 * The data, the three plans and two add-ons with their sample prices, is `src/data/plans.ts`. This
 * file is what must stay true whatever the data says, so the invariants live in the types where a type
 * can hold them and in a function where it cannot, and `plans-core.test.ts` checks each. Framework-free
 * and import-free, like `entitlement-core.ts` beside it, so it moves to a shared package unchanged
 * when the backoffice reads it too.
 *
 * **What already did part of this** (`E-02`): `entitlement-core.ts` answers "is this Free" (`PD-866`,
 * `PD-867`) and stays the only place that does; tier is computed there, never stored, so nothing
 * here has a `tier` field. `schema/backend/schema.sql`'s `plan_versions`, `subscriptions`,
 * entitlement grants, allowances and credit ledger are the monorepo's and are not in this repository;
 * these types mirror their shape for the storefront and must be reconciled with them there.
 */

/* ── The four purchasable things ─────────────────────────────────────────────────────────────── */

/**
 * **Invariant 1** (`PD-1233`): the four purchasable things never share a balance or a table.
 * Credits never unlock a theme; a theme never grants credits; signing up grants the ability to
 * connect an agent and nothing else.
 */
export type Purchasable = "product-access" | "composition-access" | "agent-credits" | "deployment-services";

declare const unit: unique symbol;
/** A count that carries its unit in the type, so one ledger's number cannot be spent in another. */
type Counted<U extends string> = number & { readonly [unit]: U };
/** Builds: what product access spends. A second framework is a second build (`PD-1233`). */
export type Builds = Counted<"builds">;
/** Agent credits: hosted-agent usage, on their own ledger (`PD-1233`). */
export type Credits = Counted<"agent-credits">;

export const builds = (n: number) => n as Builds;
export const credits = (n: number) => n as Credits;

/** The ledgers a workspace holds: one per kind, never a shared balance. */
export interface Ledgers {
  readonly builds: Builds;
  readonly credits: Credits;
}

/** What a purchase, or signing up, hands over. Each grant names exactly one kind. */
export type Grant =
  | { readonly kind: "agent-connection" }
  | { readonly kind: "product-access"; readonly theme: string; readonly range: ReleaseRange }
  | { readonly kind: "product-access"; readonly theme: "premium-catalogue"; readonly whileActive: true }
  | { readonly kind: "composition-access"; readonly whileActive: true }
  | { readonly kind: "agent-credits"; readonly credits: Credits }
  | { readonly kind: "deployment-services" };

export type Purchase =
  | { readonly type: "sign-up" }
  | { readonly type: "theme-licence"; readonly theme: string; readonly version: string }
  | { readonly type: "pro-subscription" }
  | { readonly type: "agent-credit-pack"; readonly credits: Credits };

/**
 * What each purchase grants, and nothing else. Pro's premium-catalogue access is **[PROPOSED]**
 * (`Q-COM-04`); it is modelled so the shape is settled, and the fixture marks it proposed.
 */
export function grantsOf(purchase: Purchase): readonly Grant[] {
  switch (purchase.type) {
    case "sign-up":
      return [{ kind: "agent-connection" }];
    case "theme-licence":
      return [{ kind: "product-access", theme: purchase.theme, range: rangeOf(purchase.version) }];
    case "pro-subscription":
      return [
        { kind: "product-access", theme: "premium-catalogue", whileActive: true },
        { kind: "composition-access", whileActive: true },
      ];
    case "agent-credit-pack":
      return [{ kind: "agent-credits", credits: purchase.credits }];
  }
}

/* ── Metering ───────────────────────────────────────────────────────────────────────────────── */

/** A unit of work, and which ledger it spends. */
export type Job =
  | { readonly type: "theme-build"; readonly projects: number }
  | { readonly type: "agent-run" };

/**
 * **Invariant 2** (`PD-1233`): deterministic theme generation is never metered as AI credits. A theme
 * build spends one build per project and no credits, whatever it costs us; one agent message is one
 * run (PRODUCT.md § 10a, "one run, whatever the internal call count").
 */
export function meter(job: Job): Ledgers {
  return job.type === "theme-build"
    ? { builds: builds(job.projects), credits: credits(0) }
    : { builds: builds(0), credits: credits(1) };
}

/* ── Projects ───────────────────────────────────────────────────────────────────────────────── */

/** The six framework editions (PROJECT.md: an edition is a framework build, not a tier). */
export const FRAMEWORKS = ["html", "react", "nextjs", "vue", "angular", "laravel"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

/** **Invariant 3** (`PD-1231`): one project is one theme in one framework. */
export interface Project {
  readonly theme: string;
  readonly framework: Framework;
}

/** The projects a request becomes: one per distinct framework, each spending one build. */
export function projectsFor(theme: string, frameworks: readonly Framework[]): readonly Project[] {
  return [...new Set(frameworks)].map((framework) => ({ theme, framework }));
}

/* ── Releases and rebuilds ──────────────────────────────────────────────────────────────────── */

/** **Invariant 4** (`PD-1230`): an update is a rebuild right, a release range on a grant. */
export interface ReleaseRange {
  readonly major: number;
}

export function majorOf(version: string): number {
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  if (!Number.isInteger(major) || major < 0) throw new Error(`Not a release: "${version}"`);
  return major;
}

/** Buy `2.1.0`, own `2.x`. */
export const rangeOf = (version: string): ReleaseRange => ({ major: majorOf(version) });

/** **Invariant 6** (`PD-1230`): a major stays rebuildable for 24 months after it is superseded. */
export const REBUILD_MONTHS = 24;

export function rebuildableUntil(supersededAt: Date): Date {
  const until = new Date(supersededAt);
  until.setUTCMonth(until.getUTCMonth() + REBUILD_MONTHS);
  return until;
}

export type Authorisation =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "new-major" | "rebuild-window-ended" | "not-owned"; readonly pin: string };

/**
 * May this grant build this release? **Asked twice** (`PD-1230`): when the quote is made and again
 * when the job starts, because a subscription can end or a window can close in between. A refusal
 * names the pin that failed, and a rebuild never silently produces a newer theme: a newer major is
 * refused, not substituted.
 */
export function authorise(
  holding: { readonly range: ReleaseRange } | { readonly allMajors: true },
  release: { readonly theme: string; readonly version: string; readonly supersededAt?: Date },
  now: Date,
): Authorisation {
  const major = majorOf(release.version);
  const pin = `${release.theme}@${release.version}`;
  if ("range" in holding && holding.range.major !== major) {
    return { ok: false, reason: major > holding.range.major ? "new-major" : "not-owned", pin };
  }
  if (release.supersededAt && now > rebuildableUntil(release.supersededAt)) {
    return { ok: false, reason: "rebuild-window-ended", pin };
  }
  return { ok: true };
}

/* ── Subscriptions ──────────────────────────────────────────────────────────────────────────── */

export interface SubscriptionState {
  readonly active: boolean;
  /** Majors whose rebuild rights were acquired while subscribed. */
  readonly acquiredMajors: readonly number[];
  readonly composition: boolean;
  readonly newMajors: boolean;
  /** The monthly build allowance in force. */
  readonly allowance: Builds;
}

/**
 * **Invariant 5** (`PD-1230`): on cancellation, delivered source and the rebuild rights for majors
 * already acquired survive; composition, new-major access and the higher allowance stop, and the
 * allowance falls to Free's.
 */
export function cancel(state: SubscriptionState, freeAllowance: Builds): SubscriptionState {
  return {
    active: false,
    acquiredMajors: state.acquiredMajors,
    composition: false,
    newMajors: false,
    allowance: freeAllowance,
  };
}

/* ── Delivery and refunds ───────────────────────────────────────────────────────────────────── */

/**
 * **Invariant 7** (`PD-1231`): an artifact is delivered once and not hosted; its receipt is kept
 * permanently.
 */
export interface Receipt {
  readonly what: Project & { readonly release: string };
  readonly hash: string;
  readonly when: Date;
  readonly destination: { readonly type: "zip" } | { readonly type: "repo"; readonly repo: string };
}

/** **Invariant 8** (`SD-015`, `SD-228`): 30 days, and the right ends at delivery, not at a date. */
export const REFUND_DAYS = 30;

/**
 * Refundable? Browsing, configuring and previewing never end the right; only a delivery does.
 * (Consumer law in the EU and UK may need more, a consent at checkout: `SD-228`. That is counsel's.)
 */
export function refundable(purchase: { readonly purchasedAt: Date; readonly deliveredAt?: Date }, now: Date): boolean {
  if (purchase.deliveredAt && purchase.deliveredAt <= now) return false;
  const days = (now.getTime() - purchase.purchasedAt.getTime()) / 86_400_000;
  return days <= REFUND_DAYS;
}

/* ── Prices ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * **A price is always a sample until one is set** (`SD-228`: "No price is among the knowns"). The
 * literal `mock: true` makes an unmarked price a type error, and every surface that prints one also
 * prints the "Sample price" marker. Never written into the legal pages.
 */
export interface SamplePrice {
  readonly amount: number;
  readonly currency: "USD";
  readonly per: "one-time" | "month" | "major-upgrade" | "pack";
  readonly mock: true;
}

export const formatPrice = (p: SamplePrice) => `$${p.amount}`;
