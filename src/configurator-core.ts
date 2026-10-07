/**
 * The guided configurator, as a state machine with no model in it (`SD-131`).
 *
 * **The conversation is a presentation of this, not the other way round.** The brief is explicit:
 * "Persist structured configuration as the source of truth; the transcript is its presentation and
 * history", and "the core conversation is a guided configurator and must work without an AI model or
 * agent". So everything here is pure: given a configuration and a message or an action, it returns
 * the next configuration and the next question. A chat bubble, a panel of dropdowns and an MCP tool
 * are three renderers of one thing.
 *
 * **Why framework-free and why tested.** The same service has to answer for the chat, the selection
 * panels and MCP. Three implementations of "is React plus Bulma available" is three answers, and the
 * one a buyer sees is whichever they happened to open.
 *
 * **Availability is a record, never the product of two lists.** `AVAILABLE` below is written out
 * rather than computed from frameworks times CSS frameworks, because the Cartesian product claims
 * eighteen combinations and `odin/product/MATRIX.md` says one CSS framework is built. Offering a combination
 * that does not exist is the `check:inventory` defect in a dropdown.
 */

/** The ten states, in the order the brief sets them out. */
export const STATES = [
  "NEED",
  "SETUP",
  "TIER",
  "STACK",
  "DESIGN",
  "PAGES",
  "REVIEW",
  "PREVIEW",
  "ACCESS",
  "DELIVERY",
] as const;

export type State = (typeof STATES)[number];

/*
 * Tier is defined by `entitlement-core`, which owns the rule. Imported for use here and re-exported
 * so existing callers keep one import path. **A re-export alone is not an import**: the first
 * version of this line had only the `export type` and every use of `Tier` in this file failed to
 * resolve, because the anchor the edit looked for was not in the file and `String.replace` says
 * nothing when it matches nothing.
 */
import { designsFor, type Tier, tiersOf } from "./entitlement-core";

export type { Tier } from "./entitlement-core";

/**
 * A framework we can actually deliver, keyed by the id the repository uses.
 *
 * **`angular` and `angularjs` are two entries and never aliases of each other**, which the brief
 * calls out twice. They are different frameworks; a buyer told "Angular" and handed AngularJS has
 * been mis-sold.
 */
export type FrameworkId = "react" | "nextjs" | "vue" | "angular" | "html" | "laravel";

export type CssId = "tailwind" | "bootstrap" | "bulma";

/** A design, by the id the dev types and the label a buyer reads (`PD-741`). */
export const DESIGNS = [
  { id: "voilet", label: "Voilet" },
  { id: "neon", label: "Console" },
  /*
   * **`workspace` is the id and `Desk` is the label** (`SD-152`, `PD-741`). The shell has been in
   * the package and rendering the React demo since before this list existed, and no design named
   * it, so the store sold four arrangements while five were built. "Workspace" would be the
   * weakest name on a pricing page beside Console, Board and Suite; a desk is where several open
   * documents sit, which is what its tab strip is for.
   */
  { id: "workspace", label: "Desk" },
  { id: "jira", label: "Board" },
  { id: "zoho", label: "Suite" },
] as const;

export type DesignId = (typeof DESIGNS)[number]["id"];

/**
 * Every combination that exists, written out.
 *
 * **Read from `odin/product/MATRIX.md` rather than assumed.** Only `tailwind` is built; Bootstrap and Bulma
 * have reserved ports and no emitter. Listing them as choices would be advertising an artifact
 * nobody can download.
 *
 * `free` is Tailwind-only by decision, which is why the tier appears here: availability is a
 * property of the whole combination, not of the framework alone.
 */
