"use client";

import { SKUS } from "@/src/data/catalogue";
import { ADD_ONS, ENTITLEMENTS, PLANS, planById, type Status } from "@/src/data/plans";
import { formatPrice, type SamplePrice } from "@/src/plans-core";

import { Glyph } from "./composer";
import { FONT } from "./type";
import type { CheckoutItem } from "./checkout-panel";

/**
 * **Pricing, beside the conversation** (Figma "AI Builder - Guest - pricing", node 852:9393;
 * 2026-10-09). The product rule is that **the chat never goes away**: pricing is a side panel like
 * Explore Themes and the theme preview, so the reader keeps talking while it is open, and `/pricing`
 * opens the conversation with this panel rather than a page without a chat.
 *
 * **Everything it says comes from `src/data/plans.ts`** (`PD-1246`): the three plans, what each
 * entitles, the two add-ons and their sample prices. Nothing here restates a plan; the backoffice is
 * to read the same records. The rules those records obey are `src/plans-core.ts`, under test.
 *
 * The layout is the frame's, top to bottom, with its sections re-pointed at the plans:
 *  - **No edition tabs** (removed 2026-10-09, by request): a licence covers every framework and
 *    each costs a build, so a tab changed nothing but a label. The card says instead which editions
 *    are ready now and which are coming, from the catalogue.
 *  - **The licence card** is the Theme Licence: its sample price, its next-major upgrade, and an
 *    action that says checkout is not open (`MOCKED`, no purchase path).
 *  - **"Key Features" is the entitlement table**, Free, Theme Licence and Pro Subscription side by
 *    side. A value the dev has not ruled is labelled "Proposed" or "Open", and a placeholder number
 *    "Sample"; nothing undecided reads as decided.
 *  - **Free and Pro Subscription** are the two cards under it; Pro is not available yet (PRODUCT.md
 *    § 10a keeps subscriptions off until launch).
 *  - **"Add-ons"** replaces "Generation Option": Agent Credits and, on the roadmap, Deployment
 *    Services.
 *
 * **Every price wears a "Sample price" marker** (`DEMO-ONLY(prices)`; `SD-228`: no price is set).
 * Sizes are the storefront's scale, colours the frame's; informative text is `neutral-80` because the
 * frame's `neutral-70` (3.69:1) is below AA. Responsive: the panel is a container; the table is a
 * table from 560px of panel width and a list below it; the card pairs sit two across from 480px.
 */

const JAKARTA = "font-[family-name:var(--store-font-headline)]";
const INTER = "font-[family-name:var(--font-inter)]";
/** Disabled is a grey fill, never opacity (`SD-164`). */
const PILL = `${INTER} inline-flex items-center rounded-full px-[8px] py-[2px] text-[length:var(--store-body-4)] font-semibold leading-[1.4]`;
const SAMPLE_TAG = `${PILL} bg-[var(--tn-accent-amber-soft)] text-[var(--tn-accent-amber-ink)]`;
const GREY_TAG = `${PILL} bg-[var(--store-neutral-40)] text-[var(--store-neutral-80)]`;

/** The six editions, the ones on sale first (a stable sort keeps the catalogue's order inside each). */
const EDITIONS = [...SKUS].sort((a, b) => Number(a.status === "waitlist") - Number(b.status === "waitlist"));

const PER: Record<SamplePrice["per"], string> = {
  "one-time": "one-time",
  month: "/ month",
  "major-upgrade": "per major upgrade",
  pack: "per pack",
};

/** How an undecided value is labelled beside it. A ruled value carries nothing. */
const STATUS_LABEL: Partial<Record<Status, string>> = {
  proposed: "Proposed",
  open: "Open",
  sample: "Sample",
  roadmap: "Roadmap",
};

function SampleTag() {
  return <span className={SAMPLE_TAG}>Sample price</span>;
}

function StatusTag({ status }: { status: Status }) {
  const label = STATUS_LABEL[status];
  return label ? <span className={`${GREY_TAG} ml-[6px] align-middle`}>{label}</span> : null;
}

function Tick() {
  // biome-ignore lint/performance/noImgElement: the design's 19px check
  return <img src="/pricing/check.svg" alt="" width={19.1768} height={19.1768} className="block shrink-0" />;
}

function SmallTick() {
  // biome-ignore lint/performance/noImgElement: the design's 15px check
  return <img src="/pricing/check-small.svg" alt="" width={14.9037} height={14.9037} className="mt-[2px] block shrink-0" />;
}

