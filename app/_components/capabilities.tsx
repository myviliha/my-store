import { accentAt, BODY_2, FONT, H2, LEAD, SECTION } from "./type";

/**
 * Five capability cards, as the reference has five, in one row from desktop with a 16px gap.
 *
 * Each card is a number tile, a title and one sentence. The reference's cards carry an illustration
 * each; ours carry the step number as text, in a token-coloured tile, rather than imagery we do not
 * have. **Each card takes the next accent** for its tile, the bar along its top edge and its hover
 * border, so the five read as five things. Every sentence states something the product does and nothing it does not: **the last one
 * says it is frontend only, because discovering that after payment is a refund.**
 */
const CARDS = [
  {
    title: "On Theme",
    body: "Set colour, type and radius once. Every screen and component reads the same tokens.",
  },
  {
    title: "Six Frameworks",
    body: "The same design as HTML, React, Next.js, Angular, Vue and Laravel source.",
  },
  {
    title: "Eleven Themes",
    body: "Pick the shell that fits your product. Each theme has a page showing what builds.",
  },
  {
    title: "A Zip You Own",
    body: "Download the source and keep it. It is plain code your team can read and change.",
  },
  {
    title: "Your Backend",
    body: "Frontend only. Connect the screens to the API you already run; no server is included.",
  },
] as const;

export function Capabilities() {
  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <div className="tn-reveal flex max-w-[850px] flex-col gap-[var(--tn-space-2xs)]">
        <h2 className={H2}>Built to ship, not to preview.</h2>
        <p className={LEAD}>
          Every part of Voilet exists to get you from an idea to an admin you can run, so what you
          receive is code, not a mockup.
        </p>
      </div>
      <ul className="grid w-full max-w-[1200px] grid-cols-1 gap-[var(--tn-space-xs)] sm:grid-cols-2 lg:grid-cols-5">
        {CARDS.map((card, index) => (
          <li
            key={card.title}
            className={`tn-reveal relative flex flex-col gap-[var(--tn-space-2xs)] overflow-hidden rounded-[var(--tn-radius-2xl)] border border-[var(--store-neutral-50)] bg-white p-[var(--tn-space-sm)] text-left transition-colors duration-200 ${accentAt(index).border}`}
            style={{ ["--i" as string]: index }}
          >
            <span
              aria-hidden="true"
              className={`${accentAt(index).solid} absolute inset-x-0 top-0 h-[4px]`}
            />
            <span
              aria-hidden="true"
              className={`${FONT} ${accentAt(index).soft} ${accentAt(index).ink} grid size-10 place-items-center rounded-[var(--tn-radius-xl)] text-[length:var(--store-body-1)] font-bold`}
            >
              {index + 1}
            </span>
            <h3
              className={`${FONT} text-[length:var(--store-body-1)] font-semibold text-[var(--store-neutral-100)]`}
            >
              {card.title}
            </h3>
            <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>{card.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
