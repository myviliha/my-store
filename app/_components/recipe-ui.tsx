"use client";

import { Check, Edit as Pencil } from "@/app/_vendor/icons";
import Link from "next/link";
import { useId, useState } from "react";

import type { CssId, FrameworkId } from "@/src/configurator-core";
import { labelOf } from "@/src/configurator-core";
import { THEMES } from "@/src/data/themes";

import {
  CSS_SYSTEMS,
  designsForVibe,
  FRAMEWORKS,
  includedPages,
  isAvailable,
  pagesOf,
  RECOMMENDED,
  type Recipe,
  REOPEN,
  type Step,
  swatchOf,
  USE_CASES,
  useCaseOf,
  VIBES,
  vibeOf,
} from "./recipe";
import { setAuth, unlocksPro, useUser } from "./auth-store";
import { useOpenPricing } from "./panel-store";
import { BODY_2, BODY_3, BUTTON_PRIMARY, BUTTON_SECONDARY, FONT } from "./type";

/**
 * The controls the conversation puts inside its own messages (brief § 3: "Put choices, theme cards,
 * page lists, results and next actions directly in the conversation").
 *
 * **One component per step of `nextStep`**, each given the recipe as it was when the question was
 * asked and, once answered, as it was after. **Only the newest question is live**: earlier ones stay
 * on the page as a record, their controls disabled and the choice that was made still marked, so a
 * reader scrolling back sees what they picked rather than a row of buttons that no longer do
 * anything. Changing an earlier answer is the summary's job, through its Change links.
 *
 * An answer is reported as a patch to the recipe plus the words to echo as the reader's own message,
 * which is what the reference does ("Recommend a setup" appears on the right as if typed).
 */

export interface Answer {
  readonly patch: Partial<Recipe>;
  /** What the reader "said" by clicking, shown as their message. */
  readonly echo: string;
}

/* Choices are buttons of the shared scale (`btn` in `globals.css`); chosen, they take the brand tint. */
const CHIP = "btn btn-md disabled:cursor-default";
const CHIP_OFF = "btn-secondary";
const CHIP_ON =
  "border-[var(--store-primary-40)] bg-[var(--store-primary-10)] text-[var(--store-primary-40)]";
const CARD =
  "rounded-[14px] border border-[var(--store-card-border)] bg-white p-[14px] text-left transition-[border-color,box-shadow] duration-150";

export function TierBadge({ tier }: { tier: "free" | "pro" }) {
  return tier === "free" ? (
    <span className={`${BODY_3} rounded-full bg-[var(--tn-accent-teal-soft)] px-[8px] py-[1px] font-semibold text-[var(--tn-accent-teal-ink)]`}>
      Free
    </span>
  ) : (
    <span className={`${BODY_3} rounded-full border border-[var(--tn-accent-violet-solid)] bg-[var(--store-neutral-100)] px-[8px] py-[1px] font-semibold text-white`}>
      Pro
    </span>
  );
}

/** A version the engineering team has not confirmed yet. The brief: mark missing data as a placeholder. */
function Tbc() {
  return (
    <span
      title="Exact version to be confirmed by engineering"
      className={`${BODY_3} rounded-[4px] border border-dashed border-[var(--tn-accent-amber-solid)] bg-[var(--tn-accent-amber-soft)] px-[5px] font-semibold text-[var(--tn-accent-amber-ink)]`}
    >
      v TBC
    </span>
  );
}

