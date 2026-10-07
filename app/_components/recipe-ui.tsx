"use client";

import { Check, Edit as Pencil } from "@/app/_vendor/icons";
import Link from "next/link";
import { useId, useState } from "react";

import type { CssId, FrameworkId } from "@/src/configurator-core";
import { labelOf } from "@/src/configurator-core";
import { THEMES } from "@/src/data/themes";

import {
  CSS_SYSTEMS,
  designsFor,
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
} from "./recipe";
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

const CHIP = `${BODY_2} inline-flex items-center gap-[6px] rounded-full border border-[var(--store-card-border)] bg-white px-[14px] py-[7px] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 enabled:cursor-pointer enabled:hover:border-[var(--store-primary-40)] enabled:hover:text-[var(--store-primary-40)] disabled:cursor-default`;
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
              className={`${CHIP} ${shown.useCase === u.id ? CHIP_ON : ""}`}
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
              className={`${CHIP} ${shown.setup === "recommended" ? CHIP_ON : ""}`}
            >
              Recommend a setup
            </button>
            <button
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { setup: "own" }, echo: "I'll choose my own stack" })}
              className={`${CHIP} ${shown.setup === "own" ? CHIP_ON : ""}`}
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
              className={`${BUTTON_PRIMARY} disabled:opacity-60`}
            >
              <Check width={16} height={16} aria-hidden /> Use this setup
            </button>
            <button
              type="button"
              disabled={!live}
              onClick={() => onAnswer({ patch: { setup: "own" }, echo: "Change the setup" })}
              className={`${BUTTON_SECONDARY} disabled:opacity-60`}
            >
              <Pencil width={14} height={14} aria-hidden /> Change
            </button>
          </div>
        </div>
      );
    }

    case "stack":
      return <StackPicker recipe={shown} live={live} onAnswer={onAnswer} />;

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
            className={`${CHIP} py-[5px] ${css === c ? CHIP_ON : ""}`}
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
        className={`${BUTTON_PRIMARY} w-fit disabled:cursor-not-allowed disabled:opacity-50`}
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
function DesignPicker({
  recipe,
  live,
  onAnswer,
}: {
  recipe: Recipe;
  live: boolean;
  onAnswer: (a: Answer) => void;
}) {
  const designs = designsFor(recipe);
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
              className="mt-[2px] size-[18px] shrink-0 rounded-[6px] shadow-[inset_0_0_0_1px_#0000001a]"
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
      {recipe.tier === "free" && hidden > 0 ? (
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
  const useCase = useCaseOf(recipe.useCase);
  const design = THEMES.find((t) => t.id === recipe.design);
  const all = pagesOf(useCase);
  const chosen = new Set(includedPages(recipe).map((p) => p.slug));
  const rows: { label: string; value: string; reopen: keyof typeof REOPEN }[] = [
    { label: "Admin", value: `${useCase?.label ?? ""} admin`, reopen: "useCase" },
    { label: "Design", value: design?.label ?? "", reopen: "design" },
    {
      label: "Stack",
      value: `${labelOf(recipe.framework ?? "")} + ${labelOf(recipe.css ?? "")}${recipe.setup === "recommended" ? " (recommended)" : ""}`,
      reopen: "stack",
    },
    { label: "Plan", value: recipe.tier === "pro" ? "Pro" : "Free", reopen: "tier" },
  ];

  const toggle = (slug: string) => {
    const next = new Set(chosen);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onEdit({ ...recipe, pages: all.filter((p) => next.has(p.slug)).map((p) => p.slug) });
  };

  return (
    <div className={`${CARD} flex flex-col gap-[12px]`}>
      <dl className="flex flex-col gap-[6px]">
        {rows.map((r) => (
          <div key={r.label} className={`${BODY_2} flex items-center justify-between gap-[8px]`}>
            <dt className="text-[var(--store-neutral-80)]">{r.label}</dt>
            <dd className="flex items-center gap-[10px] font-semibold text-[var(--store-neutral-100)]">
              {r.value}
              {r.label === "Plan" ? <TierBadge tier={recipe.tier === "pro" ? "pro" : "free"} /> : null}
              <button
                type="button"
                disabled={!live}
                onClick={() => onEdit(REOPEN[r.reopen](recipe), `Change the ${r.label.toLowerCase()}`)}
                className={`${BODY_3} font-semibold text-[var(--store-primary-40)] enabled:cursor-pointer enabled:hover:underline disabled:opacity-50`}
              >
                Change
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <fieldset disabled={!live} className="flex flex-col gap-[6px] border-t border-[var(--store-neutral-40)] pt-[10px]">
        <legend className={`${BODY_2} mb-[6px] font-semibold text-[var(--store-neutral-100)]`}>
          Included pages · {chosen.size} of {all.length}
        </legend>
        <div className="grid gap-[6px] sm:grid-cols-2">
          {all.map((p) => {
            const locked = recipe.tier !== "pro" && p.tier === "pro";
            return (
              <label
                key={p.slug}
                className={`${BODY_2} flex items-center gap-[8px] rounded-[10px] border border-[var(--store-card-border)] px-[10px] py-[7px] ${locked ? "cursor-not-allowed bg-[var(--store-neutral-30)] text-[var(--store-neutral-80)]" : "cursor-pointer"}`}
                title={locked ? "Included with Pro" : undefined}
              >
                <input
                  type="checkbox"
                  checked={chosen.has(p.slug)}
                  disabled={locked}
                  onChange={() => toggle(p.slug)}
                  className="size-[15px] accent-[var(--store-primary-40)]"
                />
                <span className="min-w-0 flex-1 truncate">{p.title}</span>
                <TierBadge tier={p.tier} />
              </label>
            );
          })}
        </div>
        {recipe.tier !== "pro" && all.some((p) => p.tier === "pro") ? (
          <p className={`${BODY_3} text-[var(--store-neutral-80)]`}>
            Pages marked Pro need the Pro plan. You'll see the price before anything is charged.
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap gap-[8px]">
        <button type="button" onClick={onPreview} disabled={chosen.size === 0} className={`${BUTTON_SECONDARY} disabled:opacity-50`}>
          Preview my admin
        </button>
        <button type="button" onClick={onDownload} disabled={chosen.size === 0} className={`${BUTTON_PRIMARY} disabled:opacity-50`}>
          Download
        </button>
      </div>
    </div>
  );
}

/**
 * What Download says to a guest (§ 2, § 7, § 9): the package it would be, then that it needs an
 * account. **Sign-in is not connected in this demo and the card says so** (§ 6: "Do not portray an
 * authentication screen as implemented authentication"). A Pro recipe names the plan and links
 * pricing, which a guest may read without signing in (§ 8).
 */
export function DownloadCard({ recipe }: { recipe: Recipe }) {
  const design = THEMES.find((t) => t.id === recipe.design);
  const pages = includedPages(recipe);
  const rows = [
    ["Package", `${design?.label ?? ""} · ${useCaseOf(recipe.useCase)?.label ?? ""} admin`],
    ["Framework", labelOf(recipe.framework ?? "")],
    ["CSS", labelOf(recipe.css ?? "")],
    ["Pages", `${pages.length}: ${pages.map((p) => p.title).join(", ")}`],
    ["Licence", recipe.tier === "pro" ? "Pro licence" : "Free licence"],
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
          Downloading needs an account
        </p>
        <p className={`${BODY_3} text-[var(--store-neutral-100)]`}>
          Sign in with Google or GitHub to save this configuration and download it.
          {recipe.tier === "pro" ? " Pro pages also need the Pro plan." : ""} Sign-in isn&apos;t
          connected in this demo, so nothing is saved or charged.
        </p>
      </div>
      <div className="flex flex-wrap gap-[8px]">
        <button type="button" disabled className={`${BUTTON_PRIMARY} cursor-not-allowed opacity-60`}>
          Sign in to download
        </button>
        {recipe.tier === "pro" ? (
          <Link href="/pricing" className={BUTTON_SECONDARY}>
            See Plans &amp; pricing
          </Link>
        ) : null}
      </div>
    </div>
  );
}
