import type { Metadata } from "next";

import { accentAt, BODY_2, BODY_3, FONT, H2, LEAD, SECTION } from "../_components/type";

/**
 * `/standards`: the page that answers "why buy this rather than the free one" (`SD-225`).
 *
 * **A screenshot cannot answer the three questions a serious buyer asks** — is it accessible, will
 * an update break my build, is it maintained — and we can answer all three with a command. That is
 * the selling point and the reason this page exists rather than a paragraph on the home page.
 *
 * **Three rules a review may reject this page for** (`PD-1235`):
 *
 *  1. **Built to, never certified.** There is no certification scheme for 29148, 9241 or 25010, and
 *     no IEEE or ISO mark appears here. A false certification claim attracts a complaint.
 *  2. **Every clause maps to a row in `odin/engineering/STANDARDS.md`.** A claim with no mechanism
 *     behind it cannot appear on this page.
 *  3. **No numeric claim without its basis.** Which is why the five-minute generation figure is
 *     absent: `B-36` has not measured it yet.
 *
 * **The contrast ratios below are computed, not quoted.** Each is the WCAG 2.2 relative-luminance
 * ratio of two tokens in `@viliha/vui-tokens/store.css`, and `SD-226` is what the measurement
 * found: the card edge at 1.57:1 was being used as the boundary of five controls, where 1.4.11 asks
 * for 3:1. That is why `--store-control-border` exists.
 */

export const metadata: Metadata = {
  title: "Standards",
  description:
    "How Voilet themes are built: requirements to ISO/IEC/IEEE 29148, interfaces to WCAG 2.2 AA and ISO 9241, quality measured against ISO/IEC 25010, and releases versioned to SemVer 2.0.0.",
};

/** The three questions a screenshot cannot answer, with the evidence for each. */
const QUESTIONS = [
  {
    q: "Is it accessible?",
    a: "Every shipped screen is built to WCAG 2.2 level AA, and the colour contrast is measured rather than assumed. The ratios are below, computed from the tokens the theme actually renders with.",
    proof: "49 design-consistency cases, plus an accessibility pass over every route",
  },
  {
    q: "Will an update break my build?",
    a: "Releases are versioned to Semantic Versioning 2.0.0, and your licence is enforced on the major. You own the major you bought: every patch and minor inside it, for as long as you want it. A new major is a new decision, never a surprise.",
    proof: "Entitlement is checked against the release's parsed major, not a date",
  },
  {
    q: "Is it maintained?",
    a: "Every change runs a gate of 69 automated checks before it lands, and the result is written to a log in the repository rather than claimed in a changelog. Defects are classified, and each class has a probe you can run.",
    proof: "Twelve defect classes, each with a runnable probe",
  },
] as const;

/** What we claim, and what keeps it true. Each row mirrors `odin/engineering/STANDARDS.md`. */
const STANDARDS = [
  {
    name: "ISO/IEC/IEEE 29148",
    scope: "Requirements engineering",
    claim:
      "Every requirement is a single, verifiable statement with a stated source and its own acceptance check.",
  },
  {
    name: "WCAG 2.2 level AA",
    scope: "Interface accessibility",
    claim:
      "Contrast, focus visibility, target size and keyboard operation, on every shipped screen.",
  },
  {
    name: "ISO 9241-110 and -112",
    scope: "Interaction and presentation",
    claim:
      "Controls behave the same way in every edition, because the class strings come from one shared source.",
  },
  {
    name: "ISO/IEC 25010",
    scope: "Product quality model",
    claim:
      "Functional suitability, reliability and maintainability are measured by the gate, not asserted.",
  },
  {
    name: "Semantic Versioning 2.0.0",
    scope: "Releases",
    claim: "A major means a breaking change, and that is what your licence is enforced on.",
  },
] as const;

/**
 * Measured with the WCAG 2.2 relative-luminance formula against the tokens named.
 *
 * **Recomputed when a token moves, not maintained by hand.** If a colour changes and this table does
 * not, it becomes the thing `BO-08` and `R-28` exist to prevent: a number nobody derived.
 */