export function StepCard({
  step,
  asked,
  answered,
  live,
  onAnswer,
  onEdit,
  onPreview,
  onDownload,
  onExplore,
}: {
  step: Step;
  /** The recipe when this question was asked. */
  asked: Recipe;
  /** The recipe after it was answered, which is what an answered card shows as chosen. */
  answered?: Recipe;
  /** Only the newest question takes input. */
  live: boolean;
  onAnswer: (answer: Answer) => void;
  /** Summary edits that are not a new turn: ticking pages, reopening a step. */
  onEdit: (next: Recipe, echo?: string) => void;
  onPreview: () => void;
  onDownload: () => void;
  /** Opens the Explore Themes panel beside the conversation. */
  onExplore: () => void;
}) {
  const shown = answered ?? asked;
  switch (step.kind) {
    case "useCase":
      return (
        <div className="flex flex-wrap gap-[8px]">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { useCase: u.id }, echo: `${u.label} admin` })}
              className={`${CHIP} ${shown.useCase === u.id ? CHIP_ON : CHIP_OFF}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      );

    case "setup":
      return (
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-wrap gap-[8px]">
            <button
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { setup: "recommended" }, echo: "Recommend a setup" })}
              className={`${CHIP} ${shown.setup === "recommended" ? CHIP_ON : CHIP_OFF}`}
            >
              Recommend a setup
            </button>
            <button
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { setup: "own" }, echo: "I'll choose my own stack" })}
              className={`${CHIP} ${shown.setup === "own" ? CHIP_ON : CHIP_OFF}`}
            >
              I&apos;ll choose my own stack
            </button>
          </div>
          <p className={`${BODY_3} text-[var(--store-neutral-80)]`}>
            Not sure? The recommended setup works out of the box, and you can change it any time.
          </p>
        </div>
      );

    case "recommend": {
      /* **A CSS system the reader already named is kept**: the recommendation is Next.js, on their
         CSS if they gave one, and Tailwind only when they did not. Swapping "bootstrap" for
         Tailwind because they asked for a recommendation would be overriding a choice they made. */
      const css = asked.css ?? RECOMMENDED.css;
      return (
        <div className={`${CARD} flex flex-col gap-[8px]`}>
          <span className={`${BODY_3} inline-flex w-fit items-center gap-[4px] rounded-full bg-[var(--store-primary-10)] px-[8px] py-[2px] font-semibold text-[var(--store-primary-40)]`}>
            ✦ Recommended for getting started
          </span>
          <p className={`${FONT} text-[18px] font-bold text-[var(--store-neutral-100)]`}>
            {labelOf(RECOMMENDED.framework)} + {labelOf(css)}
          </p>
          <p className={`${BODY_2} flex flex-wrap items-center gap-[6px] text-[var(--store-neutral-80)]`}>
            {labelOf(RECOMMENDED.framework)} <Tbc /> <span className="ms-[6px]">{labelOf(css)}</span> <Tbc />
          </p>
          <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>
            Editable source code and a step-by-step setup guide.
          </p>
          <div className="mt-[4px] flex flex-wrap gap-[8px]">
            <button
              type="button"
              disabled={!live}
              onClick={() =>
                onAnswer({
                  patch: { framework: RECOMMENDED.framework, css },
                  echo: "Use this setup",
                })
              }
              className={BUTTON_PRIMARY}
            >
              <Check width={16} height={16} aria-hidden /> Use this setup
            </button>
            <button
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { setup: "own" }, echo: "Change the setup" })}
              className={BUTTON_SECONDARY}
            >
              <Pencil width={14} height={14} aria-hidden /> Change
            </button>
          </div>
        </div>
      );
    }

    case "stack":
      return <StackPicker recipe={shown} live={live} onAnswer={onAnswer} />;

    case "vibe":
      return <VibePicker recipe={shown} live={live} onAnswer={onAnswer} onExplore={onExplore} />;

    case "tier":
      return <TierPicker recipe={shown} live={live} onAnswer={onAnswer} />;

    case "tierConflict":
      return (
        <div className="flex flex-wrap gap-[8px]">
          <button
            type="button"
            disabled={!live}
            onClick={() => onAnswer({ patch: { css: "tailwind" }, echo: "Switch to Tailwind CSS" })}
            className={CHIP}
          >
            Switch to Tailwind CSS (stay Free)
          </button>
          <button
            type="button"
            disabled={!live}
            onClick={() =>
              onAnswer({ patch: { tier: "pro" }, echo: `Keep ${labelOf(asked.css ?? "")} with Pro` })
            }
            className={CHIP}
          >
            Keep {labelOf(asked.css ?? "")}, use Pro
          </button>
        </div>
      );

    case "design":
      return <DesignPicker recipe={shown} live={live} onAnswer={onAnswer} />;

    case "summary":
      return (
        <Summary
          recipe={shown}
          live={live}
          onEdit={onEdit}
          onPreview={onPreview}
          onDownload={onDownload}
        />
      );
  }
}

/** § 5's "Developers can directly choose": six frameworks, a CSS row, and AngularJS named as not offered. */
function StackPicker({
  recipe,
  live,
  onAnswer,
}: {
  recipe: Recipe;
  live: boolean;
  onAnswer: (a: Answer) => void;
}) {
  const [framework, setFramework] = useState<FrameworkId | undefined>(recipe.framework);
  const [css, setCss] = useState<CssId>(recipe.css ?? "tailwind");
  const name = useId();
  const ready = framework !== undefined && isAvailable(framework, css);

  return (
    <div className="flex flex-col gap-[10px]">
      <fieldset className="flex flex-col gap-[6px]" disabled={!live}>
        <legend className="sr-only">Framework</legend>
        {FRAMEWORKS.map((f) => (
          <label
            key={f.id}
            className={`${CARD} flex cursor-pointer items-center gap-[10px] py-[10px] has-[:checked]:border-[var(--store-primary-40)] has-[:checked]:bg-[var(--store-primary-10)] has-[:disabled]:cursor-default`}
          >
            <input
              type="radio"
              name={name}
              checked={framework === f.id}
              onChange={() => setFramework(f.id)}
              className="size-[16px] accent-[var(--store-primary-40)]"
            />
            <span className="flex flex-col">
              <span className={`${BODY_2} flex items-center gap-[6px] font-semibold text-[var(--store-neutral-100)]`}>
                {labelOf(f.id)} <Tbc />
              </span>
              <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>{f.note}</span>
            </span>
          </label>
        ))}
        <div
          aria-disabled="true"
          className={`${CARD} flex items-center gap-[10px] border-dashed py-[10px] opacity-70`}
        >
          <span aria-hidden="true" className="size-[16px] rounded-full border border-[var(--store-neutral-50)]" />
          <span className="flex flex-col">
            <span className={`${BODY_2} font-semibold text-[var(--store-neutral-100)]`}>AngularJS · not offered</span>
            <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>
              Legacy 1.x, a separate product from Angular
            </span>
          </span>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-[8px]">
        <span className={`${BODY_3} font-medium text-[var(--store-neutral-80)]`}>CSS framework</span>
        {CSS_SYSTEMS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={!live}
            aria-pressed={css === c}
            onClick={() => setCss(c)}
            className={`${CHIP} ${css === c ? CHIP_ON : CHIP_OFF}`}
          >
            {labelOf(c)}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!live || !ready}
        onClick={() =>
          framework &&
          onAnswer({
            patch: { framework, css, setup: "own" },
            echo: `Continue with ${labelOf(framework)} + ${labelOf(css)}`,
          })
        }
        className={`${BUTTON_PRIMARY} w-fit`}
      >
        {framework ? `Continue with ${labelOf(framework)} + ${labelOf(css)} →` : "Choose a framework"}
      </button>
    </div>
  );
}

/** § 5 step 3: "Free or Pro, with actual inclusions" — the page lists are the use case's real screens. */
function TierPicker({
  recipe,
  live,
  onAnswer,
}: {
  recipe: Recipe;
  live: boolean;
  onAnswer: (a: Answer) => void;
}) {
  const pages = pagesOf(useCaseOf(recipe.useCase));
  const free = pages.filter((p) => p.tier === "free");
  const freeDesigns = THEMES.filter((t) => t.tiers.includes("free")).length;
  const options = [
    {
      tier: "free" as const,
      title: "Free starter",
      lines: [
        `${free.length} of ${pages.length} pages`,
        `${freeDesigns} design (Voilet)`,
        "Tailwind CSS only",
      ],
      note: "No account needed to preview.",
    },
    {
      tier: "pro" as const,
      title: "Pro",
      lines: [`All ${pages.length} pages`, `${THEMES.length} designs`, "Tailwind, Bootstrap or Bulma"],
      note: "The price is shown before checkout.",
    },
  ];

  return (
    <div className="grid gap-[10px] sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.tier}
          type="button"
          disabled={!live}
          onClick={() =>
            onAnswer({ patch: { tier: o.tier }, echo: o.tier === "free" ? "Free starter" : "Pro" })
          }
          className={`${CARD} flex flex-col gap-[8px] enabled:cursor-pointer enabled:hover:border-[var(--store-primary-40)] ${recipe.tier === o.tier ? "border-[var(--store-primary-40)] bg-[var(--store-primary-10)]" : ""}`}
        >
          <span className="flex items-center justify-between gap-[8px]">
            <span className={`${FONT} text-[16px] font-bold text-[var(--store-neutral-100)]`}>{o.title}</span>
            <TierBadge tier={o.tier} />
          </span>
          <ul className={`${BODY_3} flex flex-col gap-[3px] text-[var(--store-neutral-100)]`}>
            {o.lines.map((l) => (
              <li key={l} className="flex items-center gap-[6px]">
                <Check width={14} height={14} aria-hidden className="text-[var(--tn-accent-teal-ink)]" />
                {l}
              </li>
            ))}
          </ul>
          <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>{o.note}</span>
        </button>
      ))}
    </div>
  );
}

/** Only designs this recipe may use (Free is Voilet; every one must build the chosen stack). */
/**
 * The style step, **drawn to the Figma exactly** ("AI Builder - Guest", message 849:6803): a row of
 * pill buttons 5px apart, each 39px tall with a 1px #D3D7DD border, a 17px icon tile (#C9CED6
 * border, 5px corners, the brand bar at its foot) and the label in Inter 14 at 1.2; then **Explore
 * themes**, filled brand blue with a dashed edge, a 12px grid icon and its label in Instrument Sans
 * Bold. Both icons are the design's own SVGs (`public/recipe/`), not redrawn. The greys and #111418
 * are the design's values, which no token of ours carries.
 *
 * A chosen style keeps the brand tint the other choice cards use, since the design shows no
 * selected state; hover is a brand border, as on every other chip in the conversation.
 */
const STYLE_BUTTON = "btn btn-md gap-[9px] disabled:cursor-default";
const STYLE_LABEL =
  "font-[family-name:var(--font-inter)] text-[14px] font-normal leading-[1.2] whitespace-nowrap text-[var(--store-neutral-100)]";

function VibePicker({
  recipe,
  live,
  onAnswer,
  onExplore,
}: {
  recipe: Recipe;
  live: boolean;
  onAnswer: (a: Answer) => void;
  onExplore: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-[5px]">
      {VIBES.map((v) => (
        <button
          key={v.id}
          type="button"
          disabled={!live}
          title={v.note}
          onClick={() => onAnswer({ patch: { vibe: v.id }, echo: v.label })}
          className={`${STYLE_BUTTON} ${recipe.vibe === v.id ? CHIP_ON : CHIP_OFF}`}
        >
          <span
            aria-hidden="true"
            className="relative size-[17px] shrink-0 rounded-[5px] border border-[var(--store-card-border)]"
          >
            {/* biome-ignore lint/performance/noImgElement: a 10x4 static SVG from the design */}
            <img src="/recipe/style-chip-bar.svg" alt="" width={10} height={4} className="absolute left-[3px] top-[9px] block" />
          </span>
          <span className={STYLE_LABEL}>{v.label}</span>
        </button>
      ))}
      {/* **A function button, not an answer** (2026-10-08): it only opens the Explore Themes
          drawer. It sends no message and does not move the conversation on; the style is still
          chosen with the three buttons beside it. So it stays usable on an answered question too,
          since opening the drawer changes nothing in the recipe. */}
      <button
        type="button"
        onClick={onExplore}
        className="btn btn-md btn-primary gap-[8px] border-dashed"
      >
        <span aria-hidden="true" className="relative size-[12px] shrink-0">
          {/* The design draws the grid 4.86% past its 12px box on every side (13.17px). */}
          {/* biome-ignore lint/performance/noImgElement: a 13px static SVG from the design */}
          <span className="absolute inset-[-4.86%]">
            <img src="/recipe/explore-grid.svg" alt="" width={13.1667} height={13.1667} className="block size-full max-w-none" />
          </span>
        </span>
        <span className="whitespace-nowrap font-[family-name:var(--store-font-instrument)] text-[14px] font-bold leading-normal text-white">
          Explore themes
        </span>
      </button>
    </div>
  );
}

function DesignPicker({
  recipe,
  live,
  onAnswer,
}: {
  recipe: Recipe;
  live: boolean;
  onAnswer: (a: Answer) => void;
}) {
  const { designs, outsideVibe } = designsForVibe(recipe);
  const vibe = vibeOf(recipe.vibe);
  const hidden = THEMES.length - designs.length;
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="grid gap-[8px] sm:grid-cols-2">
        {designs.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={!live}
            onClick={() => onAnswer({ patch: { design: t.id }, echo: `${t.label} design` })}
            className={`${CARD} flex items-start gap-[10px] py-[10px] enabled:cursor-pointer enabled:hover:border-[var(--store-primary-40)] ${recipe.design === t.id ? "border-[var(--store-primary-40)] bg-[var(--store-primary-10)]" : ""}`}
          >
            <span
              aria-hidden="true"
              className="mt-[2px] size-[18px] shrink-0 rounded-[6px] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--store-neutral-100)_10%,transparent)]"
              style={{ backgroundColor: swatchOf(t) }}
            />
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className={`${BODY_2} flex items-center gap-[6px] font-semibold text-[var(--store-neutral-100)]`}>
                {t.label} <TierBadge tier={t.tiers.includes("free") ? "free" : "pro"} />
              </span>
              <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>{t.purpose}</span>
            </span>
          </button>
        ))}
      </div>
      {outsideVibe && vibe ? (
        <p className={`${BODY_3} text-[var(--store-neutral-80)]`}>
          {vibe.label} designs come with Pro. On Free, Voilet is the design included; you can change
          the plan in the summary.
        </p>
      ) : recipe.tier === "free" && hidden > 0 ? (
        <p className={`${BODY_3} text-[var(--store-neutral-80)]`}>
          {hidden} more designs come with Pro.
        </p>
      ) : null}
    </div>
  );
}

/** The recipe on one card: every choice with a Change link, the editable page list, then the two actions. */
function Summary({
  recipe,
  live,
  onEdit,
  onPreview,
  onDownload,
}: {
  recipe: Recipe;
  live: boolean;
  onEdit: (next: Recipe, echo?: string) => void;
  onPreview: () => void;
  onDownload: () => void;
}) {
  /*
   * **The summary, as Figma "Message" (857:7189)** (2026-10-12, by request): a Setup badge, the
   * design with its tier, the framework and the CSS, then the pages as round check pills, each with
   * its Free or Pro badge, and Show Preview beside Download. Sizes are the design's where they match
   * the storefront's scale (14px body, 40px buttons). Changing an earlier answer is typed, or comes
   * from the steps above; the design draws no Change links.
   *
   * **Pro pages follow the account, not the recipe** (by request): a Free account sees them unticked
   * and locked, and is offered the upgrade; a Pro account can tick them (`planOf` in `auth-store.ts`).
   */
  const account = useUser();
  /* The Pro plan, or a Theme Licence for this design (bought in the demo checkout). */
  const pro = unlocksPro(account, recipe.design);
  const openPricing = useOpenPricing();
  const useCase = useCaseOf(recipe.useCase);
  const design = THEMES.find((t) => t.id === recipe.design);
  const all = pagesOf(useCase);
  const chosen = new Set(
    includedPages(recipe)
      .filter((p) => pro || p.tier === "free")
      .map((p) => p.slug),
  );
  const designFree = design?.tiers.includes("free") ?? false;
  const rows = [
    { label: "Design", value: design?.label ?? "", tier: designFree ? ("free" as const) : ("pro" as const) },
    { label: "Framework", value: labelOf(recipe.framework ?? "") },
    { label: "CSS", value: labelOf(recipe.css ?? "") },
  ];
  const locksPro = !pro && all.some((p) => p.tier === "pro");

  const toggle = (slug: string) => {
    const next = new Set(chosen);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    /* An account that unlocks Pro pages moves the recipe to the Pro plan as soon as one is ticked, or
       `includedPages` would drop it again (a Free recipe ships Free pages only). */
    const tier = pro && all.some((p) => p.tier === "pro" && next.has(p.slug)) ? "pro" : recipe.tier;
    onEdit({ ...recipe, tier, pages: all.filter((p) => next.has(p.slug)).map((p) => p.slug) });
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[11px] rounded-[15px] border border-[var(--store-card-border)] bg-white p-[16px] text-left">
        <span className={`${BODY_3} inline-flex h-[22px] w-fit items-center gap-[6px] rounded-full bg-[var(--store-primary-10)] px-[9px] font-bold text-[var(--store-primary-60)]`}>
          {/* biome-ignore lint/performance/noImgElement: the design's 10px SVG */}
          <img src="/recipe/summary-setup.svg" alt="" width={9.7} height={9.5} className="block" />
          Setup
        </span>
        <dl className="flex flex-col gap-[11px]">
          {rows.map((r) => (
            <div key={r.label} className={`${BODY_2} flex items-center justify-between gap-[8px] leading-[1.2]`}>
              <dt className="text-[var(--store-neutral-80)]">{r.label}</dt>
              <dd className="flex items-center gap-[8px] font-medium text-[var(--store-neutral-100)]">
                {r.value}
                {"tier" in r && r.tier ? <PlanBadge tier={r.tier} /> : null}
              </dd>
            </div>
          ))}
        </dl>
        <hr className="border-[var(--store-neutral-40)]" />
        <fieldset disabled={!live} className="flex flex-col gap-[11px]">
          <legend className={`${BODY_2} mb-[11px] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}>
            Included pages
          </legend>
          <div className="grid gap-[11px] sm:grid-cols-2">
            {all.map((p) => {
              const locked = !pro && p.tier === "pro";
              const on = chosen.has(p.slug);
              return (
                <label
                  key={p.slug}
                  title={locked ? "Needs a Pro account" : undefined}
                  className={`${BODY_2} flex h-[39px] items-center gap-[11px] rounded-full border border-[var(--store-neutral-50)] px-[10px] font-medium leading-[1.2] text-[var(--store-neutral-100)] ${locked ? "cursor-not-allowed bg-[var(--store-neutral-30)]" : "cursor-pointer has-[:focus-visible]:border-[var(--store-primary-40)]"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={locked}
                    onChange={() => toggle(p.slug)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border ${on ? "border-[var(--store-primary-40)] bg-[var(--store-primary-40)]" : "border-[var(--store-control-border)] bg-white"}`}
                  >
                    {on ? (
                      /* biome-ignore lint/performance/noImgElement: the design's 8px SVG */
                      <img src="/recipe/summary-check.svg" alt="" width={7.83399} height={5.85462} className="block" />
                    ) : null}
                  </span>
                  <span className="min-w-0 truncate">{p.title}</span>
                  <PlanBadge tier={p.tier} />
                </label>
              );
            })}
          </div>
        </fieldset>
        {locksPro ? (
          /* A Free account is offered the upgrade, never pushed (by request): the pricing panel opens
             beside the conversation (`panel-store.ts`). */
          <div className="flex flex-wrap items-center justify-between gap-[8px] rounded-[12px] bg-[var(--store-primary-10)] px-[12px] py-[10px]">
            <p className={`${BODY_3} text-[var(--store-neutral-100)]`}>Pro pages unlock with a Pro account.</p>
            <button
              type="button"
              onClick={openPricing}
              className="btn btn-sm btn-primary"
            >
              {/* biome-ignore lint/performance/noImgElement: the design's crown */}
              <img src="/recipe/summary-crown.svg" alt="" width={13.1254} height={10.0637} className="block brightness-0 invert" />
              Upgrade to Pro
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-[12px]">
        <button
          type="button"
          onClick={onPreview}
          disabled={chosen.size === 0}
          className="btn btn-lg btn-outline min-w-0 flex-1"
        >
          Show Preview
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={chosen.size === 0}
          className="btn btn-lg btn-primary min-w-0 flex-1"
        >
          Download
        </button>
      </div>
    </div>
  );
}