export const AVAILABLE: readonly {
  readonly framework: FrameworkId;
  readonly css: CssId;
}[] = [
  { framework: "react", css: "tailwind" },
  { framework: "nextjs", css: "tailwind" },
  { framework: "vue", css: "tailwind" },
  { framework: "angular", css: "tailwind" },
  { framework: "html", css: "tailwind" },
  { framework: "laravel", css: "tailwind" },
  /*
   * **Bootstrap, on every framework** (`PD-1061`). The axis was wired ahead of the work by
   * `PD-1021` and the work is what took this long: `PD-1018`'s conversion moved 823 class names out
   * of Tailwind utilities and into `theme.css`, so a component now renders from a rule a Bootstrap
   * stylesheet can implement rather than from utilities only Tailwind can emit.
   *
   * **Every framework, because the axis is CSS and not JS.** A Bootstrap adapter is a `:root` block
   * of variable mappings; nothing in it knows which framework rendered the markup above it.
   *
   * **Bulma is deliberately not here yet.** It is the same adapter shape and the same conversion
   * behind it, and shipping one at a time is what keeps `isAvailable` a claim somebody checked.
   */
  { framework: "react", css: "bootstrap" },
  { framework: "nextjs", css: "bootstrap" },
  { framework: "vue", css: "bootstrap" },
  { framework: "angular", css: "bootstrap" },
  { framework: "html", css: "bootstrap" },
  { framework: "laravel", css: "bootstrap" },
  /*
   * **Bulma, on every framework** (`PD-1062`). The same adapter shape and the same conversion
   * behind it as Bootstrap; shipped second on purpose, so each one was a claim somebody checked
   * rather than two flipped on the strength of one.
   *
   * **This completes the axis**, so `AVAILABLE` now holds the whole product: six frameworks times
   * three CSS frameworks, eighteen rows. The assertion that it must hold fewer than eighteen was
   * written to catch over-claiming and cannot tell that from being finished; it asserts the exact
   * count now, and the reason is in `PD-1062`.
   */
  { framework: "react", css: "bulma" },
  { framework: "nextjs", css: "bulma" },
  { framework: "vue", css: "bulma" },
  { framework: "angular", css: "bulma" },
  { framework: "html", css: "bulma" },
  { framework: "laravel", css: "bulma" },
];

/** A business recipe: the menus and pages a use case starts from. */
export const RECIPES = [
  { id: "crm", label: "CRM", aliases: ["crm", "customer management", "customer relationship"] },
  { id: "saas", label: "SaaS admin", aliases: ["saas", "saas admin", "subscription"] },
  {
    id: "ecommerce",
    label: "Digital products",
    aliases: ["ecommerce", "e-commerce", "shop", "store admin", "digital products"],
  },
  { id: "analytics", label: "Analytics", aliases: ["analytics", "reporting", "dashboards"] },
] as const;

export type RecipeId = (typeof RECIPES)[number]["id"];

/**
 * The phrases that resolve to a framework, **longest first**.
 *
 * **"Next.js" must not become "React"**, which is the brief's own example and the reason this list is
 * ordered rather than a map. `next.js` contains no substring problem on its own, but `react` does:
 * matching short tokens first turns "Next.js and React Query" into React. Sorting by phrase length
 * and taking the first hit is what makes the longest explicit phrase win.
 */
const FRAMEWORK_ALIASES: readonly { readonly phrase: string; readonly id: FrameworkId }[] = [
  { phrase: "next.js", id: "nextjs" },
  { phrase: "nextjs", id: "nextjs" },
  { phrase: "next js", id: "nextjs" },
  /*
   * Bare `next`, because "a logistics dashboard in next" is the requirement's own example and it
   * resolved to no framework at all. Safe only now that matching is word-bounded: as a substring it
   * would have fired inside "context" and "nextcloud". It still reads "what next?" as Next.js, which
   * is a wrong filter on a search rather than a wrong action, and the three longer spellings above
   * win whenever they are present.
   */
  { phrase: "next", id: "nextjs" },
  { phrase: "react.js", id: "react" },
  { phrase: "reactjs", id: "react" },
  { phrase: "react", id: "react" },
  { phrase: "vue.js", id: "vue" },
  { phrase: "vuejs", id: "vue" },
  { phrase: "vue", id: "vue" },
  { phrase: "angular", id: "angular" },
  { phrase: "laravel", id: "laravel" },
  { phrase: "blade", id: "laravel" },
  { phrase: "html", id: "html" },
];

