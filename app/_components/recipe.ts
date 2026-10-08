import { DESIGNS } from "@/app/_vendor/vui-core";
import { AVAILABLE, type CssId, type FrameworkId, labelOf } from "@/src/configurator-core";
import { type Asset, assetBySlug } from "@/src/data/assets";
import { type Theme, THEMES } from "@/src/data/themes";
import type { Tier } from "@/src/entitlement-core";

/**
 * The guided recipe: what the conversation collects, how it reads a message, and what it asks next.
 *
 * **No assistant behind it, by design** (brief § 5: "implementable as guided conversation without an
 * AI agent: authored messages, keyword matching, selectable options and validation"). Every answer
 * here is authored, every option is read from the catalogue the rest of the store uses, and a
 * message the keywords do not cover gets one focused question rather than a pretend understanding.
 *
 * **Only what is missing is asked** (§ 5's six steps, in order): use case, setup, stack, style,
 * plan, design, then the page list with preview and download. A message that already names some of them
 * ("CRM admin, React, Tailwind") skips straight past those, and the summary lets any one be changed
 * without starting over.
 *
 * **Nothing here is invented.** Frameworks and CSS come from `AVAILABLE`, designs and their tiers
 * from `THEMES`, pages, screenshots and Free/Pro from `ASSETS`. The use-case page sets are the one
 * authored list, and every slug in them is resolved against `ASSETS` so a missing screen drops out
 * rather than appearing as a promise.
 */

export interface UseCase {
  readonly id: string;
  readonly label: string;
  /** Lower-case words or phrases that select this use case when they appear in a message. */
  readonly keywords: readonly string[];
  /** Screens this kind of admin starts from, by slug. Resolved against `ASSETS`. */
  readonly slugs: readonly string[];
}

export const USE_CASES: readonly UseCase[] = [
  {
    id: "crm",
    label: "CRM",
    keywords: ["crm", "customer", "customers", "deals", "leads", "pipeline", "clients"],
    slugs: ["crm", "organizations", "data-table", "calendar", "invoices", "create-invoice", "inbox", "task-kanban"],
  },
  {
    id: "saas",
    label: "SaaS",
    keywords: ["saas", "subscription", "b2b", "startup", "platform"],
    slugs: ["saas", "analytics", "billing", "api-keys", "integrations", "profile", "support-tickets", "ai-settings"],
  },
  {
    id: "ecommerce",
    label: "eCommerce",
    keywords: ["ecommerce", "e-commerce", "shop", "store", "orders", "products", "retail"],
    slugs: ["sales", "orders", "transactions", "reviews", "products-list", "product-detail", "add-product"],
  },
  {
    id: "finance",
    label: "Finance",
    keywords: ["finance", "fintech", "bank", "banking", "accounting", "invoice", "invoices"],
    slugs: ["finance", "transactions", "single-transaction", "stocks", "billing", "invoices", "single-invoice"],
  },
  {
    id: "analytics",
    label: "Analytics",
    keywords: ["analytics", "metrics", "reports", "reporting", "marketing", "kpi"],
    slugs: ["analytics", "marketing", "line-chart", "bar-chart", "data-table", "vector-maps"],
  },
  {
    id: "support",
    label: "Support desk",
    keywords: ["support", "helpdesk", "help desk", "ticket", "tickets", "customer service"],
    slugs: ["help-centre", "faq", "notifications", "support-tickets", "support-ticket-reply", "inbox", "chat"],
  },
  {
    id: "recruitment",
    label: "HR & Recruitment",
    keywords: ["hr", "recruit", "recruitment", "hiring", "jobs", "candidates", "talent"],
    slugs: ["departments", "calendar", "profile", "jobs", "job-detail", "candidates", "candidate-profile"],
  },
  {
    id: "logistics",
    label: "Logistics",
    keywords: ["logistics", "warehouse", "shipping", "inventory", "delivery", "fleet"],
    slugs: ["logistics", "orders", "maps", "data-table", "calendar", "task-list"],
  },
];

export const useCaseOf = (id: string | undefined): UseCase | undefined =>
  USE_CASES.find((u) => u.id === id);

