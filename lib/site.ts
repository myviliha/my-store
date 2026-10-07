import { envOr } from "@/lib/env";

/**
 * The site's own facts, in one module, read from the contract `.env.example` publishes.
 *
 * `SD-028`: no page carries a literal. That starts here rather than at the first page, because the
 * name and the URL are the two strings most likely to be pasted into a component and then found in
 * four places when the brand changes, which is what happened on 2026-08-21 and again on 2026-08-22
 * (`SD-003`).
 *
 * All five keys are read. Hardcoding four of them while `.env.example` advertised them as the
 * contract meant setting them did nothing, which is worse than not offering them.
 */

/**
 * **The production origin, decided on 2026-09-05** (`SD-090`, closing `OQ-8`).
 *
 * `metadataBase` feeds every canonical and every `og:url`, and this defaulted to
 * `http://localhost:3000`: built without `NEXT_PUBLIC_SITE_URL` the whole site was unindexable with
 * nothing failing. `ST-018` asserts the canonical is not localhost and could not pass, because there
 * was no origin for it to be. Naming one is what the documentation move forced, since the docs are
 * served from this origin now and their canonicals resolve against it.
 *
 * Still overridable per deployment through `NEXT_PUBLIC_SITE_URL`, which is in `turbo.json`'s
 * `globalEnv`. The default is a decision rather than a placeholder.
 */
const DEFAULT_ORIGIN = "https://viliha.com";

export const SITE = {
  /**
   * **Viliha, which is what the origin two lines up already says** (`SD-159`).
   *
   * This defaulted to `VuiAdmin` while `DEFAULT_ORIGIN` was `https://viliha.com`, so the site
   * called itself one thing and lived at another, and the wordmark, every page title and the footer
   * all took the first. The brief in `reference/chatgpt/voilet.md` rules on it: *"Viliha is the
   * customer-facing product ... do not mix Viliha, Voilet and VuiAdmin as interchangeable product
   * names in the interface."*
   *
   * **The three are not synonyms and the split is the dev's**: Viliha is the product a visitor
   * uses, Voilet is the assistant it talks to, and VuiAdmin is the admin template line it sells.
   * A default is a decision, and this one had been answering a question nobody meant to ask.
   */
  name: envOr(process.env.NEXT_PUBLIC_SITE_NAME, "Viliha"),
  tagline: envOr(process.env.NEXT_PUBLIC_SITE_TAGLINE, "Tailwind CSS admin dashboard templates"),
  description: envOr(
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    "Production-ready admin dashboard templates in React, Next.js, Vue, HTML, Angular and Laravel. One-time purchase, source you own.",
  ),
  company: envOr(process.env.NEXT_PUBLIC_COMPANY_NAME, "VILIHA PTE. LTD."),
  /** No trailing slash: `metadataBase` resolves children against it. */
  url: envOr(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_ORIGIN).replace(/\/$/, ""),

  /**
   * The browser-chrome colour, and the one hex this app keeps outside the `@theme` block.
   *
   * `viewport.themeColor` is a string in a JS export, so it cannot read a CSS variable, and paying
   * for that with a literal inside `layout.tsx` would be exactly the bypass `SD-028` forbids. It
   * lives here instead, and `token-contract.test.ts` asserts it still equals `--color-primary`, so
   * the two cannot drift.
   */
  themeColor: "#0058ee",

  /** The registered entity, which is not the brand. Used by the `Organization` JSON-LD. */
  /**
   * The launch year, as a constant.
   *
   * `new Date().getFullYear()` in the footer was evaluated once at build and frozen into the
   * prerendered HTML, so a December build served the wrong year for the following twelve months on
   * all 22 routes. A single year is legally sufficient and cannot rot.
   */
  since: 2026,
  legalName: "Viliha",
  twitter: "@viliha",
  /**
   * The social homes, as defaults rather than requirements.
   *
   * These were `process.env.NEXT_PUBLIC_*` with no fallback, so two of the footer's three chips
   * rendered nothing on a machine without a `.env.local` and nobody noticed for a day. A public
   * profile URL is not a secret and does not differ per environment, so env may override it but
   * absence must not delete the icon. Real handles land with the rest of the copy before launch
   * (`OQ-4`).
   */
  github: "https://github.com/viliha",
  discord: "https://discord.gg/viliha",
} as const;