/**
 * Phrases that name something real which we do **not** sell, and the reason.
 *
 * **`angularjs` is the case the brief names twice, and it is true here.** Our Angular edition depends
 * on `@angular/core` ^20, read from `apps/web/angular/package.json` and
 * `packages/web/ui/angular/package.json`. That is modern Angular, not AngularJS 1.x. A buyer who
 * types "AngularJS" wants 1.x; handing them Angular 20 is a mis-sale, and saying nothing and
 * offering Angular instead is the same mis-sale with a friendlier face.
 *
 * **The app directory was called `angularjs` when this was written and is called `angular` now.**
 * The rename removed the thing that made the misnomer plausible; this table is what stops the
 * *word* being resolved to a product we do not sell, and that job is unchanged by the rename.
 *
 * `svelte` and the rest are here for the same reason: a recognised name deserves "we do not have
 * that" rather than silence, which the brief calls a helpful bounded response.
 */
export const UNSUPPORTED: readonly { readonly phrase: string; readonly because: string }[] = [
  {
    phrase: "angularjs",
    because: "We ship Angular 20, which is a different framework from AngularJS 1.x.",
  },
  {
    phrase: "angular.js",
    because: "We ship Angular 20, which is a different framework from AngularJS 1.x.",
  },
  { phrase: "svelte", because: "Svelte is not one of the frameworks we build." },
  { phrase: "solid", because: "Solid is not one of the frameworks we build." },
];

const CSS_ALIASES: readonly { readonly phrase: string; readonly id: CssId }[] = [
  { phrase: "tailwindcss", id: "tailwind" },
  { phrase: "tailwind css", id: "tailwind" },
  { phrase: "tailwind", id: "tailwind" },
  { phrase: "bootstrap", id: "bootstrap" },
  { phrase: "bulma", id: "bulma" },
];

const TIER_ALIASES: readonly { readonly phrase: string; readonly id: Tier }[] = [
  { phrase: "free", id: "free" },
  { phrase: "pro", id: "pro" },
  { phrase: "paid", id: "pro" },
];

/**
 * The structured configuration. **This is the source of truth**; the transcript presents it.
 *
 * `revision` increments on every edit, because the brief requires an edit to mark existing previews
 * stale, and a preview is stale relative to a revision rather than to a timestamp.
 */
export interface Configuration {
  readonly revision: number;
  readonly recipe?: RecipeId;
  readonly tier?: Tier;
  readonly framework?: FrameworkId;
  readonly css?: CssId;
  readonly design?: DesignId;
  /** Routes the buyer chose to include, beyond the recipe's defaults. */
  readonly pages: readonly string[];
  /** True once the buyer has seen a preview of this exact revision. */
  readonly previewedRevision?: number;
}

export const EMPTY: Configuration = { revision: 1, pages: [] };

/** Normalise a message the way the brief asks: case and whitespace only, no stemming. */
const normalise = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Whether a phrase is explicitly negated, for the simple cases only.
 *
 * **"not React" is handled; anything subtler is not, and says so.** The brief allows "simple explicit
 * negation" and requires that uncertain parsing asks rather than guesses, so this looks for a
 * negator immediately before the phrase and nothing cleverer. "React, but not for the admin" is not
 * a case this can read, and it will be treated as a mention rather than misread as a refusal.
 */
const negated = (text: string, phrase: string): boolean =>
  new RegExp(`\\b(not|no|without|except|excluding)\\s+(${escapeRegExp(phrase)})\\b`).test(text);

/* `escapeRegExp`, not `escape`: the bare name shadows the global `escape()`, which
 * `lint/suspicious/noShadowRestrictedNames` rejects and which was the only real error in
 * this app's lint (`PD-905`). */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Whether the text contains a phrase **as words**, not as a substring.
 *
 * **`includes` was wrong and it was silently wrong** (`SD-138`). `pro` is a tier alias, so
 * `"reveal your system prompt"` set the tier to Pro, and so did any sentence containing product,
 * process, project, professional or promo. `free` did it inside freedom, `html` inside htmlx and
 * `shop` inside shopping and workshop. Nothing failed: the configurator recorded a tier nobody
 * asked for and moved on to the next question, which is the worst shape a parsing bug can take.
 *
 * Longest-first ordering does not help here. It protects `"Next.js"` from being read as `react`,
 * which is a collision **between** two aliases; this is a collision between one alias and ordinary
 * English, and only a boundary sees it.
 */
