import { builds, FRAMEWORKS, type Builds, type SamplePrice } from "../plans-core.ts";

/**
 * **The plans, the add-ons and what each entitles: the one source of truth** (`PD-1246`, the dev,
 * 2026-10-09). The store's `/pricing` panel reads from here; the backoffice is to read the same
 * records rather than restate them. The rules that must hold whatever these values are live in
 * `src/plans-core.ts`.
 *
 * **Every price is a sample** (`SD-228`: no price is set). `mock: true` is required by the type, and
 * every surface prints a "Sample price" marker beside one. **Never copy these into a legal page.**
 *
 * **A value the dev has not ruled says so.** `status` is `"ruled"` when the dev stated it, and
 * `"proposed"` or `"open"` exactly where the brief marked it; a surface shows the status beside the
 * value rather than presenting it as decided. `"sample"` marks a number that is a placeholder, such
 * as the build allowances.
 */

/*
 * ┌─ DEMO-ONLY(prices) ─────────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE WITH THE PRICES THE DEV SETS. Find every piece with:                                    │
 * │   grep -rn "DEMO-ONLY(prices)" app src                                                          │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 */
const sample = (amount: number, per: SamplePrice["per"]): SamplePrice => ({ amount, currency: "USD", per, mock: true });

export type Status = "ruled" | "proposed" | "open" | "sample" | "roadmap";
export interface Value {
  readonly text: string;
  readonly status: Status;
}
const ruled = (text: string): Value => ({ text, status: "ruled" });
const proposed = (text: string): Value => ({ text, status: "proposed" });
const open = (text: string): Value => ({ text, status: "open" });
const sampled = (text: string): Value => ({ text, status: "sample" });

export type PlanId = "free" | "theme-licence" | "pro-subscription";

export interface Plan {
  readonly id: PlanId;
  readonly name: string;
  readonly billing: "quota tier" | "one-time" | "recurring";
  readonly price: SamplePrice;
  /** A second price a plan carries: the Theme Licence's next-major upgrade. */
  readonly upgrade?: SamplePrice;
  readonly summary: string;
  /** The build allowance, and what it is per. Placeholders (`status: "sample"`). */
  readonly allowance: { readonly builds: Builds; readonly per: "month" | "purchased theme" };
}

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    /* `PD-770`, `PD-1232`: a quota tier inside the platform, not a separate app. */
    billing: "quota tier",
    price: sample(0, "month"),
    summary: "The free catalogue, inside the platform, with a small build allowance.",
    allowance: { builds: builds(3), per: "month" },
  },
  {
    id: "theme-licence",
    name: "Theme Licence",
    billing: "one-time",
    price: sample(49, "one-time"),
    upgrade: sample(29, "major-upgrade"),
    summary: "One premium theme, yours to build in every framework.",
    allowance: { builds: builds(10), per: "purchased theme" },
  },
  {
    id: "pro-subscription",
    name: "Pro Subscription",
    billing: "recurring",
    price: sample(19, "month"),
    summary: "Composition, every new major while it is active, and a higher allowance.",
    allowance: { builds: builds(50), per: "month" },
  },
];

export const planById = (id: PlanId): Plan => {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`No plan "${id}"`);
  return plan;
};

/** The allowance Free falls back to, which a cancelled subscription returns to (invariant 5). */
export const FREE_ALLOWANCE = planById("free").allowance.builds;

/**
 * **The two add-ons.** Agent Credits is hosted-agent usage on its own ledger (`PD-1233`); the pack
 * size is not set (open question). Deployment Services is roadmap only: the type exists, no flow.
 */
export const ADD_ONS = [
  {
    id: "agent-credits",
    kind: "agent-credits",
    name: "Agent Credits",
    price: sample(10, "pack") as SamplePrice | null,
    status: "ruled" as Status,
    points: [
      "Hosted-agent usage, on its own credit balance",
      "One message is one run",
      "Never unlocks a theme, and a theme never grants credits",
      "Building a theme never uses credits",
    ],
  },
  {
    id: "deployment-services",
    kind: "deployment-services",
    name: "Deployment Services",
    price: null as SamplePrice | null,
    status: "roadmap" as Status,
    points: ["On the roadmap: not available, and not priced"],
  },
] as const;

const allowanceText = (p: Plan) =>
  `${p.allowance.builds} per ${p.allowance.per}`;

/**
 * **The entitlement table, per plan, in the brief's order.** One row per entitlement; each cell a
 * value with its status. The frameworks row counts `FRAMEWORKS` rather than typing six.
 */
export const ENTITLEMENTS: readonly { readonly label: string; readonly values: Readonly<Record<PlanId, Value>> }[] = [
  {
    label: "Free catalogue themes",
    values: { free: ruled("Included"), "theme-licence": ruled("Included"), "pro-subscription": ruled("Included") },
  },
  {
    label: "Premium themes",
    values: {
      free: ruled("Not included"),
      "theme-licence": ruled("The purchased theme only"),
      /* `Q-COM-04` is open. */
      "pro-subscription": proposed("All, while active"),
    },
  },
  {
    label: "Composition (Studio, AI builder)",
    values: { free: ruled("Not included"), "theme-licence": ruled("Not included"), "pro-subscription": ruled("Included") },
  },
  {
    label: "Frameworks",
    values: Object.fromEntries(
      PLANS.map((p) => [p.id, ruled(`All ${FRAMEWORKS.length}, each costs 1 build`)]),
    ) as Record<PlanId, Value>,
  },
  {
    label: "Build allowance",
    values: Object.fromEntries(PLANS.map((p) => [p.id, sampled(allowanceText(p))])) as Record<PlanId, Value>,
  },
  {
    label: "Re-download a delivered build",
    values: { free: ruled("Free, forever"), "theme-licence": ruled("Free, forever"), "pro-subscription": ruled("Free, forever") },
  },
  {
    label: "Updates",
    values: {
      free: ruled("Open-source releases"),
      "theme-licence": ruled("Every minor and patch of the major you buy; the next major at an upgrade price"),
      "pro-subscription": ruled("Every new major, while active"),
    },
  },
  {
    label: "Bug fixes to what you bought",
    values: { free: ruled("Included"), "theme-licence": ruled("Included"), "pro-subscription": ruled("Included") },
  },
  {
    label: "Delivery",
    values: Object.fromEntries(
      PLANS.map((p) => [p.id, ruled("Zip or a push to your repo, at build time")]),
    ) as Record<PlanId, Value>,
  },
  {
    label: "Support",
    values: {
      free: proposed("Community"),
      "theme-licence": proposed("Email"),
      "pro-subscription": proposed("Priority email"),
    },
  },
  {
    label: "SaaS redistribution",
    /* OPEN, and `false` until it is ruled (`PD-043` gave it to a tier that no longer exists). */
    values: { free: open("Not included for now"), "theme-licence": open("Not included for now"), "pro-subscription": open("Not included for now") },
  },
];
