"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useState } from "react";

import { planById } from "@/src/data/plans";
import { THEMES } from "@/src/data/themes";

import { purchase, setAuth, useUser } from "./auth-store";
import { Glyph } from "./composer";
import { FONT } from "./type";

/**
 * **Checkout, as a demo** (2026-10-12, by request), in the conversation's side panel where Pricing
 * opened it, so the chat stays usable throughout.
 *
 * **The docs rule out a checkout until there is one** (`SD-023`, `PD-1196`: a price may be published,
 * a checkout may not). The owner asked for a demo of the flow, on the condition that it says so: the
 * panel is labelled a demo at the top and on the pay button, the card is a test card already filled
 * in, and **nothing typed here leaves the browser or is kept**. Paying records the plan on this
 * browser's demo account (`purchase` in `auth-store.ts`), which is what unlocks Pro pages in the
 * conversation's summary.
 *
 * The flow: what is being bought and its sample price → the account (sign in first, if needed) →
 * the card → a short processing state → done, with the way back to the conversation.
 */

/*
 * ┌─ DEMO-ONLY(checkout) ───────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE WITH THE PAYMENT PROVIDER'S HOSTED CHECKOUT. Never collect card numbers in this app.     │
 * │   grep -rn "DEMO-ONLY(checkout)" app src                                                        │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 */
const TEST_CARD = { number: "4242 4242 4242 4242", expiry: "12 / 34", cvc: "123" };
/** How long "Processing…" shows, so the state is seen; a real charge takes what it takes. */
const PROCESSING_MS = 1400;

export type CheckoutItem = { plan: "pro-subscription" } | { plan: "theme-licence"; themeId?: string };

/*
 * **The Pricing panel's look** (2026-10-12, by request), so Pricing → Checkout reads as one flow: the
 * same panel and 28px Jakarta title, the order as the licence card (a 2px brand edge, the price large
 * with its "Sample price" tag), and the payment as the plan cards (a neutral edge, 16px corners).
 */
const JAKARTA = "font-[family-name:var(--store-font-headline)]";
const INTER = "font-[family-name:var(--font-inter)]";
const TAG = `${INTER} inline-flex items-center rounded-full px-[8px] py-[2px] text-[length:var(--store-body-4)] font-semibold leading-[1.4]`;
const AMBER_TAG = `${TAG} bg-[var(--tn-accent-amber-soft)] text-[var(--tn-accent-amber-ink)]`;
const LABEL = `${INTER} text-[length:var(--store-body-3)] font-medium leading-[1.2] text-[var(--store-neutral-100)]`;
const FIELD = `${INTER} h-[40px] w-full rounded-[10px] border border-[var(--store-control-border)] bg-white px-[14px] text-[length:var(--store-body-2)] text-[var(--store-neutral-100)] outline-none transition-colors duration-150 focus:border-[var(--store-primary-40)] aria-[invalid=true]:border-[var(--color-error)] disabled:bg-[var(--store-neutral-30)]`;
const SMALL = `${INTER} text-[length:var(--store-body-3)] leading-[1.5]`;
const BODY = `${JAKARTA} text-[length:var(--store-body-2)] font-medium leading-[1.5] text-[var(--store-neutral-80)]`;
const CARD = "flex shrink-0 flex-col gap-[16px] rounded-[16px] border border-[var(--store-neutral-60)] bg-white px-[18px] py-[20px]";