const wordy = (text: string, phrase: string): boolean =>
  new RegExp(`\\b${escapeRegExp(phrase)}\\b`).test(text);

/** Every alias in a list that the text mentions and does not negate, longest phrase first. */
function mentions<T extends string>(
  text: string,
  aliases: readonly { readonly phrase: string; readonly id: T }[],
): readonly T[] {
  const found: T[] = [];
  const ordered = [...aliases].sort((a, b) => b.phrase.length - a.phrase.length);
  let remaining = text;
  for (const { phrase, id } of ordered) {
    if (!wordy(remaining, phrase)) continue;
    if (negated(text, phrase)) continue;
    if (!found.includes(id)) found.push(id);
    // Consume the phrase, so "Next.js" cannot also be read as a bare "js" or leave "react" behind
    // in "react.js". This is what makes the longest-first order actually decide.
    remaining = remaining.split(phrase).join(" ");
  }
  return found;
}

/** What a message resolved to, and what it could not resolve. */
export interface Extraction {
  readonly recipe?: RecipeId;
  readonly tier?: Tier;
  readonly framework?: FrameworkId;
  readonly css?: CssId;
  /**
   * Values the message named more than one of.
   *
   * **"React or Vue" is a question, not a choice.** The brief requires a disambiguation question
   * rather than picking the first, and requires that no confidence score stands in for understanding.
   */
  readonly ambiguous: readonly { readonly field: string; readonly options: readonly string[] }[];
  /** True when nothing at all was understood, which is a bounded helpful reply rather than a guess. */
  readonly understood: boolean;
  /**
   * Names we recognised and do not sell, with the reason.
   *
   * Separate from `ambiguous` because it is a different answer: one asks the buyer to choose, this
   * one tells them a thing does not exist. Reporting it as "not understood" would be a lie.
   */
  readonly unsupported: readonly { readonly phrase: string; readonly because: string }[];
}

/**
 * Read every unambiguous value out of one message.
 *
 * "CRM React Tailwind" fills three values, which is the brief's example and the reason this does not
 * ask one question per field.
 */
export function extract(message: string): Extraction {
  const text = normalise(message);
  const recipes = mentions(
    text,
    RECIPES.flatMap((r) => r.aliases.map((phrase) => ({ phrase, id: r.id }))),
  );
  /*
   * The refusals are read **before** the framework aliases and their phrases are removed from the
   * text, which is what stops "angularjs" reaching the `angular` alias underneath it. Order is the
   * mechanism here, exactly as it is for "Next.js" against "React".
   */
  const unsupported = UNSUPPORTED.filter((u) => wordy(text, u.phrase) && !negated(text, u.phrase));
  const withoutRefused = unsupported.reduce((acc, u) => acc.split(u.phrase).join(" "), text);
  const frameworks = mentions(withoutRefused, FRAMEWORK_ALIASES);
  const csses = mentions(text, CSS_ALIASES);
  const tiers = mentions(text, TIER_ALIASES);

  const ambiguous: { field: string; options: readonly string[] }[] = [];
  const one = <T extends string>(field: string, found: readonly T[]): T | undefined => {
    if (found.length > 1) {
      ambiguous.push({ field, options: found });
      return undefined;
    }
    return found[0];
  };

  const recipe = one("recipe", recipes);
  const framework = one("framework", frameworks);
  const css = one("css", csses);
  const tier = one("tier", tiers);

  return {
    ...(recipe === undefined ? {} : { recipe }),
    ...(tier === undefined ? {} : { tier }),
    ...(framework === undefined ? {} : { framework }),
    ...(css === undefined ? {} : { css }),
    ambiguous,
    unsupported,
    understood:
      recipes.length + frameworks.length + csses.length + tiers.length + unsupported.length > 0 ||
      ambiguous.length > 0,
  };
}