/** The design's tier badges: Free with a green dot, Pro with a crown (Figma 857:7248, 857:7302). */
function PlanBadge({ tier }: { tier: "free" | "pro" }) {
  return tier === "free" ? (
    <span className={`${BODY_3} inline-flex h-[22px] shrink-0 items-center gap-[6px] rounded-full bg-[var(--store-success-10)] px-[9px] font-bold text-[var(--store-success-50)]`}>
      {/* biome-ignore lint/performance/noImgElement: the design's 8px dot */}
      <img src="/recipe/summary-dot.svg" alt="" width={8} height={8} className="block" />
      Free
    </span>
  ) : (
    <span className={`${BODY_3} inline-flex h-[22px] shrink-0 items-center gap-[6px] rounded-full bg-[var(--store-primary-10)] px-[9px] font-bold text-[var(--store-primary-40)]`}>
      {/* biome-ignore lint/performance/noImgElement: the design's crown */}
      <img src="/recipe/summary-crown.svg" alt="" width={13.1254} height={10.0637} className="block" />
      Pro
    </span>
  );
}

/**
 * What Download says to a guest (§ 2, § 7, § 9): the package it would be, then that it needs an
 * account. **Sign-in is not connected in this demo and the card says so** (§ 6: "Do not portray an
 * authentication screen as implemented authentication"). A Pro recipe names the plan and links
 * pricing, which a guest may read without signing in (§ 8).
 */