/** A use case's pages, in its own order, with the ones the catalogue does not have dropped. */
export const pagesOf = (useCase: UseCase | undefined): readonly Asset[] =>
  (useCase?.slugs ?? []).map((slug) => assetBySlug(slug)).filter((a): a is Asset => Boolean(a));

/** The frameworks, in the order a beginner would recognise them, with one line each. */
export const FRAMEWORKS: readonly { readonly id: FrameworkId; readonly note: string }[] = [
  { id: "nextjs", note: "React framework with routing built in" },
  { id: "react", note: "UI library, bring your own router" },
  { id: "vue", note: "Progressive framework" },
  { id: "angular", note: "Angular 2+, TypeScript" },
  { id: "laravel", note: "PHP with Blade templates" },
  { id: "html", note: "Static HTML and CSS" },
];

export const CSS_SYSTEMS: readonly CssId[] = ["tailwind", "bootstrap", "bulma"];

export const isAvailable = (framework: FrameworkId, css: CssId): boolean =>
  AVAILABLE.some((row) => row.framework === framework && row.css === css);

/** The setup recommended to anyone who has not chosen one (§ 5: "a verified Next.js + Tailwind"). */
export const RECOMMENDED = { framework: "nextjs", css: "tailwind" } as const;

export type VibeId = "minimal" | "dense" | "soft";

/**
 * **The style step** (2026-10-08, from the Figma "AI Builder - Guest" frame, node 840:6788): after the
 * stack is confirmed the reader picks a look, Minimal Design, Dense Data or Soft Card, or explores
 * every theme. The design step then offers only that style's designs.
 *
 * **The grouping is authored, not catalogue data.** `THEMES` records no style, so each design is
 * placed by its own hint in `vui-core.ts` (quoted in the notes below), once, in exactly one group.
 * Change a design's group here and nothing else needs to move. Keywords are deliberately narrow:
 * "card" is left out because "candidate cards" is a request for a recruitment screen, not a style.
 */
export const VIBES: readonly {
  readonly id: VibeId;
  readonly label: string;
  readonly note: string;
  readonly designs: readonly string[];
  readonly keywords: readonly string[];
}[] = [
  {
    id: "minimal",
    label: "Minimal Design",
    note: "Quiet chrome and plenty of space",
    /* Voilet "the standard"; Console's near-black, scoped bar; Reach's single edge-to-edge rail. */
    designs: ["voilet", "neon", "tendora"],
    keywords: ["minimal", "minimalist", "clean", "simple"],
  },
  {
    id: "dense",
    label: "Dense Data",
    note: "More rows, tabs and panels on screen",
    /* Desk "several records open at once"; Board's project nav; Suite's grouped panel; Rack "dense
       warehouse operations"; Cloud "an enterprise cloud console". */
    designs: ["workspace", "jira", "zoho", "rackwise", "sales-force"],
    keywords: ["dense", "compact", "data-heavy", "enterprise"],
  },
  {
    id: "soft",
    label: "Soft Card",
    note: "Rounded, floating cards and gentle colour",
    /* Flow "floating cards… rounded"; Panel "a friendly SaaS console"; Counter's wide tinted rail. */
    designs: ["flow", "swift", "durara"],
    keywords: ["soft", "rounded", "friendly", "playful"],
  },
];

export const vibeOf = (id: Recipe["vibe"]) => VIBES.find((v) => v.id === id);

/** The design's own primary, for its swatch. Two designs inherit the store's blue. */
export const swatchOf = (theme: Theme): string => {
  const tokens = (DESIGN_TOKENS[theme.id] ?? {}) as Record<string, string>;
  return tokens["--primary"] ?? "#0058ee";
};
const DESIGN_TOKENS: Record<string, unknown> = Object.fromEntries(
  DESIGNS.map((d) => [d.id, (d as { tokens?: unknown }).tokens ?? {}]),
);

/** Designs this recipe may use: Free is Voilet alone, and every design must build the chosen stack. */
export const designsFor = (recipe: Recipe): readonly Theme[] =>
  THEMES.filter(
    (t) =>
      (recipe.tier !== "free" || t.tiers.includes("free")) &&
      (!recipe.framework || t.frameworks.includes(recipe.framework)) &&
      (!recipe.css || t.css.includes(recipe.css)),
  );

