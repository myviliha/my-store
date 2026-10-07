/**
 * Entitlement: the one place that answers "is this Free" (`SD-142`, `PD-866`).
 *
 * **The rule, whole**: a thing is Free when the design is Voilet and the page or component carries
 * no `pro` mark. Everything else is Pro. Marking is opt-in, so unlabelled means free and the default
 * is generous by construction.
 *
 * **Two axes this is not, and both used to be modelled as though they were.** Framework is not a
 * tier: all six carry the same entitlement, and a six-edition catalogue reading as a paywall from
 * outside is a copy problem rather than a product one. CSS is not a tier either: Tailwind is the
 * only one that exists, and Bootstrap and Bulma are `ROADMAP.md`'s, seeded unavailable.
 *
 * **Why this file exists at all.** `PD-866` found the single rule "what does Free include" living in
 * `AVAILABLE`, `themes.ts`, `tiers.ts` and the theme's own page marking, with three of the four
 * disagreeing with the owner. That is not four bugs, it is one missing boundary, and the visible
 * symptom was three paid designs wearing a Free badge on `/themes`. A fourth place that infers a
 * tier would have been a fifth disagreement.
 *
 * **Where it goes next.** Store-side while the store is the only consumer (`SD-142`: store first).
 * It moves to `@viliha/vui-core` the moment a second one exists, because the page marking below is a
 * fact about a theme rather than about a shop. Building the package for one caller first would be
 * the speculative kind of abstraction `E-03` rules out.
 */

export type Tier = "free" | "pro";

/**
 * The one design Free serves.
 *
 * A literal rather than a lookup on `DESIGNS`, because "which design is free" is a commercial fact
 * and `@viliha/vui-core` models the design system. The design ids are checked against it below.
 */
export const FREE_DESIGN = "voilet";

/**
 * Anything a theme can mark as Pro: a page, a component, a block.
 *
 * **`pro` is optional and absent means free**, which is the owner's rule expressed in the type: the
 * cheapest thing to write is the generous one, so a page nobody has thought about is included rather
 * than withheld. An enum with a required `tier` field would have inverted that.
 */
export interface Marked {
  readonly pro?: boolean;
}

/**
 * Is this Free?
 *
 * Both halves must hold. Calling it with the design alone asks whether the design has any free
 * surface at all, which is the question a catalogue badge is really asking.
 */
export function isFree(design: string, page?: Marked): boolean {
  if (design !== FREE_DESIGN) return false;
  return page?.pro !== true;
}

/** The same answer as a tier, for a surface that prints one. */
export const tierOf = (design: string, page?: Marked): Tier =>
  isFree(design, page) ? "free" : "pro";

/**
 * Which tiers a design can serve at all.
 *
 * **Voilet serves both**, and that is the part a union over an availability record got wrong.
 * Voilet's unmarked pages are Free and its marked ones are Pro, so a Voilet card truthfully shows
 * both badges. Every other design is Pro alone.
 */
export const tiersOf = (design: string): readonly Tier[] =>
  design === FREE_DESIGN ? ["free", "pro"] : ["pro"];

/** Designs a buyer on this tier can actually use. Undefined tier means they have not said yet. */
export function designsFor<T extends { readonly id: string }>(
  designs: readonly T[],
  tier?: Tier,
): readonly T[] {
  if (tier === undefined) return designs;
  return designs.filter((d) => tiersOf(d.id).includes(tier));
}
