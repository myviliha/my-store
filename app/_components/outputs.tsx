import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { STYLE_PAGES } from "@/src/data/styles";

import { BODY_3, FONT, H2, LEAD, SECTION } from "./type";

/**
 * "What types of outputs": an H2, a paragraph, then the reference's grid of icon tiles. Theirs is
 * file and destination formats; ours is what a buyer receives, by framework, CSS system and
 * artefact.
 *
 * **The tile glyph is the label's first two letters, set as text.** Drawing icons for a row of
 * frameworks would be inventing marks nobody supplied; a monogram claims nothing it cannot back.
 * The tile is 56px with the 12px label under it at 150% line height, from the reference.
 *
 * Frameworks and CSS systems are read from the same matrix the theme pages use, so this row
 * cannot list an edition that does not build.
 */
const FRAMEWORKS = [...new Set(AVAILABLE.map((row) => row.framework))].map(labelOf);
const ARTEFACTS = ["TypeScript", "Design tokens", "Zip"];
const ITEMS = [...FRAMEWORKS, ...STYLE_PAGES.map((style) => style.label), ...ARTEFACTS];

export function Outputs() {
  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <div className="tn-reveal flex max-w-[850px] flex-col gap-[var(--tn-space-2xs)]">
        <h2 className={H2}>What does Voilet generate?</h2>
        <p className={LEAD}>
          One description, delivered as a zip of source in the framework you pick, styled with the
          CSS system you pick, on the theme you pick. Nothing is hosted and nothing is locked in.
        </p>
      </div>
      <ul className="flex w-full max-w-[1000px] flex-wrap justify-center gap-[var(--tn-space-sm)]">
        {ITEMS.map((label, index) => (
          <li
            key={label}
            className="tn-reveal flex w-24 flex-col items-center gap-[var(--tn-space-2xs)] px-[var(--tn-space-2xs)] py-[10px]"
            style={{ ["--i" as string]: index % 6 }}
          >
            <span
              aria-hidden="true"
              className={`${FONT} grid size-14 place-items-center rounded-[var(--tn-radius-xl)] bg-[var(--store-primary-10)] text-[length:var(--store-body-1)] font-bold text-[var(--store-primary-40)]`}
            >
              {label.slice(0, 2)}
            </span>
            <span className={`${BODY_3} text-[var(--store-neutral-100)]`}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
