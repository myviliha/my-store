import { accentAt, BODY_2, FONT, H2, SECTION } from "./type";

/**
 * The social-proof band: an H2 over five cards in one row, as the reference lays out its five
 * testimonials (`repeat(5, 1fr)` from desktop, two columns on a tablet, one on a phone).
 *
 * **Every quote is a placeholder, on purpose.** The reference's heading claims millions of users
 * and names five people; neither is ours to write, and an invented testimonial is a false claim on
 * a page that sells trust. The structure is real; the five strings must be replaced with quotes
 * from actual buyers, with their permission, before this ships. The heading makes no count claim
 * for the same reason.
 *
 * **Colour comes from the accents, not from the words**: a large quote mark and an initials disc
 * in the card's accent, on a faint tint of it. Both are decorative, so they survive the swap to
 * real quotes unchanged.
 */
const QUOTES = [
  { quote: "A buyer's one-sentence quote goes here.", name: "Buyer name", role: "Role, company" },
  { quote: "A buyer's one-sentence quote goes here.", name: "Buyer name", role: "Role, company" },
  { quote: "A buyer's one-sentence quote goes here.", name: "Buyer name", role: "Role, company" },
  { quote: "A buyer's one-sentence quote goes here.", name: "Buyer name", role: "Role, company" },
  { quote: "A buyer's one-sentence quote goes here.", name: "Buyer name", role: "Role, company" },
] as const;

export function Proof() {
  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <h2 className={`${H2} tn-reveal`}>What buyers say</h2>
      <ul className="grid w-full max-w-[1200px] grid-cols-1 gap-[var(--tn-space-xs)] sm:grid-cols-2 lg:grid-cols-5">
        {QUOTES.map((item, index) => (
          <li
            key={index}
            className={`tn-reveal relative flex h-full flex-col gap-[var(--tn-space-xs)] overflow-hidden rounded-[var(--tn-radius-xl)] border border-[var(--store-neutral-50)] bg-white p-[var(--tn-space-xs)] text-left transition-colors duration-200 ${accentAt(index).border}`}
            style={{ ["--i" as string]: index }}
          >
            <span
              aria-hidden="true"
              className={`${FONT} ${accentAt(index).ink} -mb-[var(--tn-space-xs)] block text-[48px] font-extrabold leading-none`}
            >
              &ldquo;
            </span>
            <p className={`${BODY_2} text-[var(--store-neutral-100)]`}>
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-auto flex items-center gap-[var(--tn-space-2xs)]">
              <span
                aria-hidden="true"
                className={`${FONT} ${accentAt(index).soft} ${accentAt(index).ink} grid size-9 shrink-0 place-items-center rounded-full text-[length:var(--store-body-3)] font-bold`}
              >
                {item.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>
                <span className="font-semibold text-[var(--store-neutral-100)]">{item.name}</span>
                <br />
                {item.role}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