const CONTRAST = [
  {
    pair: "Body text on white",
    tokens: "neutral-100 on #ffffff",
    ratio: "19.56:1",
    needs: "4.5:1",
  },
  {
    pair: "Body text on the page",
    tokens: "neutral-100 on page ground",
    ratio: "18.75:1",
    needs: "4.5:1",
  },
  { pair: "Secondary text", tokens: "neutral-80 on #ffffff", ratio: "6.58:1", needs: "4.5:1" },
  {
    pair: "Primary button label",
    tokens: "#ffffff on primary-40",
    ratio: "5.78:1",
    needs: "4.5:1",
  },
  {
    pair: "Primary button, hover",
    tokens: "#ffffff on primary-50",
    ratio: "6.80:1",
    needs: "4.5:1",
  },
  {
    pair: "Links and the focus ring",
    tokens: "primary-40 on #ffffff",
    ratio: "5.78:1",
    needs: "4.5:1",
  },
  {
    pair: "Control boundaries",
    tokens: "control-border on #ffffff",
    ratio: "3.69:1",
    needs: "3:1",
  },
] as const;

/** Stated plainly, because the refusals are the part a buyer can check. */
const NOT_CLAIMED = [
  {
    title: "We are not IEEE or ISO certified",
    body: "There is no certification scheme for these standards. They are specifications you build to, and that is what we say: built to, never certified. You will find no IEEE or ISO mark on this site.",
  },
  {
    title: "We cannot certify what you build on top",
    body: "Our screens are AA. If you replace our tokens with a palette that fails contrast, that failure is real and we cannot prevent it. Every theme ships with its measured ratios so you start from a passing baseline and can see when you have left it.",
  },
  {
    title: "We publish no speed claim we have not measured",
    body: "Generation time is measured from an approved recipe entering the queue to a validated artifact, with queue time counted separately. Until that number is measured and reproducible, it does not appear on this page.",
  },
] as const;

/*
 * **Presentation only below this line** (2026-10-09). The page now lives at `/pricing` and wears the
 * home page's look: the site's glow and the moving gradient headline, every card and table in the
 * same frosted glass (`GLASS_SURFACE`), and the `tn-rise` / `tn-reveal` entrances. Every sentence,
 * number and row above is unchanged and still the source of the text.
 *
 * **Responsive** (`CLAUDE.md`): from `md` the two tables are tables; below `md` each row becomes a
 * stacked card, so the measured ratio, the evidence, is never scrolled off a phone's screen.
 */
const TH = `${BODY_2} px-[16px] py-[12px] text-left font-semibold text-[var(--store-neutral-100)]`;
const TD = `${BODY_2} px-[16px] py-[14px] align-top`;
/** Frosted glass over the site's glow: every card and table on the page is one of these. */
const GLASS_SURFACE =
  "relative overflow-hidden rounded-[12px] border border-white/70 bg-gradient-to-br from-white/60 to-white/25 shadow-[inset_0_1px_0_#ffffffcc,0_8px_24px_-12px_#7c3aed59] backdrop-blur-xl backdrop-saturate-150";
/** The question and "do not claim" cards: the surface, laid out as a column. */
const GLASS = `tn-reveal ${GLASS_SURFACE} flex flex-col gap-[8px] p-[12px]`;
/**
 * A table's header: the accent tints left to right, at 80% so the glass still shows through. Row
 * lines stay in the glass's own white rather than grey.
 */
const GLASS_HEAD =
  "bg-gradient-to-r from-[var(--tn-accent-violet-soft)]/80 via-[var(--tn-accent-blue-soft)]/80 to-[var(--tn-accent-pink-soft)]/80";
const GLASS_ROW = "border-t border-white/70 transition-colors duration-150 hover:bg-white/40";
const SHEEN =
  "pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/50 to-transparent";