const digits = (s: string) => s.replace(/\D/g, "");
/** "4242424242424242" → "4242 4242 4242 4242", as it is typed. */
const groupCard = (s: string) => digits(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
/** "1234" → "12 / 34". */
const groupExpiry = (s: string) => {
  const d = digits(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

export function CheckoutPanel({
  item,
  onBack,
  onClose,
  onDone,
}: {
  item: CheckoutItem;
  /** Back to the plans (Pricing), in the same panel. */
  onBack: () => void;
  onClose: () => void;
  /** After paying: back to the conversation. */
  onDone: () => void;
}) {
  const account = useUser();
  const ids = { theme: useId(), name: useId(), card: useId(), expiry: useId(), cvc: useId() };
  const plan = planById(item.plan);
  const [themeId, setThemeId] = useState(item.plan === "theme-licence" ? (item.themeId ?? "voilet") : "");
  const [name, setName] = useState("");
  const [card, setCard] = useState(TEST_CARD.number);
  const [expiry, setExpiry] = useState(TEST_CARD.expiry);
  const [cvc, setCvc] = useState(TEST_CARD.cvc);
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");

  useEffect(() => {
    if (account && !name) setName(account.name);
  }, [account, name]);

  const theme = THEMES.find((t) => t.id === themeId);
  const owned =
    item.plan === "pro-subscription" ? account?.plan === "pro" : Boolean(account?.licences?.includes(themeId));
  const [mm, yy] = [Number(digits(expiry).slice(0, 2)), Number(digits(expiry).slice(2, 4))];
  const valid = {
    card: digits(card).length === 16,
    expiry: digits(expiry).length === 4 && mm >= 1 && mm <= 12 && yy >= 26,
    cvc: digits(cvc).length >= 3,
    name: name.trim() !== "",
  };
  const ready = Boolean(account) && Object.values(valid).every(Boolean) && !owned;
  const price = `$${plan.price.amount.toFixed(2)}`;
  const per = plan.price.per === "month" ? "per month" : "one-time";

  const pay = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setStage("processing");
    window.setTimeout(() => {
      purchase(item.plan === "pro-subscription" ? { plan: "pro-subscription" } : { plan: "theme-licence", themeId });
      /* The card is never kept: cleared the moment the demo "charge" is done. */
      setCard("");
      setExpiry("");
      setCvc("");
      setStage("done");
    }, PROCESSING_MS);
  };

  const field = (id: string, label: string, input: ReactNode) => (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {input}
    </div>
  );

  return (
    <aside
      aria-label="Checkout"
      className="@container flex h-full min-h-0 flex-col gap-[16px] rounded-[16px] border border-[var(--store-card-border)] bg-white/80 p-[16px] backdrop-blur"
    >
      <header className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <button
            type="button"
            onClick={onBack}
            disabled={stage === "processing"}
            className={`${INTER} inline-flex w-fit cursor-pointer items-center gap-[4px] text-[length:var(--store-body-3)] font-medium text-[var(--store-neutral-80)] hover:text-[var(--store-primary-40)] disabled:cursor-not-allowed`}
          >
            <Glyph size={14}>
              <path d="M14 6l-6 6 6 6" />
            </Glyph>
            Plans &amp; pricing
          </button>
          <h2 className={`${FONT} ${JAKARTA} text-[length:var(--store-headline-10)] font-semibold leading-[1.2] text-[var(--store-neutral-100)]`}>
            {stage === "done" ? "You're all set" : "Checkout"}
          </h2>
          {/* DEMO-ONLY(checkout): said at the top, as `SD-221` asks of anything a visitor could take for real. */}
          <span className={`${AMBER_TAG} w-fit`}>Demo checkout · no real payment is taken</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="flex size-[32px] shrink-0 items-center justify-center rounded-[8px] text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]"
        >
          <Glyph size={18}>
            <path d="M6 6l12 12M18 6L6 18" />
          </Glyph>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto overscroll-contain pr-[2px]">
        {/* The order, as the Pricing panel's licence card (Figma 853:9613): a 2px brand edge. */}
        <section
          aria-label="Your order"
          className="flex shrink-0 flex-col gap-[16px] rounded-[16px] border-2 border-[var(--store-primary-40)] bg-white p-[20px] @lg:px-[28px] @lg:py-[24px]"
        >
          <div className="flex flex-col gap-[6px] text-[var(--store-neutral-100)]">
            <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-bold leading-[1.5]`}>
              {plan.name}
              {item.plan === "theme-licence" && theme ? (
                <span className="font-medium text-[var(--store-neutral-80)]"> · {theme.label}</span>
              ) : null}
            </h3>
            <p className="flex flex-wrap items-center gap-[10px]">
              <span className={`${JAKARTA} text-[length:var(--store-headline-9)] font-semibold leading-none`}>{price}</span>
              <span className={`${JAKARTA} text-[length:var(--store-body-3)] text-[var(--store-neutral-80)]`}>{per}</span>
              <span className={AMBER_TAG}>Sample price</span>
            </p>
          </div>
          <div className="flex flex-col gap-[12px] border-t border-[var(--store-neutral-40)] pt-[12px]">
            <p className={BODY}>{plan.summary}</p>
            {item.plan === "theme-licence" && stage === "form"
              ? field(
                  ids.theme,
                  "Theme",
                  <select
                    id={ids.theme}
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                    className={`${FIELD} cursor-pointer`}
                  >
                    {THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>,
                )
              : null}
            <p className={`${SMALL} flex items-center justify-between text-[var(--store-neutral-80)]`}>
              <span>Due today</span>
              <span className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold text-[var(--store-neutral-100)]`}>{price}</span>
            </p>
          </div>
        </section>

        {stage === "done" ? (
          <section className={`tn-auth-up ${CARD} items-center text-center`}>
            <span className="flex size-[44px] items-center justify-center rounded-full bg-[var(--store-success-10)] text-[var(--store-success-50)]">
              <Glyph size={22}>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </Glyph>
            </span>
            <div className="flex flex-col gap-[6px]">
              <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>
                {item.plan === "pro-subscription" ? "You're on Pro" : `${theme?.label ?? "This theme"} is licensed to you`}
              </h3>
              <p className={BODY}>
                {item.plan === "pro-subscription"
                  ? "Pro pages are unlocked in every theme. Tick them in your summary in the chat."
                  : `${theme?.label ?? "The theme"}'s Pro pages are unlocked. Tick them in your summary in the chat.`}{" "}
                Nothing was charged: this is a demo.
              </p>
            </div>
            <button type="button" onClick={onDone} className="btn btn-lg btn-primary w-full">
              Back to the chat
            </button>
          </section>
        ) : !account ? (
          /* Buying needs an account: the plan is recorded on it. The panel stays, and the form follows
             once the reader is signed in. */
          <section className={CARD}>
            <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>Your account</h3>
            <p className={BODY}>Sign in first, so the plan is added to your account.</p>
            <button type="button" onClick={() => setAuth("signin")} className="btn btn-lg btn-primary w-full">
              Sign in
            </button>
          </section>
        ) : owned ? (
          <section className={CARD}>
            <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>Already yours</h3>
            <p className={BODY}>
              {item.plan === "pro-subscription"
                ? "You're already on Pro."
                : `You already have a licence for ${theme?.label ?? "this theme"}.`}
            </p>
            <button type="button" onClick={onDone} className="btn btn-lg btn-secondary w-full">
              Back to the chat
            </button>
          </section>
        ) : (
          <form onSubmit={pay} noValidate className={CARD}>
            <div className="flex flex-col gap-[4px]">
              <h3 className={`${JAKARTA} text-[length:var(--store-body-1)] font-semibold leading-[1.2] text-black`}>Payment</h3>
              <p className={`${SMALL} text-[var(--store-neutral-80)]`}>
                Signed in as {account.email}. A test card is filled in; don&apos;t enter a real one.
              </p>
            </div>
            <fieldset disabled={stage !== "form"} className="flex flex-col gap-[12px] border-t border-[var(--store-neutral-40)] pt-[16px]">
              <legend className="sr-only">Card details</legend>
              {field(
                ids.name,
                "Name on card",
                <input
                  id={ids.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={!valid.name}
                  className={FIELD}
                />,
              )}
              {field(
                ids.card,
                "Card number",
                <input
                  id={ids.card}
                  value={card}
                  onChange={(e) => setCard(groupCard(e.target.value))}
                  inputMode="numeric"
                  /* Off, so the browser never offers to save a card typed into a demo. */
                  autoComplete="off"
                  aria-invalid={card !== "" && !valid.card}
                  className={FIELD}
                />,
              )}
              <div className="grid grid-cols-2 gap-[12px]">
                {field(
                  ids.expiry,
                  "Expiry",
                  <input
                    id={ids.expiry}
                    value={expiry}
                    onChange={(e) => setExpiry(groupExpiry(e.target.value))}
                    inputMode="numeric"
                    placeholder="MM / YY"
                    autoComplete="off"
                    aria-invalid={expiry !== "" && !valid.expiry}
                    className={FIELD}
                  />,
                )}
                {field(
                  ids.cvc,
                  "CVC",
                  <input
                    id={ids.cvc}
                    value={cvc}
                    onChange={(e) => setCvc(digits(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={cvc !== "" && !valid.cvc}
                    className={FIELD}
                  />,
                )}
              </div>
            </fieldset>
            <button type="submit" disabled={!ready || stage !== "form"} className="btn btn-lg btn-primary w-full">
              {stage === "processing" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-[14px] animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                  />
                  Processing…
                </>
              ) : (
                `Pay ${price} (demo)`
              )}
            </button>
            <p role="status" className="sr-only">
              {stage === "processing" ? "Processing the demo payment" : ""}
            </p>
          </form>
        )}
      </div>
    </aside>
  );
}
