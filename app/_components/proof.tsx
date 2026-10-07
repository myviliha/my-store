import { BODY_2, H2, SECTION } from "./type";

/**
 * The social-proof band: an H2 over five cards in one row, as the reference lays out its five
 * testimonials (`repeat(5, 1fr)` from desktop, two columns on a tablet, one on a phone).
 *
 * **Every quote is a placeholder, on purpose.** The reference's heading claims millions of users
 * and names five people; neither is ours to write, and an invented testimonial is a false claim on
 * a page that sells trust. The structure is real; the five strings must be replaced with quotes
 * from actual buyers, with their permission, before this ships. The heading makes no count claim
 * for the same reason.
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
            className="tn-reveal flex h-full flex-col gap-[var(--tn-space-xs)] rounded-[var(--tn-radius-xl)] border border-[var(--store-neutral-50)] p-[var(--tn-space-xs)] text-left"
            style={{ ["--i" as string]: index }}
          >
            <p className={`${BODY_2} text-[var(--store-neutral-100)]`}>
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className={`${BODY_2} mt-auto text-[var(--store-neutral-80)]`}>
              <span className="font-semibold">{item.name}</span>
              <br />
              {item.role}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