export function PricingPanel({
  onClose,
  onStartChat,
  onCheckout,
}: {
  onClose: () => void;
  /** Free's action: back to the conversation, with the composer focused. */
  onStartChat: () => void;
  /**
   * The demo checkout, in this same panel (`checkout-panel.tsx`, 2026-10-12, by request). Without it
   * the paid plans' buttons stay as they were: disabled, checkout not open.
   */
  onCheckout?: (item: CheckoutItem) => void;
}) {
  const ready = EDITIONS.filter((e) => e.status !== "waitlist").map((e) => e.framework);
  const soon = EDITIONS.filter((e) => e.status === "waitlist").map((e) => e.framework);
  const licence = planById("theme-licence");
  const free = planById("free");
  const pro = planById("pro-subscription");

  return (
    <aside
      aria-label="Pricing"
      className="@container flex h-full min-h-0 flex-col gap-[16px] rounded-[16px] border border-[var(--store-card-border)] bg-white/80 p-[16px] backdrop-blur"
    >
      <header className="flex items-start justify-between gap-[12px]">
        <h2
          className={`${FONT} ${JAKARTA} text-[length:var(--store-headline-10)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}
        >
          Pricing
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pricing"
          className="flex size-[32px] shrink-0 items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
        >
          <Glyph size={18}>
            <path d="M6 6l12 12M18 6L6 18" />
          </Glyph>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto overscroll-contain pr-[2px]">
        {/* The licence card (Figma 853:9613): a 2px brand edge, 16px corners. */}
        <section
          aria-label={licence.name}
          className="flex shrink-0 flex-col gap-[20px] rounded-[16px] border-2 border-[var(--store-primary-40)] bg-white p-[20px] @lg:px-[28px] @lg:py-[24px]"
        >
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[6px] text-[var(--store-neutral-100)]">
              <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-bold leading-[1.5]`}>
                {licence.name}
              </h3>
              <p className="flex flex-wrap items-center gap-[10px]">
                <span className={`${JAKARTA} text-[length:var(--store-headline-9)] font-semibold leading-none`}>
                  {formatPrice(licence.price)}
                </span>
                <span className={`${JAKARTA} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>
                  {PER[licence.price.per]}
                </span>
                <SampleTag />
              </p>
            </div>
            <div className="flex flex-col gap-[6px] border-t border-[var(--store-neutral-40)] pt-[12px]">
              <p className={`${JAKARTA} text-[length:var(--store-body-2)] font-medium leading-[1.5] text-[var(--store-neutral-80)]`}>
                {licence.summary} Every framework is included, and each one costs a build.
              </p>
              <p className={`${INTER} flex flex-wrap items-center gap-[6px] text-[length:var(--store-body-3)] leading-[1.5] text-[var(--store-neutral-80)]`}>
                <span className="font-semibold text-[var(--store-neutral-100)]">Ready now:</span> {ready.join(", ")}
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[var(--store-neutral-100)]">Soon:</span> {soon.join(", ")}
              </p>
              {licence.upgrade ? (
                <p className={`${INTER} flex flex-wrap items-center gap-[6px] text-[length:var(--store-body-3)] leading-[1.5] text-[var(--store-neutral-80)]`}>
                  The next major: {formatPrice(licence.upgrade)} {PER[licence.upgrade.per]}
                  <SampleTag />
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            disabled={!onCheckout}
            onClick={() => onCheckout?.({ plan: "theme-licence" })}
            title={onCheckout ? undefined : `Choose ${licence.name}: checkout isn't open yet`}
            className="btn btn-lg btn-primary w-full"
          >
            {onCheckout ? `Buy a ${licence.name} (demo)` : "Checkout isn't open yet"}
          </button>

          {/* "Key Features" (Figma 853:9622), now what each plan entitles: a table when the panel is
              wide, a list when it is not. */}
          <div className="flex flex-col gap-[12px]">
            <h4 className={`${JAKARTA} border-b border-[var(--store-neutral-40)] pb-[12px] text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}>
              Key Features
            </h4>
            <table className={`${INTER} hidden w-full border-collapse text-left text-[length:var(--store-body-3)] leading-[1.35] text-[var(--store-neutral-100)] @[560px]:table`}>
              <thead>
                <tr>
                  <th className="w-[26%] pb-[8px]" />
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col" className="pb-[8px] pr-[8px] font-normal text-[var(--store-neutral-80)]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENTITLEMENTS.map((row) => (
                  <tr key={row.label} className="border-t border-[var(--store-neutral-30)]">
                    <th scope="row" className="py-[8px] pr-[12px] align-top font-normal">
                      {row.label}
                    </th>
                    {PLANS.map((p) => (
                      <td key={p.id} className="py-[8px] pr-[8px] align-top font-medium">
                        {row.values[p.id].text}
                        <StatusTag status={row.values[p.id].status} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className={`${INTER} flex flex-col gap-[12px] text-[length:var(--store-body-3)] leading-[1.4] text-[var(--store-neutral-100)] @[560px]:hidden`}>
              {ENTITLEMENTS.map((row) => (
                <div key={row.label} className="flex flex-col gap-[4px]">
                  <dt className="font-semibold">{row.label}</dt>
                  {PLANS.map((p) => (
                    <dd key={p.id} className="flex justify-between gap-[12px]">
                      <span className="shrink-0 text-[var(--store-neutral-80)]">{p.name}</span>
                      <span className="text-right font-medium">
                        {row.values[p.id].text}
                        <StatusTag status={row.values[p.id].status} />
                      </span>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* DEMO-ONLY(prices): the note under the card (Figma 853:9655). */}
        <p className={`${JAKARTA} shrink-0 text-[length:var(--store-body-2)] font-medium leading-[1.5] text-[var(--store-neutral-80)]`}>
          Every price here is a sample: no price is set yet, and checkout isn't open. "Proposed" and
          "Open" mark what is not decided.
        </p>

        {/* Free and Pro Subscription (Figma 853:10063). */}
        <div className="grid shrink-0 grid-cols-1 gap-[16px] @[480px]:grid-cols-2">
          {[free, pro].map((plan) => {
            const available = plan.id === "free";
            return (
              <article
                key={plan.id}
                className={`flex flex-col gap-[16px] rounded-[16px] border bg-white px-[18px] py-[20px] ${available ? "border-[var(--store-neutral-60)]" : "border-[var(--store-primary-50)]"}`}
              >
                <div className="flex items-center justify-between gap-[8px]">
                  <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>{plan.name}</h3>
                  {available || (plan.id === "pro-subscription" && onCheckout) ? null : <span className={GREY_TAG}>Not available yet</span>}
                </div>
                <p className="flex flex-wrap items-center gap-[6px]">
                  <span className={`${JAKARTA} text-[length:var(--store-headline-11)] font-semibold leading-none text-[var(--store-neutral-100)]`}>
                    {formatPrice(plan.price)}
                  </span>
                  <span className={`${JAKARTA} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>{PER[plan.price.per]}</span>
                  <SampleTag />
                </p>
                <p className={`${INTER} text-[length:var(--store-body-3)] leading-[1.5] text-[var(--store-neutral-80)]`}>{plan.summary}</p>
                <ul className="flex flex-col gap-[8px]">
                  {ENTITLEMENTS.filter((row) => row.values[plan.id].text !== "Not included")
                    .slice(0, 4)
                    .map((row) => (
                      <li key={row.label} className={`${JAKARTA} flex items-start gap-[6px] text-[length:var(--store-body-3)] font-medium leading-[1.5] text-[var(--store-neutral-100)]`}>
                        <Tick />
                        <span>
                          {row.label}: {row.values[plan.id].text}
                          <StatusTag status={row.values[plan.id].status} />
                        </span>
                      </li>
                    ))}
                </ul>
                {available ? (
                  <button
                    type="button"
                    onClick={onStartChat}
                    className="btn btn-lg btn-secondary mt-auto w-full"
                  >
                    Start free in the chat
                  </button>
                ) : plan.id === "pro-subscription" && onCheckout ? (
                  <button
                    type="button"
                    onClick={() => onCheckout({ plan: "pro-subscription" })}
                    className="btn btn-lg btn-primary mt-auto w-full"
                  >
                    Subscribe to Pro (demo)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn btn-lg mt-auto w-full"
                  >
                    Not available yet
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {/* The add-ons, where the frame drew "Generation Option" (853:10016). */}
        <h3 className={`${JAKARTA} shrink-0 text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>Add-ons</h3>
        <div className="grid shrink-0 grid-cols-1 gap-[12px] pb-[4px] @[480px]:grid-cols-2">
          {ADD_ONS.map((a, i) => (
            <article
              key={a.id}
              className={`flex flex-col gap-[14px] rounded-[10px] bg-white p-[20px] ${i === 0 ? "border border-[var(--store-primary-40)]" : "border border-[var(--store-neutral-60)]"}`}
            >
              <div className="flex flex-col gap-[6px] text-[var(--store-neutral-100)]">
                <div className="flex items-center justify-between gap-[8px]">
                  <h4 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.3]`}>{a.name}</h4>
                  {a.status === "roadmap" ? <span className={GREY_TAG}>Roadmap</span> : null}
                </div>
                {a.price ? (
                  <p className="flex flex-wrap items-center gap-[6px]">
                    <span className={`${JAKARTA} text-[length:var(--store-headline-12)] font-semibold leading-none`}>{formatPrice(a.price)}</span>
                    <span className={`${JAKARTA} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>{PER[a.price.per]}</span>
                    <SampleTag />
                  </p>
                ) : null}
              </div>
              <ul className="flex flex-col gap-[6px]">
                {a.points.map((point) => (
                  <li key={point} className={`${JAKARTA} flex items-start gap-[5px] text-[length:var(--store-body-3)] font-medium leading-[1.5] text-[var(--store-neutral-100)]`}>
                    <SmallTick />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}