export function DownloadCard({ recipe }: { recipe: Recipe }) {
  const openPricing = useOpenPricing();
  /* The package follows the account (2026-10-12): a Free account's download has no Pro pages, as
     the summary showed them locked. */
  const account = useUser();
  const pro = unlocksPro(account, recipe.design);
  const design = THEMES.find((t) => t.id === recipe.design);
  const pages = includedPages(recipe).filter((p) => pro || p.tier === "free");
  const rows = [
    ["Package", `${design?.label ?? ""} · ${useCaseOf(recipe.useCase)?.label ?? ""} admin`],
    ["Framework", labelOf(recipe.framework ?? "")],
    ["CSS", labelOf(recipe.css ?? "")],
    ["Pages", `${pages.length}: ${pages.map((p) => p.title).join(", ")}`],
    ["Licence", pro ? "Pro licence" : "Free licence"],
  ];
  return (
    <div className={`${CARD} flex flex-col gap-[10px]`}>
      <dl className="flex flex-col gap-[4px]">
        {rows.map(([k, v]) => (
          <div key={k} className={`${BODY_2} grid grid-cols-[88px_1fr] gap-[8px]`}>
            <dt className="text-[var(--store-neutral-80)]">{k}</dt>
            <dd className="font-medium text-[var(--store-neutral-100)]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-[6px] rounded-[10px] bg-[var(--tn-accent-amber-soft)] p-[10px]">
        <p className={`${BODY_2} font-semibold text-[var(--tn-accent-amber-ink)]`}>
          {account ? "Downloads aren't connected yet" : "Downloading needs an account"}
        </p>
        <p className={`${BODY_3} text-[var(--store-neutral-100)]`}>
          {account
            ? "This is a demo: the package above is what you would get, but no file is generated yet."
            : "Sign in to save this configuration and download it."}
        </p>
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {account ? null : (
          <button type="button" onClick={() => setAuth("signin")} className={BUTTON_PRIMARY}>
            Sign in to download
          </button>
        )}
        {!pro && recipe.tier === "pro" ? (
          /* Opens the pricing panel beside this conversation (`panel-store.ts`). */
          <button type="button" onClick={openPricing} className={BUTTON_SECONDARY}>
            See Plans &amp; pricing
          </button>
        ) : null}
      </div>
    </div>
  );
}
