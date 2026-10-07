"use client";

import { useState } from "react";

import { BODY_2, FONT, H2, SECTION } from "./type";

/**
 * The FAQ: ten questions in a single-open accordion, the first open, two answers carrying a list as
 * the reference's do.
 *
 * **It is not `@viliha/vui-react`'s `Accordion`, and it cannot be** (`SD-214`). That component draws
 * itself with `.vui-accordion-*`, and those rules live in `theme.css`, which **this app does not
 * import**: `globals.css` takes `tailwindcss` and `store.css` and nothing else. `@source` points
 * Tailwind at files to scan for utilities; it does not bring a package's component CSS with it. So
 * the accordion rendered with class names nothing styled, which is why the chevron sat on its own
 * line under each question with no rule, no padding and no spacing between items.
 *
 * Importing `theme.css` here would be the wrong fix twice over: it is the product's stylesheet, and
 * `check:duplicated` already exempts this app by name on the ruling that the storefront is not a
 * consumer of the design system it sells. The reference's own FAQ is a plain disclosure anyway,
 * `h3.question` with an inline chevron over a `.answer` that transitions `height` and `opacity` at
 * 200ms, which is what this is.
 *
 * The answers are limited to what the store's own copy already states: the licence and refund lines
 * are from `LEGAL_PAGES` in `src/data/content.ts`, the Free-is-Voilet line from the entitlement rule
 * `themes.ts` cites.
 */
const FAQS: readonly { q: string; a: string; list?: readonly string[] }[] = [
  {
    q: "What is Voilet?",
    a: "Voilet generates admin themes and application source. You describe the admin your business needs in your own words, and you receive editable frontend code for it.",
  },
  {
    q: "What do I actually receive?",
    a: "A zip of frontend source: components, pages and design tokens in the framework and CSS system you chose. It is plain code, so you can read it, change it and keep it.",
  },
  {
    q: "Does Voilet include a backend?",
    a: "No. Voilet is frontend only. The screens are built to be connected to your own API, and no server, database or authentication service ships with them.",
  },
  {
    q: "How is this different from a template marketplace?",
    a: "A marketplace sells fixed pages you adapt. Voilet starts from what you describe, so the screens, the theme and the structure are chosen for your admin before you download anything.",
  },
  {
    q: "Which frameworks and CSS systems are supported?",
    a: "Six frameworks and three CSS systems, and a theme's page shows which combinations build today.",
    list: ["HTML, React, Next.js, Angular, Vue and Laravel", "Tailwind, Bootstrap and Bulma"],
  },
  {
    q: "Can I edit the generated code?",
    a: "Yes. Nothing is minified, hosted or locked, and the tokens that set colour, type and spacing are in the source you download.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. The Free tier covers the Voilet theme. Pro covers the other themes, and the pricing page lists what each tier includes.",
  },
  {
    q: "What does a licence allow?",
    a: "Unlimited projects, for yourself or for clients, with no project or developer counter. The downloaded source is yours permanently.",
    list: [
      "Allowed: modifying anything and shipping it inside a product you sell",
      "Not allowed: reselling the components themselves as a competing template, library or generator",
    ],
  },
  {
    q: "What is the refund policy?",
    a: "Thirty days, and downloading the source ends the window.",
  },
  {
    q: "Who is Voilet for?",
    a: "Teams and developers who need a real admin interface quickly and already have, or are building, a backend to power it.",
  },
];

export function Faq() {
  /* Single-open, and the first is open, as the reference's is. `null` is the all-closed state,
     which `collapsible` gives you there and a plain index does not. */
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <h2 className={`${H2} tn-reveal`}>Voilet FAQ</h2>
      <div className="tn-reveal w-full max-w-[850px] text-left">
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.q} className="border-b border-[var(--store-neutral-40)]">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className={`${FONT} flex w-full cursor-pointer items-center justify-between gap-[var(--tn-space-xs)] py-[var(--tn-space-xs)] text-left text-[length:var(--store-body-1)] font-medium leading-[1.5] text-[var(--store-neutral-100)] transition-colors duration-150 hover:text-[var(--store-primary-40)]`}
                >
                  {item.q}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </h3>
              {/* `grid-template-rows` rather than `height`, so the answer animates to its own
                  height without one being measured or hard-coded. The reference sets an explicit
                  pixel height from script; this reaches the same place in CSS alone. */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="pb-[var(--tn-space-xs)]">
                    <p className={`${BODY_2} text-[var(--store-neutral-80)]`}>{item.a}</p>
                    {item.list ? (
                      <ul
                        className={`${BODY_2} mt-[var(--tn-space-2xs)] list-disc ps-[var(--tn-space-sm)] text-[var(--store-neutral-80)]`}
                      >
                        {item.list.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