/**
 * The designs the design step offers: `designsFor`, narrowed to the chosen style. **When the plan
 * leaves none in that style** (Free is Voilet alone, which is Minimal), it falls back to what the plan
 * does allow and says so, rather than showing an empty step or quietly switching the plan.
 */
export const designsForVibe = (
  recipe: Recipe,
): { readonly designs: readonly Theme[]; readonly outsideVibe: boolean } => {
  const allowed = designsFor(recipe);
  const vibe = vibeOf(recipe.vibe);
  if (!vibe) return { designs: allowed, outsideVibe: false };
  const inVibe = allowed.filter((t) => vibe.designs.includes(t.id));
  return inVibe.length > 0 ? { designs: inVibe, outsideVibe: false } : { designs: allowed, outsideVibe: true };
};

export interface Recipe {
  readonly useCase?: string;
  /** How the stack was decided, so the summary can say "recommended" rather than "chosen". */
  readonly setup?: "recommended" | "own";
  readonly framework?: FrameworkId;
  readonly css?: CssId;
  /** The look, or `"any"` when the reader chose to explore every theme. */
  readonly vibe?: VibeId | "any";
  readonly tier?: Tier;
  readonly design?: string;
  /** Slugs the reader has ticked. `undefined` means "all this plan includes", until they edit it. */
  readonly pages?: readonly string[];
}

/** The pages a recipe will ship: the ticked ones, or by default every one its plan includes. */
export const includedPages = (recipe: Recipe): readonly Asset[] => {
  const all = pagesOf(useCaseOf(recipe.useCase));
  const allowed = all.filter((p) => recipe.tier === "pro" || p.tier === "free");
  return recipe.pages ? allowed.filter((p) => recipe.pages?.includes(p.slug)) : allowed;
};

/* ─── Reading a message ──────────────────────────────────────────────────────────────────────── */

const has = (text: string, word: string): boolean =>
  new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(text);

export interface Parsed {
  readonly patch: Partial<Recipe>;
  /** Something asked for that this store does not offer, with the reason and the alternative. */
  readonly unsupported?: string;
  /** Words that matched, so the reply can say what it understood rather than just carry on. */
  readonly understood: readonly string[];
}

/**
 * What a message says about the recipe, by keyword.
 *
 * **AngularJS is checked before Angular and never becomes it** (§ 5: "never treat Angular and
 * AngularJS as interchangeable"); it is not offered, so it is reported as unsupported with Angular
 * named as a separate, supported alternative. Next.js is checked before React for the same reason:
 * "Next.js uses React" must not read as a request for plain React, and it needs its full name,
 * because a bare "next" ("what's next?") is not a framework. A design is taken only when the
 * message says "<name> design" or "<name> theme", because "admin panel" is not a request for Panel.
 */
export function parse(message: string): Parsed {
  const text = message.toLowerCase();
  const patch: { -readonly [K in keyof Recipe]?: Recipe[K] } = {};
  const understood: string[] = [];
  let unsupported: string | undefined;

  const useCase = USE_CASES.find((u) => u.keywords.some((k) => has(text, k)));
  if (useCase) {
    patch.useCase = useCase.id;
    understood.push(`${useCase.label} admin`);
  }

  if (/angular\s?js|angular\.js|angular\s?1(\.x)?\b/.test(text)) {
    unsupported =
      "AngularJS (1.x) isn't offered: it is a separate, legacy product, not an older Angular. Angular 2+ is supported, as are Next.js, React, Vue, Laravel and HTML.";
  } else {
    const framework: FrameworkId | undefined = has(text, "next.js") || has(text, "nextjs") || has(text, "next js")
      ? "nextjs"
      : has(text, "react")
        ? "react"
        : has(text, "vue") || has(text, "vue.js")
          ? "vue"
          : has(text, "angular")
            ? "angular"
            : has(text, "laravel") || has(text, "blade")
              ? "laravel"
              : has(text, "html") || has(text, "static")
                ? "html"
                : undefined;
    if (framework) {
      patch.framework = framework;
      patch.setup = "own";
      understood.push(labelOf(framework));
    }
  }

  const css: CssId | undefined = has(text, "tailwind")
    ? "tailwind"
    : has(text, "bootstrap")
      ? "bootstrap"
      : has(text, "bulma")
        ? "bulma"
        : undefined;
  if (css) {
    patch.css = css;
    understood.push(labelOf(css));
  }

  const vibe = VIBES.find((v) => v.keywords.some((k) => has(text, k)));
  if (vibe) {
    patch.vibe = vibe.id;
    understood.push(vibe.label);
  }

  if (has(text, "free")) {
    patch.tier = "free";
    understood.push("Free");
  } else if (has(text, "pro") || has(text, "premium") || has(text, "paid")) {
    patch.tier = "pro";
    understood.push("Pro");
  }

  const design = THEMES.find((t) => new RegExp(`\\b${t.label.toLowerCase()}\\s+(design|theme)\\b|\\btheme\\s+${t.label.toLowerCase()}\\b`).test(text));
  if (design) {
    patch.design = design.id;
    understood.push(`${design.label} design`);
  }

  return { patch, unsupported, understood };
}

