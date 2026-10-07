import { SKUS, type Sku } from "./catalogue";

/**
 * The edition availability table, which is the second design's best idea.
 *
 * That design renders Edition / Status / Action with **"Not for sale"** against planned editions, "Join"
 * against waitlisted ones and "Choose" against available ones. It is the product requirement's
 * acceptance criterion 14 expressed as a table, and it tells a buyer more in six rows than a page of
 * prose: what they can have today, what is coming, and what they must not be charged for.
 *
 * **Derived from `SKUS`, never written here.** A table that says "Available" because somebody typed it is
 * a table that goes wrong the week a package slips, and this is the one place on the site where being
 * wrong costs a refund rather than a correction.
 *
 * The design shows three states where the catalogue stores two, and the third is recoverable rather than
 * invented: a waitlisted SKU with a package is real code that is not yet buyable, and a waitlisted SKU
 * with `packageName: null` is not built at all. The first is worth joining a list for; the second is not
 * for sale and says so.
 */
export type AvailabilityState = "available" | "waitlist" | "planned";

export interface AvailabilityRow {
  /** The stack, as a buyer says it. */
  edition: string;
  state: AvailabilityState;
  /** The word the design puts in the status column. */
  status: string;
  /**
   * What the action column offers. Always something, never a checkout for what does not exist.
   *
   * It was `| null` when planned rows offered nothing, which review showed was the wrong reading of
   * criterion 14: that rule bans a purchase path, and a waitlist is not one.
   */
  action: { label: string; href: string };
}

function stateOf(sku: Sku): AvailabilityState {
  if (sku.status !== "waitlist") return "available";
  return sku.packageName ? "waitlist" : "planned";
}

export const AVAILABILITY: readonly AvailabilityRow[] = SKUS.map((sku) => {
  const state = stateOf(sku);
  return {
    edition: sku.framework,
    state,
    status: state === "available" ? "Available" : state === "waitlist" ? "Waitlist" : "Planned",
    /**
     * **Never a purchase action for something unavailable, and never a dead row either.**
     *
     * Criterion 14 forbids a *checkout* for what does not exist. It does not forbid a mailing list, and
     * the first version of this table conflated the two: planned editions got `action: null`, so the
     * site's highest-traffic page silently dropped lead capture for the two editions §24.7 explicitly
     * keeps on a waitlist, while `/products/angular` was still inviting people to join. Review caught
     * it. "Planned" and "Not for sale" belong in the status column, which is where they now say it.
     */
    action:
      state === "available"
        ? { label: "Choose", href: `/products/${sku.slug}` }
        : { label: "Join", href: `/products/${sku.slug}` },
  };
});

/**
 * Two exports were here and are gone: `note`, which every row computed and no cell rendered, and
 * `AVAILABLE_COUNT`, described as being "for a proof line that cannot drift" and imported by nothing.
 * `note` was worse than dead: for HTML and Vue it carried the whole SKU caveat, which ends "the package
 * is not published yet" and would have printed beside a "Join" action. Both removed in review; they come
 * back with the cell that needs them.
 */