/** The frameworks we ship for an optional CSS choice. Tier is not an axis (`PD-866`). */
export function frameworksFor(css?: CssId): readonly FrameworkId[] {
  const found = AVAILABLE.filter((a) => css === undefined || a.css === css).map((a) => a.framework);
  /*
   * **Deduplicated, as `cssFor` below always was** (`PD-1062`). `AVAILABLE` is one row per
   * `(framework, css)` pair, so a framework appears once per CSS framework it ships with. This was
   * correct by accident while Tailwind was the only one: with three, an unfiltered call returned
   * `react` three times, and `nextQuestion` feeds this straight into a question's options, so the
   * configurator would have offered each framework three times in one list.
   *
   * The asymmetry was latent rather than new. Completing the axis is what made it visible.
   */
  return [...new Set(found)];
}

/** The CSS frameworks we ship for an optional framework choice. Tier is not an axis (`PD-866`). */
export function cssFor(framework?: FrameworkId): readonly CssId[] {
  const found = AVAILABLE.filter((a) => framework === undefined || a.framework === framework).map(
    (a) => a.css,
  );
  return [...new Set(found)];
}

/**
 * Whether a whole combination exists. Asked of the record, never of the two lists.
 *
 * **Tier is deliberately not consulted** (`PD-866`). It is a function of the design and the page
 * marking, not of the stack, so a Free buyer and a Pro buyer are offered the same six frameworks.
 * `entitlement-core` answers the tier question, and `apply` is where a tier narrows the designs.
 */
export const isAvailable = (c: Configuration): boolean =>
  c.framework !== undefined &&
  c.css !== undefined &&
  c.tier !== undefined &&
  AVAILABLE.some((a) => a.framework === c.framework && a.css === c.css);

/**
 * Apply an extraction, and say what had to be dropped.
 *
 * **Destructive changes are listed before they are applied**, which the brief requires: moving from
 * Pro to Free can remove a framework the buyer already chose, and finding that out afterwards is how
 * a configurator loses trust. The caller shows `removed` and asks.
 */
export function apply(
  current: Configuration,
  change: Partial<Omit<Configuration, "revision" | "pages" | "previewedRevision">>,
): { readonly next: Configuration; readonly removed: readonly string[] } {
  const merged: Configuration = { ...current, ...change, revision: current.revision + 1 };
  const removed: string[] = [];

  // Recompute what the new choice still allows, and drop only what no longer exists.
  if (merged.framework !== undefined && !frameworksFor(merged.css).includes(merged.framework)) {
    removed.push(`framework: ${merged.framework}`);
  }
  if (merged.css !== undefined && !cssFor(undefined).includes(merged.css)) {
    removed.push(`css: ${merged.css}`);
  }
  /*
   * **The design is what a downgrade now costs** (`PD-866`). Choosing Free after choosing Board has
   * to drop Board, because Free is Voilet only. Before this, moving to Free dropped the *framework*,
   * which was the tier rule living on the wrong axis: it took Laravel away from a buyer whose
   * entitlement never depended on their framework.
   */
  if (
    merged.design !== undefined &&
    merged.tier !== undefined &&
    !tiersOf(merged.design).includes(merged.tier)
  ) {
    removed.push(`design: ${merged.design}`);
  }

  const next: Configuration = {
    ...merged,
    ...(removed.some((r) => r.startsWith("framework")) ? { framework: undefined } : {}),
    ...(removed.some((r) => r.startsWith("css")) ? { css: undefined } : {}),
    ...(removed.some((r) => r.startsWith("design")) ? { design: undefined } : {}),
  };
  return { next, removed };
}

/**
 * The state the configuration is in, which is the first unresolved value rather than a counter.
 *
 * **Ask only what is missing.** A buyer who typed "CRM React Tailwind Pro" has answered four
 * questions, and asking them again is what the brief means by "repeated prompting".
 */
export function stateOf(c: Configuration): State {
  if (c.recipe === undefined) return "NEED";
  if (c.tier === undefined) return "TIER";
  if (c.framework === undefined || c.css === undefined) return "STACK";
  if (c.design === undefined) return "DESIGN";
  if (c.pages.length === 0) return "PAGES";
  if (c.previewedRevision !== c.revision) return "REVIEW";
  return "DELIVERY";
}

