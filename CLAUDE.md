# CLAUDE.md: how work in this repository is decided

This repo is the **standalone export of the voilet storefront** (`SD-224`: "the copy is the one being
worked on"). Next.js 16 App Router, React 19, Tailwind v4, pnpm. Every task, current and future,
is judged against the four documents below. Read the relevant one **before** writing code or copy.

## The source of truth, and which one wins

| Document | Owns | Read before |
| --- | --- | --- |
| [`STORE.md`](./STORE.md) | The storefront: pages, layout, tokens, type, conventions, commerce copy (`SD-nnn`) | Any UI, page, copy or convention change. **It wins for storefront matters** |
| [`PRODUCT.md`](./PRODUCT.md) | The product and its business logic: editions, Free/Pro, licensing, pricing, theme names, claims (`PD-nnn`) | Anything that states what is sold, what is free, a price, a count or an availability |
| [`PROJECT.md`](./PROJECT.md) | What voilet is, its scope (frontend only), the vocabulary | Your first task, and any naming question |
| [`SEO.md`](./SEO.md) | How a page earns its place, titles, descriptions, structured data, claims ethics | Publishing or changing any indexable page (`SD-100`) |

Also: [`REQUIREMENTS.md`](./REQUIREMENTS.md) for the chat-first guided flow.

**How to read them.** **The documents come first**, ahead of instructions given earlier in
conversation (owner, 2026-10-09); when a request clashes with them, name the rule before building.
STORE.md and PRODUCT.md are decision logs, newest first, each row dated. **Within them the later
date wins**, and a prose section loses to any later dated row, and many prose sections (written
2026-08-22) were never updated. STORE.md's header ("nothing implemented") and its `apps/web/store`
paths are stale; the `check:*` guards and monorepo paths PRODUCT.md names do not exist here. A
decision the owner gives in conversation is newer than both, and is recorded in the code comment
where it lands. **Never fill a gap with a convention: read the value from the spec or the Figma file
first** (`SD-210`), and when nothing rules, ask.

## What the storefront is

- voilet is an **AI-powered theme and application generator**: a buyer describes the admin they need
  and receives **editable frontend source**. **Frontend only**; the buyer connects their own backend,
  and the store says so early (PROJECT.md, `PD-898`).
- The store is **chat-first** (`SD-157`, `SD-215`, `SD-216`): one page, `/`, where Generate opens a
  conversation. Its information architecture is the Figma Hi-Fi file (`SD-198`), file
  `P0uz7pu7REAPZQhaXgiGPd`, Design System page `0:1`, Hi-Fi `227:13`.
- **Phase 1 is design and UI/UX with mock data** (`SD-009`, `SD-221`). The backend comes later. Mock
  is fine; **mock that pretends is not** (see "Demo and mock" below).
- The quality bar is best-in-class, set by the revenue target (`SD-042`).
- **The chat never goes away** (owner, 2026-10-09): a reader can always keep talking. New surfaces
  (pricing, themes, previews) open as a side panel of the conversation, never as a page that replaces
  it. **Pricing has no route** (owner, 2026-10-09): it belongs to the home screen. Every Pricing
  control is a button calling `useOpenPricing()` (`panel-store.ts`): in a conversation the panel
  opens there; on the home page an empty conversation opens with it; anywhere else it goes home and
  opens it there.
- **Sign-in waits for Download** (owner, 2026-10-12): with Voilet, the built-in model, a guest builds,
  applies themes and reaches the summary signed out; Download is the first thing that asks to sign in,
  and it carries on once they are in. Editing a theme (drag and drop, text) is a later feature and
  will also ask. External models (ChatGPT, Claude) spend tokens and need payment past a limit: the next
  rule, not built yet.
- **Only what the reader types reaches the conversation** (owner, 2026-10-09). A button (Pricing,
  a reply's action) opens its panel silently: no message on the reader's
  behalf and no reply. A typed side intent such as "pricing" shows the reader's words and gets one
  plain sentence back, never the recipe question, and leaves the recipe and the open question as
  they were (`activeQuestion` in `thread.tsx`). An empty conversation shows the home page's welcome
  (`Welcome` in `hero.tsx`, one component for both) until the first message.

## Rules that do not bend

**Data, not literals** (`SD-028`, STORE.md "Five rules")
- Every price, count, version, availability string and piece of page content comes from
  `src/data/*.ts`, never typed into a component. One list per fact: derive, never duplicate.
- **Plans and entitlements have one source** (`PD-1246`): `src/data/plans.ts` (Free, Theme Licence,
  Pro Subscription; Agent Credits and Deployment Services as add-ons), with the invariants in
  `src/plans-core.ts` under `pnpm test`. Every price is a sample (`mock: true`, a "Sample price"
  marker wherever it shows, never in a legal page). `src/data/pricing.ts` is superseded; do not read it.
- Free vs Pro is **computed, never stored**: `isFree(design, page?)` in `src/entitlement-core.ts` is
  the only place the rule lives (`PD-866`, `PD-867`). Free = the **Voilet** design and no `pro` mark;
  **exactly one design carries a Free badge**. Framework and CSS are never tier axes.
- One `h1` per page, no skipped heading levels. Every section works empty. Content is props.

**Claims** (PRODUCT.md §8, SEO.md, `SD-135`, `SD-225`, `PD-1235`)
- No count, rating, logo, benchmark or compatibility claim that is not derived and true; derive the
  count or leave it out, and never "fifteen styles" until fifteen ship.
- Say **"built to"**, never "certified"; no IEEE/ISO mark. No "Ready in 5 minutes", "Fully tested",
  "Enterprise grade", "Largest inventory". No five-minute claim until `B-36` measures it.
- **Never sell what is not built** (`SD-023`, `PD-1196`, `PD-1205`): a price may be published, a
  checkout may not. **Bootstrap and Bulma are not built**: never offered as available. Only
  Voilet, Console, Board and Suite have Vue/Angular renderers (`PD-1005`). Angular is a library and
  gallery, not fifty screens. **No Figma** is shipped or promised.
- Never "lifetime updates" or "free forever": a purchase owns **the major it was bought in**
  (`PD-1230`). No agent drafts licence text (PRODUCT.md "Licensing").
- **Theme names** (`PD-898`, `PD-741`): buyers read the label (Voilet, Console, Board, Suite, Desk,
  Rack, Counter, Panel, Flow, Reach, Cloud), never the internal id. `neon`, `jira`, `zoho`, `swift`
  and any other company's brand **never appear on screen**. No third-party marks or logos; demo data
  uses no real people or companies. **One exception** (owner, 2026-10-12): the share dialog shows each
  service's own logo (Simple Icons, CC0, `public/share/`) on its brand colour (`--brand-*`).
- Do not mix **Viliha**, **Voilet** and **VuiAdmin** as product names in the interface (`SD-159`); the
  assistant is "Voilet", not "Voilet AI" (`SD-223`).

**Pages** (SEO.md)
- A new page passes SEO.md's six-check gate, has a written title (about 45 to 60 characters),
  description (about 120 to 160), `h1`, and a 40 to 80 word direct answer where it answers a
  question. Never generate framework-by-market doorway pages.
- Structured data only for what the page visibly says; never `Review` or `AggregateRating`.
- Settings, account and login surfaces are `noindex`.

## Design language

- **Tokens, never hex.** `--store-*` in `app/_vendor/store.css` (Figma Design System page, `SD-200`)
  and `--tn-*` in `app/globals.css`. A colour utility resolves to a token. Control edges use
  `--store-control-border` (3.69:1, WCAG 1.4.11); `--store-card-border` is for decorative card edges
  only (`SD-226`).
- **Type** (`SD-163`, `SD-200`): Plus Jakarta Sans for headlines, **Inter for body** (today the body
  is Jakarta: conflict 11); body copy at 1.5 line height. Use the size tokens
  (`--store-headline-*`, `--store-body-1..4`) and the `FONT`/`BODY_*` constants in
  `app/_components/type.ts`.
- **Focus** is a border colour change only: no glow ring, no ground change (`SD-220`, by request).
- **Buttons** (owner, 2026-10-12): every text button is `btn` + `btn-sm`/`btn-md`/`btn-lg` (32/36/40px,
  pills) + a colour variant (`btn-primary/secondary/outline/soft/ghost`), defined once in `globals.css`.
  **Never set a button's height, padding or text size inline.** Disabled is a grey fill, not opacity
  (`SD-164`, built into `btn`); an icon-only button always has an `aria-label`.
- **Icons**: from `app/_vendor/icons.tsx`, the repo, or the design. Search before drawing one
  (`SD-168`). Figma assets are downloaded into `public/` and used exactly as drawn.
- **Motion**: `prefers-reduced-motion` jumps to the end; every animation honours it.
- Sizes follow **the storefront's own scale** (14px body, about 40px controls) even where a Figma
  frame is drawn larger (decided for the auth modal, 2026-10-09).

## Responsive: every feature, every time

- **No page scrolls sideways at any supported width** (`SD-073`: 320, 375, 768, 1280, 1920).
- Check every change at **390, 768 and 1440** at least, in a real browser, before calling it done.
- The home chip row is the eleven themes in one non-wrapping row, scrollbar hidden (`SD-206`; today
  it is domains and wraps: conflict 10). Elsewhere, prefer rows that wrap.
- Phone header controls clear 44px (`SD-076`). Tables stack below `sm`/`md` (`SD-075`). Inside panes,
  prefer container queries (`SD-180`).

## Next.js conventions (STORE.md "Next.js conventions", later `SD` rows win)

- Server components by default; `"use client"` on the leaf that needs it, never on a page or layout.
- The chrome (rail, top bar, footer) lives in the root layout (`SD-215`); a client screen signals it
  through a `data-*` attribute on the document, not a prop (`SD-218`).
- Shared client state is a module store read with `useSyncExternalStore` (`SD-196`), like
  `drawer-store.ts`, `domain-store.ts`, `auth-store.ts`. `localStorage` is read after hydration, never
  during render (`SD-177`).
- `next/link` for internal links, `next/image` for images, the Metadata API per route.
- `NEXT_PUBLIC_*` read statically, wrapped in `envOr` (`SD-187`). No provider SDK in this app
  (`SD-029`).

## Demo and mock

- Mock is allowed and expected now, **if it says so**: in the file's own header, and on screen where a
  visitor could mistake it for the real thing (`SD-221`, `SD-123`, `SD-178`).
- Every demo-only piece carries a grep-able marker, `DEMO-ONLY(<name>)`, with a comment that says what
  replaces it: `grep -rn "DEMO-ONLY" app src`. Current ones: `loading-delay`, `theme-names`,
  `pro-pages`, `auth`, `theme-dark` (the preview's dark mode is the light capture inverted), `generate` (after a theme is chosen, the build's steps tick on a timer before the summary; `generating.tsx`), `live-preview` (Show Preview frames a stand-in admin in `public/live-preview/`; `livePreviewUrl` in `src/data/live-preview.ts` is the one address to swap for the generated build), `save-api` (Save keeps a guest's designs in this browser, and an account's through `accountApi` in `saved-store.ts`, which stores them locally until the API exists; a guest's saves join the account on sign-in), `checkout` (a labelled demo checkout in the side panel: test card, nothing sent or kept; it records the plan or a theme licence on the demo account; owner, 2026-10-12, over `SD-023`), `prices` (`src/data/plans.ts`: sample prices, `mock: true`).
- Nothing a visitor types leaves the browser in phase 1, and no password is ever stored.

## Current conflicts with the documents (audit 2026-10-09)

**The documents win** (owner, 2026-10-09): they outrank instructions given earlier in conversation.
**Content is deferred** (owner, 2026-10-09): work on design, layout and routes first; the content
conflicts (1 to 6) wait.
Each item below is built and contradicts a doc rule. Fix them when asked, and do not build on them
in the meantime. Remove an item once it is fixed.

**Content (deferred)**
1. Hero "Get full-stack templates in seconds" (`hero.tsx`): voilet is **frontend only** (PROJECT.md,
   `PD-898`), and "in seconds" is an unmeasured speed claim (`SD-135`, `PD-883`).
2. Hero "Choose from 200+ templates": a typed, unbacked count (`SD-028`, `PD-899`, §10b).
3. 22 of 36 gallery cards are titled with a theme that has no Vue/Angular renderer and still tagged
   Vue and Angular (`PD-1005`; `THEMES` now honours it, so Explore and the design step filter by framework); random titles put another theme's name on Voilet's screenshot
   (`SD-141`, `SD-170`).
4. Theme preview lists invented Pro pages, "Notifications" and "Authentication" (`SD-157`,
   `PD-1196`).
5. Copy is typed inside components rather than read from `src/data/` (`SD-028`).
6. The pricing panel (no route; see above) renders `PD-1246`'s plans with sample prices; the Pro Subscription card sits
   beside the licence, disabled, where § 10a puts subscriptions on their own page (the owner's
   choice). The home FAQ's "shipping it inside a product you sell" contradicts SaaS redistribution
   being **open**; it is licence wording, so counsel's, and unchanged. `Q-PLN-01` to `Q-PLN-07` in
   PRODUCT.md are the plan questions nobody has answered.

**Design and routes, not yet fixed**
7. About 27 internal links lead to routes that do not exist (rail, footer, the auth dialog's
   `/terms` and `/privacy`): `SD-018`.
8. Body text is Plus Jakarta Sans (`--store-font-body`): `SD-163`/`SD-200` say **Inter for body**.
9. Disabled controls use opacity (8 places in `recipe-ui.tsx`, `explore.tsx`): `SD-164` says a grey
   fill.

**Kept by the owner after the docs were put first** (2026-10-09, an explicit rollback): the frosted
glass on the Standards section, the sidebar card's glow, `ScatterGlow` behind the footer and `Aurora`'s four
glows (`SD-217`, `SD-132`, `SD-203` differ). The sidebar card's shadow is a hex again because of it.
Do not "fix" these.

**Fixed 2026-10-09:** Standards restored (`SD-225`; a section of the home page with no route and no
sidebar item since 2026-10-12), and pricing
made a panel of the home screen with no route (owner's call, over `SD-228`'s `/pricing` page); top bar search, Pricing and Sign in back (`SD-208`); one
scrolling chip row (`SD-206`); sign-in is one dialog: logo, title, then Google, GitHub and Email options, Email
swapping in an email and password form, plus sign up (with Google and GitHub too) and a three-step
forgot password (owner, 2026-10-11, over `SD-178`); no demo note on screen (owner, 2026-10-11);
colours in component styles are tokens; replies stream at 18ms a word (`SD-216`).

## Working rules

- Calculations are done in Python and stated with their inputs (organisation rule).
- `pnpm test` runs the plan invariants (Node's runner, no dependency); `pnpm check-types` also checks
  the type-level ones.
- Verify in a real browser (headless Chrome against the dev server on `:3000`, which is the owner's:
  read it, never restart it). Keep test reports short.
- Read `git diff` before any commit; never `git add -A` unread work (`SD-169`). Commit only when asked.
- A comment explains *why* in the code it governs; the docs are not restated in prose elsewhere.