export default function StandardsPage() {
  return (
    /* The background (`Aurora`, `ScatterGlow`) is the root layout's, behind every page. */
    <div className="pb-[var(--tn-space-3xl)]">

      <section className={`${SECTION} pt-[var(--tn-space-xl)]`}>
        <h1
          className={`${FONT} tn-rise text-[length:var(--store-headline-11)] font-extrabold leading-[1.3] lg:text-[length:var(--store-headline-9)]`}
          style={{ ["--i" as string]: 0 }}
        >
          <span className="tn-gradient-text">Built to standards you can check</span>
        </h1>
        <p
          className={`${LEAD} tn-rise mt-[var(--tn-space-2xs)] max-w-[760px]`}
          style={{ ["--i" as string]: 1 }}
        >
          Anyone can show you a screenshot. These are the three questions a screenshot cannot
          answer, and the evidence for each.
        </p>
      </section>

      {/* The three questions, as accent cards in the style of the home page's `Capabilities`. */}
      <section className={`${SECTION} mt-[var(--tn-space-lg)]`}>
        <ul className="grid w-full max-w-[1100px] grid-cols-1 gap-[var(--tn-space-xs)] text-left md:grid-cols-3">
          {QUESTIONS.map((item, i) => (
            <li
              key={item.q}
              className={GLASS}
              style={{ ["--i" as string]: i }}
            >
              {/* Glass sheen: a soft light across the top edge, decoration only. */}
              <span aria-hidden="true" className={SHEEN} />
              <h2
                className={`${FONT} text-[length:var(--store-headline-12)] font-semibold leading-[1.4] text-[var(--store-neutral-100)]`}
              >
                {item.q}
              </h2>
              <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>{item.a}</p>
              <p
                className={`${BODY_2} mt-auto border-t border-white/70 pt-[8px] font-medium text-[var(--store-primary-50)]`}
              >
                {item.proof}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${SECTION} mt-[var(--tn-space-3xl)]`}>
        <h2 className={`${H2} tn-reveal`}>What we build to</h2>
        <p
          className={`${BODY_2} tn-reveal mt-[var(--tn-space-2xs)] max-w-[700px] text-[var(--store-neutral-80)]`}
        >
          Each line is a specification we work to, and each one has a check in our pipeline that
          fails when we stop.
        </p>
        <div className="mt-[var(--tn-space-sm)] w-full max-w-[1000px]">
          {/* From `md`: a table in a card. */}
          <div className={`${GLASS_SURFACE} tn-reveal hidden md:block`}>
            <span aria-hidden="true" className={SHEEN} />
            <table className={`${FONT} w-full border-collapse`}>
              <thead className={GLASS_HEAD}>
                <tr>
                  <th className={TH}>Standard</th>
                  <th className={TH}>Scope</th>
                  <th className={TH}>What it means for your download</th>
                </tr>
              </thead>
              <tbody>
                {STANDARDS.map((row, i) => (
                  <tr key={row.name} className={GLASS_ROW}>
                    <td className={`${TD} font-semibold text-[var(--store-neutral-100)]`}>
                      <span className="flex items-start gap-[8px] text-left">
                        <span aria-hidden="true" className={`${accentAt(i).solid} mt-[7px] size-[8px] shrink-0 rounded-full`} />
                        {row.name}
                      </span>
                    </td>
                    <td className={`${TD} text-left text-[var(--store-neutral-80)]`}>{row.scope}</td>
                    <td className={`${TD} text-left text-[var(--store-neutral-100)]`}>{row.claim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Below `md`: one card per standard. */}
          <ul className="flex flex-col gap-[var(--tn-space-xs)] text-left md:hidden">
            {STANDARDS.map((row, i) => (
              <li key={row.name} className={`${GLASS_SURFACE} tn-reveal flex flex-col gap-[6px] p-[var(--tn-space-xs)]`}>
                <span aria-hidden="true" className={SHEEN} />
                <span className={`${FONT} flex items-center gap-[8px] text-[length:var(--store-body-1)] font-semibold text-[var(--store-neutral-100)]`}>
                  <span aria-hidden="true" className={`${accentAt(i).solid} size-[8px] shrink-0 rounded-full`} />
                  {row.name}
                </span>
                <span className={`${BODY_3} ${accentAt(i).soft} ${accentAt(i).ink} w-fit rounded-full px-[10px] py-[2px] font-medium`}>
                  {row.scope}
                </span>
                <span className={`${BODY_2} text-[var(--store-neutral-100)]`}>{row.claim}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${SECTION} mt-[var(--tn-space-3xl)]`}>
        <h2 className={`${H2} tn-reveal`}>The contrast, measured</h2>
        <p
          className={`${BODY_2} tn-reveal mt-[var(--tn-space-2xs)] max-w-[700px] text-[var(--store-neutral-80)]`}
        >
          Computed from the tokens this theme renders with, using the WCAG 2.2 relative-luminance
          formula. Not sampled from a screenshot, and not rounded in our favour.
        </p>
        <div className="mt-[var(--tn-space-sm)] w-full max-w-[1000px]">
          <div className={`${GLASS_SURFACE} tn-reveal hidden md:block`}>
            <span aria-hidden="true" className={SHEEN} />
            <table className={`${FONT} w-full border-collapse`}>
              <thead className={GLASS_HEAD}>
                <tr>
                  <th className={TH}>Pair</th>
                  <th className={TH}>Tokens</th>
                  <th className={TH}>Measured</th>
                  <th className={TH}>AA requires</th>
                </tr>
              </thead>
              <tbody>
                {CONTRAST.map((row) => (
                  <tr key={row.pair} className={GLASS_ROW}>
                    <td className={`${TD} text-left text-[var(--store-neutral-100)]`}>{row.pair}</td>
                    <td className={`${TD} text-left font-[family-name:var(--store-font-mono)] text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>
                      {row.tokens}
                    </td>
                    <td className={`${TD} text-left`}>
                      <span className="rounded-full bg-[var(--tn-accent-teal-soft)] px-[10px] py-[3px] font-semibold text-[var(--tn-accent-teal-ink)]">
                        {row.ratio}
                      </span>
                    </td>
                    <td className={`${TD} text-left text-[var(--store-neutral-80)]`}>{row.needs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-[var(--tn-space-xs)] text-left md:hidden">
            {CONTRAST.map((row) => (
              <li key={row.pair} className={`${GLASS_SURFACE} tn-reveal flex items-start justify-between gap-[12px] p-[var(--tn-space-xs)]`}>
                <span aria-hidden="true" className={SHEEN} />
                <span className="flex min-w-0 flex-col gap-[4px]">
                  <span className={`${BODY_2} font-semibold text-[var(--store-neutral-100)]`}>{row.pair}</span>
                  <span className={`${BODY_3} font-[family-name:var(--store-font-mono)] text-[var(--store-neutral-80)]`}>
                    {row.tokens}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-[4px]">
                  <span className={`${BODY_2} rounded-full bg-[var(--tn-accent-teal-soft)] px-[10px] py-[3px] font-semibold text-[var(--tn-accent-teal-ink)]`}>
                    {row.ratio}
                  </span>
                  <span className={`${BODY_3} text-[var(--store-neutral-80)]`}>
                    AA requires {row.needs}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${SECTION} mt-[var(--tn-space-3xl)]`}>
        <h2 className={`${H2} tn-reveal`}>What we do not claim</h2>
        <p
          className={`${BODY_2} tn-reveal mt-[var(--tn-space-2xs)] max-w-[700px] text-[var(--store-neutral-80)]`}
        >
          The refusals are the part you can check, so they are on the same page as the claims rather
          than in a footnote.
        </p>
        <ul className="mt-[var(--tn-space-sm)] grid w-full max-w-[1000px] grid-cols-1 gap-[var(--tn-space-xs)] text-left md:grid-cols-3">
          {NOT_CLAIMED.map((item, i) => (
            <li key={item.title} className={GLASS} style={{ ["--i" as string]: i }}>
              <span aria-hidden="true" className={SHEEN} />
              <h3
                className={`${FONT} text-[length:var(--store-body-1)] font-semibold leading-[1.4] text-[var(--store-neutral-100)]`}
              >
                {item.title}
              </h3>
              <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