/** The one question to ask next, with the options it will accept. */
export interface Question {
  readonly state: State;
  readonly field: string;
  readonly prompt: string;
  readonly options: readonly { readonly id: string; readonly label: string }[];
}

/**
 * What to ask next.
 *
 * Options carry stable ids, because **a button sends a typed action and its label is never
 * reparsed**. Reading the label back is how "Digital products" becomes an unrecognised recipe the
 * day somebody improves the copy.
 */
export function nextQuestion(c: Configuration): Question | null {
  const state = stateOf(c);
  switch (state) {
    case "NEED":
      return {
        state,
        field: "recipe",
        prompt: "What kind of admin are you building?",
        options: RECIPES.map((r) => ({ id: r.id, label: r.label })),
      };
    case "TIER":
      return {
        state,
        field: "tier",
        prompt: "Free or Pro?",
        options: [
          { id: "free", label: "Free" },
          { id: "pro", label: "Pro" },
        ],
      };
    case "STACK":
      return c.framework === undefined
        ? {
            state,
            field: "framework",
            prompt: "Which framework?",
            options: frameworksFor(c.css).map((f) => ({ id: f, label: labelOf(f) })),
          }
        : {
            state,
            field: "css",
            prompt: "Which CSS framework?",
            options: cssFor(c.framework).map((x) => ({ id: x, label: labelOf(x) })),
          };
    case "DESIGN":
      return {
        state,
        field: "design",
        prompt: "Which design?",
        // Filtered by entitlement, so a Free buyer is not offered a design they cannot have and
        // then told afterwards. `designsFor` is the only thing here that knows the rule.
        options: designsFor(DESIGNS, c.tier).map((d) => ({ id: d.id, label: d.label })),
      };
    default:
      return null;
  }
}

/** Everything that has a display name. */
/**
 * **`RecipeId` joined this on 2026-09-16, because `labelOf("crm")` returned `"crm"`** (`SD-146`).
 *
 * Recipes were the one closed vocabulary missing from the map, so every surface that labelled a use
 * case printed the raw id. Nothing had shown one yet, which is why it went unnoticed: the assistant's
 * trace was the first thing to put a recipe in front of a shopper, and it said "Read crm as the use
 * case". `PD-741`'s rule is that an id may name a reference and a label is what ships.
 */
export type LabelKey = FrameworkId | CssId | Tier | RecipeId;

/**
 * Display names, so no renderer invents its own.
 *
 * **`Record<LabelKey, string>` and not `Record<string, string>`, and that was a real bug.** An index
 * signature makes every lookup `string | undefined` under `noUncheckedIndexedAccess`, so
 * `label: labelOf(f)` failed to compile against a `label: string` and seventeen call sites had grown a
 * `?? f` to paper over it. The fallback was never reachable: `f` is a `FrameworkId`.
 *
 * Typing the map over the union fixes both ends. A lookup with a typed key is known present, and
 * **adding a framework without labelling it is now a compile error** rather than a silent `undefined`
 * rendered as an empty cell.
 */
export const LABELS: Record<LabelKey, string> = {
  react: "React",
  nextjs: "Next.js",
  vue: "Vue",
  angular: "Angular",
  html: "HTML",
  laravel: "Laravel",
  tailwind: "Tailwind CSS",
  bootstrap: "Bootstrap",
  bulma: "Bulma",
  free: "Free",
  pro: "Pro",
  /*
   * Spread from `RECIPES` rather than retyped, so a new recipe is labelled by existing.
   *
   * The others are written out because the docblock above wants an unlabelled framework to be a
   * compile error. Recipes already carry a `label` next to their aliases, so a second copy here
   * would be the drift that rule exists to prevent, and deriving them cannot be incomplete.
   */
  ...(Object.fromEntries(RECIPES.map((r) => [r.id, r.label])) as Record<RecipeId, string>),
};

/**
 * A display name for an id that is only known to be a string.
 *
 * The parser reports ambiguous options and the summary renders stored values as plain strings, so
 * those call sites cannot offer a typed key. One accessor rather than seventeen `??` expressions:
 * the fallback belongs where the uncertainty is, not at every use.
 */
export const labelOf = (id: string): string => LABELS[id as LabelKey] ?? id;