/* ─── What to ask next ───────────────────────────────────────────────────────────────────────── */

export type Step =
  | { readonly kind: "useCase" }
  | { readonly kind: "setup" }
  | { readonly kind: "recommend" }
  | { readonly kind: "stack" }
  | { readonly kind: "vibe" }
  | { readonly kind: "tier" }
  | { readonly kind: "tierConflict" }
  | { readonly kind: "design" }
  | { readonly kind: "summary" };

/**
 * The next thing to ask, from what is still missing. Pure, so the same recipe always asks the same
 * question, and a change made from the summary re-asks exactly the one step it cleared.
 *
 * **Free with a CSS system other than Tailwind is a conflict, not a switch** (§ 5: "Do not silently
 * switch the user to Pro"). It is asked about, with both ways out offered.
 */
export function nextStep(recipe: Recipe): Step {
  if (!recipe.useCase) return { kind: "useCase" };
  if (!recipe.framework && !recipe.setup) return { kind: "setup" };
  if (!recipe.framework || !recipe.css) {
    return recipe.setup === "recommended" ? { kind: "recommend" } : { kind: "stack" };
  }
  if (!recipe.vibe) return { kind: "vibe" };
  if (!recipe.tier) return { kind: "tier" };
  if (recipe.tier === "free" && recipe.css !== "tailwind") return { kind: "tierConflict" };
  if (!recipe.design || !designsFor(recipe).some((t) => t.id === recipe.design)) {
    return { kind: "design" };
  }
  return { kind: "summary" };
}

/** What the assistant says for a step. Short, and it never repeats a choice already made. */
export function promptFor(step: Step, recipe: Recipe): string {
  const useCase = useCaseOf(recipe.useCase);
  switch (step.kind) {
    case "useCase":
      return "What kind of admin are you building? Pick one, or describe it in your own words.";
    case "setup":
      return `${useCase?.label ?? "Your"} admin, got it. How would you like to set it up?`;
    case "recommend":
      return "Here's what I recommend for you:";
    case "stack":
      return recipe.css
        ? `Choose a framework. These work with ${labelOf(recipe.css)}:`
        : "Choose a framework and a CSS framework:";
    case "vibe":
      return `I've set up ${labelOf(recipe.framework ?? "")} and ${labelOf(recipe.css ?? "")}. What style should your themes have?`;
    case "tier":
      return `Would you like a Free starter or the Pro ${useCase?.label ?? ""} pages?`;
    case "tierConflict":
      return `Free themes use Tailwind CSS only, and you chose ${labelOf(recipe.css ?? "")}. Which should change?`;
    case "design":
      return "Last choice before your page list: pick a design.";
    case "summary":
      return "Here's your admin. Change anything below, you won't need to start over.";
  }
}

/** The steps a summary row reopens: clearing exactly the field it edits, nothing after it. */
export const REOPEN: Record<
  "useCase" | "stack" | "vibe" | "tier" | "design",
  (r: Recipe) => Recipe
> = {
  useCase: (r) => ({ ...r, useCase: undefined, pages: undefined }),
  stack: (r) => ({ ...r, framework: undefined, css: undefined, setup: "own" }),
  vibe: (r) => ({ ...r, vibe: undefined, design: undefined }),
  tier: (r) => ({ ...r, tier: undefined, pages: undefined }),
  design: (r) => ({ ...r, design: undefined }),
};
