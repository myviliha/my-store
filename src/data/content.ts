import { AVAILABILITY, type AvailabilityState } from "./availability";
import { BRAND, SKUS, skuName } from "./catalogue";
import { LICENCE_TIERS } from "./pricing";
import { PRODUCTS, productBySlug } from "./products";

/**
 * **The website copy, from the PO's copy specification** (`docs/saas/…`, second document,
 * sections 1 to 80).
 *
 * This file used to say "DRAFT COPY. Engineering wrote this; marketing replaces it." That
 * replacement arrived on 2026-08-14 as an 80-section specification of the actual initial copy for
 * every public page, and this is it. The prediction held: **no page or component changed shape**,
 * because copy reaches blocks as props (decision F5). Section numbers are named on each block so a
 * reviewer can check the site against the source rather than against taste.
 *
 * ## Three rules the specification sets, and how they are applied here
 *
 * 1. **Replace `[BRAND]` with the product name.** That is `BRAND` from `catalogue.ts`, so it is
 *    still one string to change.
 * 2. **Replace `[PRODUCT_COUNT]` and friends with real data.** Where the number exists it is
 *    derived (the product count below is `PRODUCTS.length`) or counted from the repository. Where
 *    it does not exist, the specification says to omit it, so there is no customer count anywhere.
 * 3. **Do not publish fabricated statistics, testimonials, reviews or claims.** So §15's
 *    testimonial section has no testimonials and is not rendered.
 *
 * **Where the specification hedges, we answer.** Its FAQ copy says things like "commercial usage
 * depends on the license purchased" because the document is written for any marketplace. We know
 * our own licence terms, and §78 asks for clear and helpful, §100 for actual information. So the
 * questions and the structure are the specification's, and the answers are ours. That is the one
 * place this file deliberately does more than transcribe, and it is recorded as `CR-MKT-005`.
 */

/**
 * **The service period, and the edition states, read rather than retyped.**
 *
 * The price list moved to §15.2's two cards on 2026-08-21 and this file did not follow it, which review
 * on 2026-08-22 found published in eleven places: a FAQ answering "three on Starter, ten on Business",
 * a licence page defining a seat, a pricing FAQ promising updates "free forever", and a home-page
 * feature row offering a Figma design source that §24.3 forbids promising. Every one of them was
 * answering a question about a price list that no longer exists, in structured data as well as on the
 * page, because `FAQ_ITEMS` feeds `faqSchema`.
 *
 * So the terms are derived. `SERVICE_PERIOD` is the licence's own words for what has a term, and
 * `editionsIn` groups the catalogue's states, so the answer to "which frameworks can I download" moves
 * when a package does. `Intl.ListFormat` writes the list, because a hand-rolled comma-and-"and" is the
 * kind of code this repository's ladder exists to skip.
 */
const SERVICE_PERIOD = LICENCE_TIERS[0]?.included ?? "";
const ONE_EDITION = LICENCE_TIERS[0]?.price ?? "";
const ALL_EDITIONS = LICENCE_TIERS[1]?.price ?? "";

const LIST = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
const editionsIn = (state: AvailabilityState): string =>
  LIST.format(AVAILABILITY.filter((row) => row.state === state).map((row) => row.edition));

/**
 * §69, the SEO title patterns.
 *
 * **Two of the five patterns are not here**, and that is the specification applied rather than
 * ignored. `[CATEGORY] Templates & Components` produces "Admin templates Templates & Components"
 * against our labels, because half our categories already contain the noun, so each category
 * carries its own title in `taxonomy.ts` and follows the pattern's shape instead of its letter.
 * The same for frameworks. What is left is what composes cleanly.
 */
export const SEO_TITLE = {
  product: (product: string, framework: string) => `${product}, ${framework} | ${BRAND}`,
  article: (title: string) => `${title} | ${BRAND}`,
  docs: (page: string) => `${page} | ${BRAND} Documentation`,
} as const;

/** §80. The one sentence the whole site is saying, and the CTA that closes every page. */
export const BRAND_MESSAGE = {
  core: "Build less UI. Build more product.",
  supporting: "Production-ready templates, components, and UI systems for modern developers.",
  finalCta: "Start Building",
} as const;

/** §1, brand positioning. Used in metadata, the footer blurb and the about page. */
export const POSITIONING = {
  primary: "Production-ready templates, components, and UI systems for modern developers.",
  secondary:
    "Build beautiful websites and powerful applications faster with professionally crafted frontend resources.",
  short: `${BRAND} is a premium marketplace for admin dashboards, website templates, UI components, forms, blocks, and complete frontend experiences.`,
  oneLine: "Everything you need to build modern web interfaces faster.",
} as const;

/** §2 and §77, the call-to-action library. One label per job, so two pages never invent a third. */
export const CTA = {
  exploreTemplates: "Explore Templates",
  browseComponents: "Browse Components",
  viewProducts: "View All Products",
  liveDemo: "Live Preview",
  getStarted: "Get Started",
  startBuilding: "Start Building",
  viewDetails: "View Product",
  subscribe: "Subscribe",
  getTemplate: "Get This Template",
  browseFree: "Explore Free Resources",
  learnMore: "Learn More",
  viewDocs: "View Documentation",
  whatsIncluded: "See What's Included",
  viewAll: "View All",
  readMore: "Read More",
  viewChangelog: "View Changelog",
  talkToSales: "Contact Sales",
} as const;

/** Derived, not typed twice: §3 asks for a real product count and this is where it comes from. */
const PRODUCT_COUNT = PRODUCTS.length;

/** §3, the announcement bar. */
export const ANNOUNCEMENT = {
  message: "New resources are arriving regularly. Explore the latest templates and components.",
  href: "/products",
  linkLabel: "Explore what's new",
} as const;

/** §3, the home page: SEO, hero, and the trust row underneath it. */
export const HOME = {
  seo: {
    title: `Premium UI Templates, Components & Admin Dashboards | ${BRAND}`,
    description:
      "Build faster with production-ready admin dashboards, website templates, UI components, forms, blocks, and frontend resources for modern web applications.",
  },
  /**
   * The conversational welcome, which is the fold (`SD-132`).
   *
   * **Every string here is the brief's, not a paraphrase.** `reference/requirement/` gives exact
   * copy for this screen, and copy written to the same intent in different words is copy that fails
   * review twice: once for the difference and once for nobody being able to tell which was meant.
   *
   * **What the brief forbids is as load-bearing as what it asks for**: no "Ask me anything", no model
   * selector, no simulated reasoning, no fake terminal output. The helper says "Guided theme setup"
   * precisely so nobody reads this as a chatbot. It is a configurator with a text field.
   */
  welcome: {
    h1: "Find your next admin frontend.",
    lead:
      "Tell Voilet what you\u2019re building. Choose a design and supported framework, preview your " +
      "pages, and download your theme.",
    /** The assistant's opening line. One sentence and three examples, which is the brief's own. */
    greeting:
      "Hi, I\u2019m Voilet, your setup guide. What kind of admin are you building? Try \u2018CRM\u2019, " +
      "\u2018SaaS\u2019 or \u2018digital products\u2019.",
    /** The helper that stops this reading as a chatbot. Visible, not a tooltip. */
    helper: "Guided theme setup",
    composerLabel: "Describe your admin or enter keywords.",
    placeholder: "CRM admin, React, Tailwind CSS\u2026",
    submitLabel: "Find my theme",
    /**
     * The quick choices, with stable ids.
     *
     * **A button sends its id and never its label** (`SD-131`): reading the label back is how
     * "Digital products" becomes an unrecognised recipe the day somebody improves the copy.
     */
    choices: [
      { id: "crm", label: "CRM" },
      { id: "saas", label: "SaaS admin" },
      { id: "ecommerce", label: "Digital products" },
    ],
    browse: { label: "Browse themes instead", href: "/explore" },
    freeBrowse: { label: "Browse Free themes", href: "/explore?tier=free" },
    /**
     * Three real screens, as the evidence beside the composer.
     *
     * **The USP table asks for "real screenshots of several pages, not one hero mockup"**, and these
     * are actual captures from `public/gallery/`. The captions name the page, because an unlabelled
     * screenshot is decoration and a labelled one is proof. `Demo data` is stated once rather than
     * stamped on each, which is the same claim made honestly and quietly.
     */
    evidence: [
      { src: "/gallery/crm.jpg", caption: "CRM dashboard", width: 1440, height: 900 },
      { src: "/gallery/create-invoice.jpg", caption: "Create invoice", width: 1440, height: 900 },
      { src: "/gallery/analytics.jpg", caption: "Analytics", width: 1440, height: 900 },
    ],
  },
  hero: {
    eyebrow: "Built for Modern Developers",
    title: "Build Faster with Production-Ready UI Templates and Components",
    lead: "Skip the repetitive frontend work. Get beautifully designed admin dashboards, website templates, components, forms, and complete UI systems built to help you ship faster.",
    /**
     * The reassurance line under the hero's actions, which the approved landing page carries.
     *
     * **Only claims this repo can back.** That page says "One-time payment · Lifetime updates · Use on
     * unlimited projects"; the first two are what `pricing.ts` sells today and the third is a licence
     * term. **The `$49`/`$99` model landed on 2026-08-21 and this string moved with it**, from "Lifetime
     * updates" to the real term, which is what §15.2 grants: 12 months of updates, hosted configuration
     * and regeneration, after which the downloaded source keeps working forever.
     */
    note: "One-time payment · 12 months of updates · Unlimited projects",
    primary: { label: CTA.exploreTemplates, href: "/products" },
    secondary: { label: CTA.browseComponents, href: "/components" },
    supporting: "React, Next.js, Tailwind CSS, Vue, HTML and more",
  },
  /** §11, on the home page. The same six the standalone section uses. */
  features: {
    eyebrow: "Why This One",
    title: "Built to Help You Ship",
    lead: "Interfaces designed around real product requirements rather than isolated visual concepts.",
    items: [
      {
        title: "Production Ready",
        body: "Start with interfaces designed around real product requirements rather than isolated visual concepts.",
      },
      {
        title: "Developer Friendly",
        body: "Clean structure, reusable components, practical documentation, and modern development patterns.",
      },
      {
        title: "Responsive by Default",
        body: "Build experiences that work beautifully across desktop, tablet, and mobile.",
      },
      {
        title: "Designed to Customize",
        body: "Make the UI your own without rebuilding everything from scratch.",
      },
      {
        title: "Regularly Updated",
        body: "Products evolve with new features, improvements, fixes, and framework updates.",
      },
      {
        title: "Clear Licensing",
        body: "Know what you can use, where you can use it, and what your purchase includes.",
      },
    ],
  },
  closing: {
    title: "Your Next Project Does Not Need to Start From Scratch",
    lead: "Start with a professional foundation and spend your time building what makes your product unique.",
    action: { label: CTA.exploreTemplates, href: "/products" },
    footnote: "The component libraries are free. The licensed editions are a one-time payment.",
  },
} as const;

/**
 * The workspace chrome around the welcome state (`SD-157`, `SD-158`).
 *
 * `reference/chatgpt/voilet.md` §§3 and 4: the left sidebar, the category tabs and the theme
 * gallery. Every string a human reads lives here, same as `HOME.welcome`; the icons and the routes
 * they link to are structural and stay in the components.
 */
/**
 * The brand header's navigation, from the guideline's own navigation sheet (`SD-166`).
 *
 * **A different information architecture to `PRIMARY_NAV`, and the dev ruled it twice.** The
 * marketing bar is Explore, Frameworks, Pricing, Use Cases, Agent Support, Resources; this one is
 * the six the guideline draws. `SD-164` held it back as a product decision rather than a styling
 * one; the dev then supplied the target screen and said "implement the same", which is the ruling.
 *
 * **`Home` is `/platform`, not `/`.** `/` is the workspace itself since `SD-157`, so a "Home" link
 * pointing there would be a control that reloads the page you are on. The eleven promotional
 * sections are what a visitor means by home, and they live at `/platform` (`SD-160`).
 */
/**
 * The summaries an answer can carry, other than pricing (`SD-192`, task `A6`).
 *
 * **Facts and routes, never prose.** Each row is a line the visitor can act on, and every one of
 * them points at a page that exists. Pricing is not here because it is not a list of links: it reads
 * `tiers.ts` and scrolls the page beside it, which is a component rather than data.
 *
 * **Three, not six.** `A6` listed explore, themes, a theme detail, products, compare and support.
 * The three with a summary are the three whose intent already has a destination (`SD-190`): an
 * intent earns a summary when one page is its answer. `find_theme` answers with theme cards in the
 * transcript already, and a theme detail needs the `of` field and a screen that does not exist yet.
 */
export const SUMMARIES = {
  frameworks: {
    lead: "Six editions, one design system.",
    links: [
      { label: "Every edition and what ships with it", href: "/products" },
      { label: "Compare two side by side", href: "/compare" },
      { label: "What a download contains", href: "/download" },
    ],
  },
  support: {
    lead: "The documentation, and how to reach us.",
    links: [
      /* `/guides` and not `/docs`: the documentation is exported into `public/docs` by the docs app
         (`SD-090`) rather than being a route here, so it 404s in dev and in any build where that
         export has not run. A summary that offers a dead link is worse than one that offers fewer. */
      { label: "Guides", href: "/guides" },
      { label: "Support and contact", href: "/support" },
      { label: "Setting up an agent", href: "/account/agent-setup" },
    ],
  },
  compare: {
    lead: "Editions side by side.",
    links: [
      { label: "Compare editions", href: "/compare" },
      { label: "Every edition", href: "/products" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
} as const;

/**
 * The workspace settings console (`SD-189`, task `B3`, the dev's third reference screen).
 *
 * **`href` is what says a section exists.** Only General is built; everything else is `B5`, one task
 * per screen because the dev is gathering requirements by looking at them. A sidebar entry with no
 * `href` renders as a marked row rather than a link that 404s.
 *
 * **Six of these model something the schema does not have.** There is no organisation, membership,
 * role, seat or invitation in `schema/backend/schema.sql`; Members, Groups, Permissions & roles,
 * Identity & access, Access tokens and Workspace analytics all assume one. The dev has ruled
 * workspaces are real product intent, so these are drawn ahead of the model.
 */
export const CONSOLE: {
  readonly back: string;
  readonly workspace: { readonly name: string; readonly meta: string };
  /** `href` is optional for the reason `ACCOUNT_MENU` gives: the marked-row branch must stay live. */
  readonly groups: readonly {
    readonly id: string;
    readonly label: string;
    readonly items: readonly {
      readonly id: string;
      readonly label: string;
      readonly href?: string;
    }[];
  }[];
  readonly soon: string;
} = {
  back: "Back to the workspace",
  workspace: { name: "viliha", meta: "Business" },
  groups: [
    {
      id: "access",
      label: "Access",
      items: [
        { id: "general", label: "General", href: "/settings" },
        { id: "members", label: "Members", href: "/settings/members" },
        { id: "groups", label: "Groups", href: "/settings/groups" },
        { id: "roles", label: "Permissions & roles", href: "/settings/roles" },
        { id: "identity", label: "Identity & access", href: "/settings/identity" },
        { id: "tokens", label: "Access tokens", href: "/settings/tokens" },
      ],
    },
    {
      id: "billing",
      label: "Billing",
      items: [{ id: "billing", label: "Billing", href: "/settings/billing" }],
    },
    {
      id: "plugins",
      label: "Plugins",
      items: [
        { id: "plugins", label: "Plugins", href: "/settings/plugins" },
        { id: "apps", label: "Apps", href: "/settings/apps" },
        { id: "skills", label: "Skills", href: "/settings/skills" },
        { id: "marketplaces", label: "Marketplaces", href: "/settings/marketplaces" },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      items: [
        { id: "workspace-analytics", label: "Workspace analytics", href: "/settings/analytics" },
      ],
    },
  ],
  soon: "Coming soon",
};

/**
 * The General page (`SD-189`, task `B4`).
 *
 * **The ids are not fabricated, and that is the one thing on this screen that had to be decided
 * rather than copied.** The reference shows `org-4UYEWVxCdb9ZGTdNijSXkF2w` beside a copy button.
 * Drawing a plausible organisation id with a working copy button hands someone a string that looks
 * like a real identifier and is not one, which is the exact failure the board flagged before this
 * was built: it would be pasted into a support ticket or a config file and waste somebody's day.
 * So the field says what is true, the copy control is disabled, and the design is unchanged.
 */
export const CONSOLE_GENERAL = {
  title: "General",
  lead: "Customize your workspace.",
  branding: {
    title: "Branding",
    nameLabel: "Workspace name",
    logoLabel: "Logo",
    logoHint: "Drop a file here to upload",
    logoAction: "Browse files",
  },
  ids: {
    title: "Workspace IDs",
    notIssued: "Not issued yet",
    rows: [
      { id: "org", label: "Organization ID" },
      { id: "workspace", label: "Workspace ID" },
    ],
  },
  analytics: {
    title: "Analytics and reporting",
    rows: [
      {
        id: "task-insights",
        label: "Enable task insights",
        hint: "Enable message classification for my workspace.",
        on: false,
      },
      {
        id: "impact-surveys",
        label: "Enable impact surveys",
        hint: "Run surveys for eligible workspace users.",
        on: false,
      },
      {
        id: "identifiers",
        label: "Include user identifiers in survey exports",
        hint: "Exports include each respondent's name and email.",
        on: true,
      },
    ],
  },
  notice:
    "Nothing on this page is saved. There is no workspace behind it yet, so every control here is the design ahead of the backend.",
} as const;

/**
 * The workspace switcher's contents (`SD-188`, the dev's second reference screen).
 *
 * **There is no workspace behind any of this.** `schema/backend/schema.sql` has no organisation, no
 * membership, no role and no seat; the word `workspace` appears there as a **design id**. The dev
 * has ruled workspaces are real product intent and that this drawing is how the requirements get
 * gathered, so it is a mockup ahead of a model rather than over one we decided against.
 *
 * **`notice` is on screen.** Switching changes what is drawn and nothing else, and a switcher that
 * looks like it moves you between real tenants is the store brief's §3 in the one place a buyer
 * would later blame us for losing their work.
 */
export const WORKSPACES = {
  signedInAs: "sumanb@viliha.com",
  soon: "Coming soon",
  /* Every member declares `personal`, for the reason `ACCOUNT_MENU.items` gives above. */
  items: [
    { id: "viliha", name: "viliha", personal: false },
    { id: "personal", name: "Personal account", personal: true },
  ],
  actions: [
    { id: "create", label: "Create or join a workspace" },
    { id: "add-account", label: "Add account" },
  ],
  notice: "Nothing is stored yet. Switching changes what you see in this browser only.",
} as const;

/**
 * The account menu at the rail's foot (`SD-186`, the dev's first reference screen).
 *
 * **Three of the five rows carry no `href`, and that is the data saying so rather than the
 * component deciding.** Workspace settings is task `B3` and has no route yet; Personalization has
 * no page at all; the workspace row's chevron is the switcher, `B2`. `Settings` and `Help` point at
 * routes that exist today, so they are real links.
 *
 * **`Settings` opens in a new tab, which is the dev's ruling** (`SD-184`): *"it should be a separate
 * page, open in new tab."* Settings is somewhere you go and come back from, not a route that
 * replaces the conversation you were having, and a new tab is the only arrangement that keeps the
 * conversation exactly as it was.
 *
 * **`viliha` and `Business` are placeholders and there is no workspace behind them.**
 * `schema/backend/schema.sql` has no organisation, membership, role or seat: the word `workspace`
 * appears there as a **design id**. The dev has ruled workspaces are real product intent, so this
 * is a mockup ahead of a model rather than over one we decided against.
 */
/**
 * **Annotated rather than inferred, so `href` stays `string | undefined`** (`SD-195`).
 *
 * With `as const` and every item now carrying a real route (`SD-193`), TypeScript narrowed
 * `item.href === undefined` to `never` and the component's marked-row branch stopped compiling. The
 * branch is not dead: it is what draws the next row added before its page exists, and losing it
 * would mean the next one links to a 404. Declaring the shape keeps the check the component
 * performs a check the types allow.
 */
export const ACCOUNT_MENU: {
  readonly label: string;
  readonly workspace: { readonly name: string; readonly plan: string };
  readonly items: readonly {
    readonly id: string;
    readonly label: string;
    readonly href?: string;
    readonly newTab?: boolean;
  }[];
  readonly signOut: string;
} = {
  label: "Account",
  workspace: { name: "viliha", plan: "Business" },
  /*
   * **Every item declares every key, `undefined` included.** With `as const` the array's element
   * type is a union, and a property present on only some members cannot be read off the union at
   * all: `item.href` would not compile. Writing `href: undefined` puts the key on every member, so
   * the check the component actually performs is the check the types allow.
   */
  items: [
    { id: "workspace-settings", label: "Workspace settings", href: "/settings", newTab: true },
    {
      id: "personalization",
      label: "Personalization",
      href: "/settings/personalization",
      newTab: true,
    },
    { id: "settings", label: "Settings", href: "/account/settings", newTab: true },
    { id: "help", label: "Help", href: "/support", newTab: false },
  ],
  signOut: "Log out",
};

/**
 * The two-pane workspace's own words (`SD-179`).
 *
 * **`dockTitle` and `dockHint` exist only below `lg`.** Above it the chat is a visible column and
 * needs no label on screen; on a phone it is a 72px bar over the page, and a bar with no words is a
 * control nobody presses.
 *
 * **`chatLabel` is the `<aside>`'s accessible name, and only when there is a page beside it.** At
 * `/` the conversation is the document and carries `role="main"` instead, so naming it there would
 * label the page after its own contents.
 */
export const PANES = {
  chatLabel: "Assistant",
  dockTitle: "Ask about this page",
  dockHint: "Your conversation is still here",
} as const;

/**
 * The sign-in dialog's copy (`SD-178`).
 *
 * **The subtitle names what an account here actually gets you.** The reference's reads "you'll get
 * smarter responses and can upload files, images, and more", none of which is true of this product:
 * nothing is uploaded, nothing is generated, and the model does not change. What an account does
 * change is that a configuration survives the browser and a purchase has somewhere to land, so that
 * is what it says. Copying the reference's sentence would be the brief's §3 in the one place a
 * visitor is being asked for an identity.
 *
 * **`notice` is on screen and not only in a comment.** There is no OAuth client and no session
 * behind either button; the dialog says so rather than leaving a visitor to discover it.
 *
 * **`AUTH_DIALOG` and not `AUTH`, because `AUTH` is taken** and by the thing it would be confused
 * with: the §50 to §52 full-page screens further down this file, `/login`, `/register`, forgot and
 * reset. Two exports of one name in one module is a build error, which is how this was found, but
 * the near miss is the reason for the suffix rather than a number: these are the dialog's words and
 * those are the pages', and the pages still exist.
 */
export const AUTH_DIALOG = {
  title: "Log in or sign up",
  subtitle: "Save what you configure, pick it up on another device, and download what you buy.",
  google: "Continue with Google",
  or: "or",
  emailLabel: "Email address",
  continue: "Continue",
  close: "Close",
  notice: "Accounts are not switched on yet. This is the design ahead of the backend.",
  noticeSignedIn: "Signed in for this browser only. Nothing was sent and no account was created.",
} as const;

/**
 * What the rail says to a guest, from the ChatGPT reference the dev supplied (`SD-177`).
 *
 * **A guest sees a reason to sign in, not an account they do not have.** The reference puts a short
 * card at the rail's foot: a heading, one sentence naming what an account gets you, and a full-width
 * sign-in control. The signed-in shell replaces the whole card with the account row.
 *
 * **The sentence names only what this product actually does.** The reference promises saved chats,
 * image creation and file upload; of those, only the first is even half true here, since
 * `assistant-session-core` keeps one conversation on the device and nothing is uploaded or
 * generated. Copying the claim would be the store brief's §3 defect in the one place a visitor is
 * being asked to hand over an email.
 */
export const GUEST_RAIL = {
  heading: "Keep your work",
  body: "Sign in to save a configuration, come back to it later, and download what you buy.",
  signIn: "Log in",
  signUp: "Sign up for free",
} as const;

/**
 * The AI Builder rail's contents, from the dev's target screen (`SD-167`).
 *
 * **Three destinations, two marked Coming soon, and two lists of placeholder entries.**
 *
 * **The placeholder entries have nothing behind them, and that is a deliberate exception the dev
 * ruled twice.** The store's brief §3 says "do not show empty features as working tools", and
 * `WORKSPACE.sidebar` marks four rows "Not available yet" for exactly that reason:
 * `assistant-session-core` keeps one conversation slot, not a history, so there is no store of
 * projects or chats to list. The dev supplied the target screen and said "implement the design as
 * per the screenshot I shared", which is the ruling. They are built, and they are labelled here so
 * the next reader does not go looking for the query that fills them.
 */
export const BUILDER_RAIL = {
  newChat: "New chat",
  links: [
    { id: "libraries", label: "Libraries", href: "/support" },
    { id: "documentation", label: "Documentation", href: "/support" },
    { id: "themes", label: "Explore Themes", href: "/explore" },
  ],
  soon: [
    { id: "image", label: "Image" },
    { id: "agents", label: "AI Agents" },
  ],
  comingSoon: "Coming soon",
  /** Static. Nothing queries these; see the docblock above. */
  projectsHeading: "My projects",
  projects: [
    { id: "admin", title: "Admin Dashboard", meta: "Next.Js • Free • 2 days ago" },
    { id: "saas", title: "SaaS Management", meta: "React • Pro • 3 days ago" },
  ],
  chatsHeading: "Chats",
  chats: [
    { id: "workspace", title: "Project Workspace", meta: "Vue • Free • 5 days ago" },
    { id: "customers", title: "Customer Management", meta: "Next.js • Pro • 1 week ago" },
  ],
  account: { name: "Jordan Lee", meta: "Free plan · Account & billing" },
} as const;

/**
 * The builder's empty state, from the same screen.
 *
 * **`greeting` is split so the name can carry the brand colour** without the component slicing a
 * sentence, which is how a translated string ends up with the wrong half coloured.
 *
 * **`greeting` carries no name, because a guest has none** (`SD-177`, the dev's call: *"just `Hi`
 * when the user is not signed in, `Hi {{name}}` when they are"*). It read `Hi Alex` for everyone,
 * which greets a first-time visitor by somebody else's name on the first line of the product. The
 * name is appended by the component from `BUILDER_RAIL.account`, which is the same placeholder the
 * rail's foot shows: it was a **second** invented name, `Alex` here against `Jordan Lee` there, so
 * the one shell introduced itself twice under two identities.
 */
export const BUILDER_HOME = {
  greeting: "Hi",
  headlineRest: ", create your project here!",
  subtitle: "What kind of admin are you building?",
  placeholder: "Describe your admin or type a keyword…",
  credits: { used: "0", total: "/120 credits" },
  chips: [
    { id: "crm", label: "CRM Admin" },
    { id: "saas", label: "Saas Admin" },
    { id: "digital", label: "Digital Product Admin" },
    { id: "free", label: "Explore Free Themes" },
  ],
} as const;

export const BRAND_NAV = [
  { label: "Home", href: "/platform" },
  { label: "AI Builder", href: "/" },
  { label: "Template", href: "/explore" },
  { label: "Pricing", href: "/pricing" },
  { label: "Framework", href: "/products" },
  { label: "Resource", href: "/support" },
] as const;

export const WORKSPACE = {
  sidebar: {
    title: "Workspace",
    newChat: "New chat",
    /**
     * **What "New Chat" cannot honestly promise.** The brief's own table asks it to "preserve the
     * previous conversation", which needs a history of more than one saved conversation.
     * `assistant-session-core` keeps exactly one slot, the same limit that makes the "Projects" row
     * below say "Not available yet" rather than open something empty. Clearing and starting over is
     * the one thing this control can actually do, and this line says so rather than implying more.
     */
    newChatNote:
      "Starts a new conversation on this device. There is no saved history yet, so the one you are leaving is not kept.",
    unavailable: "Not available yet",
    /**
     * The four rows the brief lists that have no backend behind them yet (§3): "Do not show empty
     * features as working tools ... unreleased Images, Libraries or agent integrations need an
     * explicit availability state." Descriptions are the brief's own "Function" column, so the row
     * says what it will do rather than only that it does not.
     */
    items: [
      {
        id: "images",
        label: "Images",
        description: "Upload or select project logos, screenshots and other image assets.",
      },
      {
        id: "libraries",
        label: "Libraries",
        description: "Manage .md requirements, brand guidelines and reusable project instructions.",
      },
      {
        id: "projects",
        label: "Projects",
        description: "Open saved configurations, previews and downloads.",
      },
      {
        id: "agents",
        label: "AI Agents",
        description: "Access supported agent connections and MCP setup.",
      },
    ],
    recentHeading: "Recent",
    continuePrefix: "Continue: ",
    signIn: "Sign in",
    plans: "Plans & pricing",
    /**
     * The way back to the marketing site (`SD-160`). `/` is the workspace now, so the eleven
     * promotional sections live at `/platform` and nothing in the shell linked to them: a visitor
     * who wanted to read what the product is had no route out of the composer.
     */
    tour: "What Viliha builds",
    help: "Help",
    expand: "Expand sidebar",
    collapse: "Collapse sidebar",
    openMenu: "Open workspace menu",
    closeMenu: "Close workspace menu",
  },
  /**
   * **The workspace publishes its own metadata** (`SD-160`). `/` and `/platform` both rendered
   * `HOME.seo` for a moment after the split, which is two sitemap URLs shipping byte-identical
   * title, description and OG copy: a duplicate signal we would be sending on purpose. What `/` is
   * for changed with the move, so what it says it is for has to change with it.
   */
  seo: {
    title: `Describe the admin you need, and build it | ${BRAND}`,
    description:
      "Tell Viliha what your admin has to do and get editable frontend source: a design system across six frameworks, the screens your business needs, and the theme they are built on.",
  },
  categories: {
    comingSoon: "Coming soon",
    /**
     * Docker gets its own line rather than sharing `comingSoon`'s silence, on the brief's own
     * instruction: "Never suggest that a Docker package is operational software unless its included
     * functionality is documented." Nothing here is documented, so the tab says that plainly.
     */
    dockerNote: "Not built. No Docker package exists here yet, so nothing about it is documented.",
  },
  gallery: {
    heading: "Explore themes",
    lead: "Five real designs from the catalogue. Preview any of them without an account, then use one to start your configuration.",
    preview: "Preview",
    use: "Use theme",
  },
} as const;

/**
 * §3's trust row, with the specification's heading and **only the numbers we can prove**.
 *
 * The specification lists four tiles and then says plainly: if real statistics are not yet
 * available, omit the numbers. We have no customer count, so there is no customer tile. The rest
 * are counted from the source you would be buying, and the product count is derived rather than
 * typed.
 */
/**
 * The four section heads the home page owns, and the six FAQ questions it selects.
 *
 * They were literals inside `home-sections.tsx` until review pointed at that file's own docstring,
 * which claimed every string came from here. A page that hardcodes its headings is a page phase 3
 * has to be audited rather than re-pointed.
 */
export const HOME_SECTIONS = {
  componentsCallout: {
    body: "Discover the full range of pages and components on offer, built to drop into your project and carry it further than a starting point.",
    action: "Explore All Components",
  },
  catalogue: {
    eyebrow: "Choose Your Stack",
    title: "One Design System, Every Framework You Ship In",
    lead: "The same screens, the same tokens, built natively for each stack rather than wrapped.",
  },
  availability: {
    title: "What You Can Download Today",
    lead: "Published without varnish, because the list changes and a stale one costs a refund.",
  },
  pricing: {
    title: "Pay Once, Keep the Source",
    lead: "No subscription. Twelve months of updates, and the source you downloaded never expires.",
  },
  faq: {
    eyebrow: "Licensing",
    title: "The Questions Buyers Ask Last",
    /** Selected from `FAQ_ITEMS` by exact question, so a rename fails rather than silently drops one. */
    questions: [
      "What exactly do I get when I buy?",
      "Is it a subscription?",
      "How do updates work?",
      "Can I use a product commercially?",
      "Which frameworks are supported?",
      "Do you offer refunds?",
    ],
  },
} as const;

export const PROOF = {
  eyebrow: "What is in It",
  title: "Everything You Need to Build the Interface",
  lead: "From a single component to a complete application, start with professionally crafted UI instead of starting from scratch.",
  items: [
    {
      value: String(PRODUCT_COUNT),
      label: "Products",
      detail: "Templates, component libraries and block sets, counted from the catalogue.",
    },
    {
      value: "67",
      label: "React components",
      detail: "Not variants of a button. Sixty-eight distinct components.",
    },
    {
      value: "58",
      label: "Blocks",
      detail: "The marketing sections this website is built from. You get them too.",
    },
    {
      value: "5",
      label: "Technologies",
      detail: "React, Next.js, Vue, HTML and Tailwind CSS today. Angular and Laravel in design.",
    },
  ],
} as const;

/** §4, the category grid heading. The copy for each category lives in `taxonomy.ts`. */
export const HOME_CATEGORIES = {
  eyebrow: "Categories",
  title: "Explore the Marketplace",
  lead: "Find the right starting point for your next project.",
} as const;

/** §5. No rating on a card anywhere: we have no reviews, and §15 forbids inventing them. */
export const HOME_FEATURED = {
  eyebrow: "Products",
  title: "Popular with Developers",
  lead: "Explore products developers are using to accelerate their next project.",
  cta: { label: CTA.viewProducts, href: "/products" },
} as const;

/** §7. */
export const HOME_FRAMEWORKS = {
  eyebrow: "Frameworks",
  title: "Built for Your Stack",
  lead: "Choose the technology you already use and start building from there.",
} as const;

/** §8, the component showcase. Every category listed exists in the library. */
export const COMPONENT_SHOWCASE = {
  title: "Do Not Build the Same UI Twice",
  lead: "Start with production-ready components designed to work together, then customize them to fit your product.",
  cta: { label: "Explore All Components", href: "/components" },
  secondary: { label: CTA.viewDocs, href: "/docs" },
} as const;

export const COMPONENT_CATEGORIES = [
  { title: "Buttons", body: "Every state designed, including the seven nobody draws." },
  {
    title: "Inputs and Forms",
    body: "Labels, descriptions, errors and validation, wired for keyboards.",
  },
  { title: "Tables", body: "Sorting, filtering, column control, import and export." },
  { title: "Cards", body: "The furniture a dashboard is actually made of." },
  {
    title: "Modals and Dropdowns",
    body: "Focus traps, escape keys and scroll locks handled.",
  },
  { title: "Navigation", body: "Sidebar, tabs, breadcrumbs and pagination." },
  { title: "Alerts and Toasts", body: "Feedback that does not move the layout under the reader." },
  { title: "Charts", body: "The chart primitives, themed from the same tokens." },
] as const;

/** §9, the dashboard showcase. */
export const SHOWCASE = {
  eyebrow: "Admin Templates",
  title: "From Blank Project to Working Dashboard",
  lead: "Start your SaaS, CRM, analytics platform, e-commerce application, or internal tool with a complete dashboard instead of an empty screen.",
  /**
   * The specification lists eight industry variants here. We ship **one** dashboard design, so
   * this section shows the one we have and says the variants are on the roadmap. Rule 8 of §122
   * forbids fabricating product counts, and eight named variants would be exactly that.
   */
  note: "Industry variants for SaaS, CRM, analytics, finance and e-commerce are on the roadmap. What ships today is one dashboard design, rendered from the components you would install.",
  cta: { label: "Explore Admin Templates", href: "/products" },
} as const;

/** §12. */
export const WORKFLOW = {
  eyebrow: "Your Workflow",
  title: "Choose. Customize. Ship.",
  lead: "Five steps, and the two in the middle happen before you pay.",
  steps: [
    {
      title: "Choose",
      body: "Find a template, component, or UI resource that matches your project.",
    },
    {
      title: "Preview",
      body: "Explore screenshots, responsive layouts, features, and live demos before you commit.",
    },
    {
      title: "Download",
      body: "Get the source files and everything your licence includes, straight after purchase.",
    },
    {
      title: "Customize",
      body: "Adapt the design, components, colors, layouts, and functionality to your product.",
    },
    {
      title: "Ship",
      body: "Spend less time building infrastructure and more time building your product.",
    },
  ],
} as const;

/** §13. The code sample is real: it is how a page in this site is built. */
export const CODE_DESIGN = {
  eyebrow: "Code and Design",
  title: "Designed for Developers. Crafted by Designers.",
  lead: "Get the visual quality of a professionally designed interface with the flexibility of source code you can actually work with.",
  code: `import { Pricing } from "@viliha/vui-blocks/pricing";

<Pricing
  title="Build more, spend less time starting over"
  plans={PRICING.plans}
  footnote="Cancel any time."
/>`,
  points: [
    "Clean component structure",
    "Responsive layouts",
    "Reusable UI",
    "Framework support",
    "Customizable design tokens",
  ],
  cta: { label: "Explore the Library", href: "/components" },
} as const;

/**
 * A card's availability, from the catalogue rather than from this file's copy.
 *
 * Review found `/free` inviting a visitor to "Get it" on `components-vue`, which the catalogue marks
 * `waitlist`. The wording was written once and the product's state moved underneath it, which is the
 * whole reason a page must not carry availability as prose. `FeatureItem`'s `availability` then drops
 * the purchase link and the purchase word by itself.
 *
 * A slug with no product (`/docs`) is not a product, so it stays an ordinary link.
 */
const offered = (href: string): "available" | "waitlist" | undefined => {
  const slug = href.startsWith("/products/") ? href.slice("/products/".length) : null;
  if (!slug) return undefined;
  const product = productBySlug(slug);
  if (!product) return undefined;
  return product.status === "waitlist" ? "waitlist" : "available";
};

/** §14 and §25, the free resources section and its page. */
export const FREE = {
  title: "Great UI Does Not Have to Start with a Budget",
  lead: "Explore our collection of free templates, components, blocks, and frontend resources. Build something useful, then upgrade when you need more.",
  items: [
    {
      title: "The React Component Library",
      body: "86 components, MIT licensed core, no build step.",
      href: "/components",
      linkLabel: "Get it",
      availability: offered("/components"),
      waitlistHref: "/components",
    },
    {
      title: "The Vue Component Library",
      body: "81 components, the same markup as React.",
      href: "/components",
      linkLabel: "Get it",
      availability: offered("/components"),
      waitlistHref: "/components",
    },
    {
      title: "The CSS Edition",
      body: "The whole design system as one stylesheet, no framework.",
      href: "/components",
      linkLabel: "Get it",
      availability: offered("/components"),
      waitlistHref: "/components",
    },
    {
      title: "The Documentation",
      body: "Installation, theming and every component, open to everyone.",
      href: "/docs",
      linkLabel: "Read it",
    },
  ],
  upgrade: {
    title: "Need More?",
    lead: "A licence adds the page templates and the data table, once, for the framework you ship in.",
    cta: { label: "Explore Premium", href: "/pricing" },
  },
} as const;

/** §16, the blog teaser on the home page. */
export const HOME_BLOG = {
  eyebrow: "Writing",
  title: "Learn, Build, Ship",
  lead: "Practical articles about frontend development, UI design, templates, components, and building better products.",
  cta: { label: "Browse products", href: "/products" },
} as const;

/**
 * §17, the newsletter.
 *
 * The copy is the specification's; **the form is not here**, because there is no email provider
 * and a field that swallows an address is worse than an honest invitation. The consent line is
 * kept ready for the day it is wired.
 */
export const NEWSLETTER = {
  title: "Get Better UI in Your Inbox",
  lead: "New templates, components, development resources, and product updates, without the noise.",
  placeholder: "Enter your email address",
  cta: CTA.subscribe,
  consent: `By subscribing, you agree to receive emails from ${BRAND}. You can unsubscribe at any time.`,
  /** Until a provider exists. Shown in place of the field. */
  unavailable: "No list yet. Email us and we will add you when there is one.",
} as const;

/** §18, and the closing call to action every marketing page ends with (§77). */
export const CLOSING = {
  title: "Your Next Project Does Not Need to Start From Scratch",
  lead: "Start with a professional foundation and spend your time building what makes your product unique.",
  action: { label: CTA.exploreTemplates, href: "/products" },
  secondary: { label: CTA.browseComponents, href: "/components" },
  footnote: "The component libraries are free. The licensed editions are a one-time payment.",
} as const;

/**
 * §36, the pricing page. Rewritten for one-time licences by `CR-MKT-006`, then again on 2026-08-21
 * for §15.2's two-card model: the wording moved from "lifetime updates" to the twelve-month term it
 * actually grants, because the source is perpetual and the updates are not.
 *
 * The plans, the prices and the comparison rows live in `pricing.ts`, because they are the
 * commercial model rather than copy: two pages and a product card read them, and a number that
 * appears in three files is a number that will disagree with itself. What is here is the page
 * furniture around them.
 */
export const PRICING_PAGE = {
  seo: {
    title: `Pricing, One-Time Licences for Source You Own | ${BRAND}`,
    description:
      "One payment for source you keep. Two licences: the edition you build in, or every edition available today. Twelve months of updates and regeneration included.",
  },
  /** The page furniture, so `/pricing` carries no headings of its own. */
  compareHeading: "What each licence covers",
  compareCaption: "Licence comparison",
  faqHeading: "Before You Buy",
  tierAction: "Choose an edition",
  comingBadge: "Coming",
  title: `Get ${BRAND} for Life`,
  lead: "Pick a licence and keep the source. One payment, twelve months of updates, no subscription to remember.",
  note: "Prices are in US dollars and exclude any tax due where you are. Nothing on this site takes payment yet: there is no checkout, and no support inbox either. Both arrive together.",
  /**
   * The reference design carries a payment strip here: a provider logo, nine card brands, and a
   * security claim. **We have no payment provider**, so ours says the two things that are true,
   * and the logos arrive with the checkout rather than before it. Rule 8 of §122 and §74's
   * security section both point the same way: do not display a payment guarantee you cannot make.
   */
  payment: {
    model:
      "Lifetime use of the source for a one-time payment, with twelve months of updates. No renewals required.",
    status:
      "Checkout is not built yet, so no card details touch this site. Prices are published so they can be compared, which is the point of this page.",
  },
  cta: {
    title: "Not Ready to Buy?",
    lead: "The component libraries are free and they are the same code the licensed editions are built from.",
    primary: "Download the free edition",
    secondary: "Ask a question",
  },
} as const;

/**
 * §37, the pricing FAQ, rewritten for the licence model.
 *
 * The questions are the specification's. The answers are what a one-time licence actually means,
 * which is a different set of promises from a subscription and had to be written rather than
 * edited.
 */
export const PRICING_FAQ = [
  {
    question: "Is this really a one-time payment?",
    answer: `Yes. You pay once and the source you download is yours to keep and to ship, permanently. What has a term is the service: ${SERVICE_PERIOD}. When that ends, everything you already downloaded still works.`,
  },
  {
    question: "Which licence do I need?",
    answer: `Two, and the question is scope rather than team size. One edition, ${ONE_EDITION}, covers the framework you build in. All editions, ${ALL_EDITIONS}, covers every edition that is downloadable on the day you buy. Neither counts developers or projects.`,
  },
  {
    question: "Can I use it for client projects?",
    answer:
      "Yes, on both licences, with no project counter and no seat counter. Ordinary hosted SaaS products are covered too. The line is redistribution: reselling the source itself as a theme, library, generator or competing template is not included.",
  },
  {
    question: "Do I need a licence per framework?",
    answer: `One edition covers one. If you want more than one, All editions is ${ALL_EDITIONS} for every edition available on the purchase date, which is cheaper than two of the first. It does not promise editions built later.`,
  },
  {
    question: "How long do updates last?",
    answer: `${SERVICE_PERIOD}, from the day you buy, for the editions your licence covers. The source is perpetual and the service is not, which is the honest way round: nothing you downloaded stops working when the term ends.`,
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Yes. Write to us and you pay the difference between One edition and All editions rather than buying it twice.",
  },
  {
    question: "What do I keep after twelve months?",
    answer:
      "Everything you downloaded, forever. The licence does not expire, so the source stays yours to use and ship. What ends after twelve months is the updates and the hosted regeneration; you can extend those, and nothing you already have stops working. That is the point of shipping source rather than a service.",
  },
  {
    question: "How many projects and developers does a licence cover?",
    answer:
      "Unlimited, for the legal entity that bought it. There are no seat counters and no project counters on a one-time purchase, which is why neither card lists a number: the two differ by which editions they cover, and by nothing else.",
  },
  {
    question: "What is a SaaS end product?",
    answer:
      "Something you sell access to rather than deliver. Ordinary hosted SaaS products are covered by both licences. What is never covered is selling the reusable source itself, and a redistribution licence for that is arranged with us rather than bought at a checkout.",
  },
  {
    question: "Is it documented?",
    answer:
      "Yes, and the documentation says which pages are stubs rather than leaving you to find out. Installation, theming, dark mode and the component reference are written.",
  },
  {
    question: "Are there light and dark modes?",
    answer:
      "Both, and both are designed rather than one being an inversion of the other. Every component is checked in each.",
  },
  {
    question: "Can I customise it?",
    answer:
      "Yes, at three levels: change a design token and everything follows, pass a class for a one-off, or fork the component, because you have the source.",
  },
] as const;

/**
 * §37, the pricing FAQ, and §49, the FAQ page.
 *
 * The questions are the specification's, grouped as it groups them. **The answers are ours**: the
 * specification hedges every one ("depends on the license") because it is written for any
 * marketplace, and we know our own terms. See the note at the top of this file.
 */
export const FAQ_ITEMS = [
  {
    category: "Products",
    question: `What does ${BRAND} sell?`,
    answer: `${BRAND} provides admin dashboard templates, UI component libraries, marketing blocks and the documentation to use them. Website templates, landing pages and Figma kits are in design, and their pages say so rather than listing products that do not exist.`,
  },
  {
    category: "Products",
    question: "Are the products production ready?",
    answer: `The ${editionsIn("available")} editions are. ${editionsIn("waitlist")} are built and not published yet, so they take no money and their product pages say exactly what is missing. ${editionsIn("planned")} do not exist yet.`,
  },
  {
    category: "Products",
    question: "Can I customize the products?",
    answer:
      "Yes, at three levels: change a design token and the whole product follows, pass a class to adjust one instance, or fork the component, because you have the source rather than a compiled bundle.",
  },
  {
    category: "Purchasing",
    question: "What exactly do I get when I buy?",
    answer: `The full source of ${BRAND} for the editions your licence covers: components, page templates and the design tokens. Not a compiled bundle. You read it, change it, and keep it.`,
  },
  {
    category: "Purchasing",
    question: "Do I need an account to purchase?",
    answer:
      "Nothing on this site takes payment yet. When it does, an account will hold your licences, downloads and invoices, and you will be told before you are asked for one.",
  },
  {
    category: "Purchasing",
    question: "Is it a subscription?",
    answer: `No. Both licences are a one-time payment and the source you download is yours permanently. What has a term is the service period, ${SERVICE_PERIOD}, after which the code you have keeps working and only the hosted part needs extending.`,
  },
  {
    category: "Purchasing",
    question: "Is there a free version?",
    answer:
      "Yes, and it is genuinely usable: the component library for one edition, MIT licensed at its core. The page templates and the data table are paid.",
  },
  {
    category: "Licensing",
    question: "Can I use a product commercially?",
    answer:
      "Yes, on both licences, including client work and ordinary hosted SaaS products you sell access to. What is not included is reselling the source itself.",
  },
  {
    category: "Licensing",
    question: "Can I use one purchase for multiple projects?",
    answer:
      "Yes, unlimited, for the legal entity that bought it. There are no project or developer counters. The two licences differ by which editions they cover and by nothing else.",
  },
  {
    category: "Licensing",
    question: "Can I redistribute the source code?",
    answer:
      "Not as a competing template, library, theme or generator, modified or not. Shipping it inside an application you sell access to is covered by both licences. A redistribution licence for the source itself exists and is arranged with us, never sold at a checkout.",
  },
  {
    category: "Updates",
    question: "How do updates work?",
    answer: `You get ${SERVICE_PERIOD} for the editions your licence covers, major versions included. After that, everything you downloaded keeps working and only further updates and hosted regeneration need extending.`,
  },
  {
    category: "Updates",
    question: "Which frameworks are supported?",
    answer: `${editionsIn("available")} today. ${editionsIn("waitlist")} are built and not published yet. ${editionsIn("planned")} are in design. Supporting every framework is the point of ${BRAND} rather than a feature of it.`,
  },
  {
    category: "Updates",
    question: "Do you offer refunds?",
    answer:
      "Thirty days, and downloading the source ends the window. A download hands over a perpetual copy, so there would be nothing to take back. Browse the previews as long as you like first: that keeps the window open.",
  },
] as const;

/** §31 to §35, the product page furniture. Headings only: the facts come from `products.ts`. */
export const PRODUCT_PAGE = {
  descriptionHeading: (product: string) => `Build Faster with ${product}`,
  includedHeading: "What's Included",
  featuresHeading: "Features",
  screenshots: {
    title: "See It in Action",
    lead: "Explore the interface across desktop, tablet, and mobile layouts.",
    cta: "Open Live Demo",
  },
  technology: { title: "Built With" },
  licence: {
    title: "Choose the Right Licence",
    lead: "What differs between tiers is seats, client work, and whether you may ship it inside a product you sell.",
    cta: { label: "Compare Licences", href: "/pricing" },
  },
  cta: { primary: CTA.getTemplate, secondary: CTA.liveDemo },
  /** §35 and §75: a product FAQ built from real product metadata, never inferred. */
  faqHeading: "Questions About This Product",
} as const;

/** §30, the search page. */
export const SEARCH_PAGE = {
  title: `Search ${BRAND}`,
  placeholder: "Search templates, components, frameworks, or resources",
  initial:
    "Search our marketplace to find templates, components, blocks, forms, and development resources.",
  noResults: "We could not find anything matching your search.",
  noResultsSecondary:
    "Try a different keyword, browse a category, or explore our popular products.",
} as const;

/** §41 and §42, the blog. */
export const BLOG_PAGE = {
  title: `The ${BRAND} Journal`,
  lead: "Ideas, tutorials, guides, and practical resources for building better web interfaces.",
  articleCta: {
    title: "Ready to Start Building?",
    lead: "Explore templates and components designed to help you move faster.",
    action: { label: `Explore ${BRAND}`, href: "/products" },
  },
} as const;

/** §43, the documentation home. */
export const DOCS_HOME = {
  title: "Documentation",
  lead: `Everything you need to install, customize, use, and update ${BRAND} products.`,
  cta: { label: CTA.startBuilding, href: "/docs" },
} as const;

/** §38, about. */
export const ABOUT = {
  title: "We Are Building Better Tools for People Who Build the Web",
  lead: `${BRAND} exists to make frontend development faster without sacrificing quality.`,
  story: [
    "We believe developers should spend their time solving meaningful product problems, not repeatedly rebuilding the same interface patterns.",
    "We create and curate production-ready templates, components, blocks, forms, and UI systems for modern web applications.",
  ],
  values: [
    {
      title: "Quality Over Quantity",
      body: "A smaller collection of useful resources is more valuable than a massive library nobody can navigate.",
    },
    {
      title: "Developer First",
      body: "Everything should be practical, understandable, customizable, and ready to use.",
    },
    { title: "Design Matters", body: "Good code deserves a good interface." },
    {
      title: "Build Once, Reuse Everywhere",
      body: "Reusable systems help teams move faster and maintain consistency.",
    },
  ],
} as const;

/** §39, contact. */
export const CONTACT = {
  title: "Let's Talk",
  lead: "Have a question about a product, license, partnership, or something else? Send us a message.",
  categories: ["Product Support", "Billing", "Licensing", "Sales", "Partnership", "General"],
  cta: "Send Message",
  success:
    "Thanks for reaching out. We have received your message and will get back to you as soon as possible.",
  routes: [
    { title: "Sales and Licensing", body: "Which tier fits, invoicing, purchase orders." },
    {
      title: "Product Support",
      body: "Installation, upgrades and anything that is not behaving.",
    },
    { title: "Partnership", body: "Bundles, integrations and anything unusual." },
  ],
} as const;

/** §40, careers, including the sentence the specification gives for an empty list. */
export const CAREERS = {
  title: "Help Us Build the Tools Developers Love",
  lead: "We are building a platform that helps developers spend less time recreating interfaces and more time building products.",
  body: "We do not have any open positions right now, but we are always interested in hearing from talented people.",
  cta: { label: "Send Your Profile", href: "/support" },
  culture: [
    { title: "Small on Purpose", body: "Fewer people, longer attention span." },
    { title: "Written Down", body: "Decisions live in the repository, not in someone's memory." },
    { title: "Remote", body: "Overlapping hours matter, offices do not." },
  ],
} as const;

/** §48, support. */
export const SUPPORT = {
  title: "How Can We Help?",
  lead: `Find answers, documentation, and support for your ${BRAND} products.`,
  channels: [
    {
      title: "Documentation",
      body: "Find installation and usage instructions.",
      href: "/docs",
      linkLabel: "Browse Documentation",
    },
    {
      title: "FAQ",
      body: "Find answers to common questions.",
      href: "/pricing#faq",
      linkLabel: "View FAQ",
    },
    {
      title: "Answers",
      body: "Direct answers to the questions people ask before choosing.",
      href: "/support",
      linkLabel: "Browse Answers",
    },
    {
      title: "Contact Support",
      body: "Need help with something specific?",
      href: "/support",
      linkLabel: "Contact Support",
    },
  ],
  categories: ["Purchase", "Licence", "Installation", "Product issue", "Billing", "Account"],
} as const;

/** §47, the roadmap. Real intentions, and no dates, because a date we miss costs more than it buys. */
export const ROADMAP = {
  title: "Product Roadmap",
  lead: `See what we are working on and where ${BRAND} is heading.`,
  cta: { label: "Suggest a Feature", href: "/support" },
  columns: [
    {
      title: "In Progress",
      description: "Features currently being developed.",
      items: [
        "The data table for the Vue edition",
        "Live previews for each edition",
        "Documentation, expanded past installation",
      ],
    },
    {
      title: "Planned",
      description: "Ideas and features we are considering.",
      items: [
        "The Angular edition",
        "The Laravel edition",
        "A Figma kit matching the token file",
        "Checkout and licence delivery",
        "Website templates and landing pages",
        // The three ready-made portals the home page names. Its cards link here, so this is where a
        // reader who followed them finds out what "in build" means rather than a page that omits them.
        "Ready-made: the SaaS administration portal",
        "Ready-made: the CRM administration portal",
        "Ready-made: the e-commerce operations portal",
      ],
    },
    {
      title: "Completed",
      description: "Recently shipped improvements.",
      items: [
        "Dialogs, menus, selects and popovers in Vue",
        "The CSS edition, framework free",
        "58 marketing blocks, which this site is built from",
        "Light and dark, both designed",
      ],
    },
  ],
} as const;

/** §46, the changelog. Dated from the repository's own history. */
export const CHANGELOG = {
  title: "Changelog",
  lead: `Follow new releases, improvements, fixes, and updates across ${BRAND}.`,
  entries: [
    {
      date: "2026-08-14",
      version: "Site",
      title: "Light Theme by Default, and a Theme Switcher",
      changes: [
        "Light is now the default theme on this site, with a switcher in the header.",
        "The switcher costs 429 bytes of JavaScript. Every page still ships zero of everything else.",
      ],
    },
    {
      date: "2026-08-13",
      version: "vui-web 0.2.0",
      title: "The Site Header Works Without JavaScript",
      changes: [
        "The navigation panel and mobile drawer open with CSS, so the header no longer needs React.",
        "That removed 224 KB from every page of this site.",
      ],
    },
    {
      date: "2026-08-13",
      version: "vui-vue 0.4.0",
      title: "Dialogs, Menus and Selects for Vue",
      changes: [
        "Dialog, DropdownMenu, Select, Popover and Tooltip, built on Reka UI.",
        "The class strings are shared with React, so the markup matches by construction.",
        "The data table is still missing, and the Vue edition says so on its page.",
      ],
    },
    {
      date: "2026-08-13",
      version: "vui-ui 1.66.0",
      title: "Runtime Text Scaling Actually Works",
      changes: [
        "A duplicated font-size in the base stylesheet had been overriding the scale variable, so the documented text-scaling feature did nothing. Fixed.",
      ],
    },
  ],
} as const;

/** §50 to §52, the authentication screens. UI only: nothing here posts anywhere yet. */
export const AUTH = {
  login: {
    title: "Welcome Back",
    lead: "Sign in to access your products, downloads, licenses, and account.",
    cta: "Sign In",
    footer: { text: "No account?", label: "Create an account", href: "/register" },
  },
  register: {
    title: "Create Your Account",
    lead: "Create an account to manage your products, downloads, licenses, and purchases.",
    cta: "Create Account",
    footer: { text: "Already have an account?", label: "Sign in", href: "/login" },
  },
  forgot: {
    title: "Reset Your Password",
    lead: "Enter your email address and we will send you instructions to reset your password.",
    cta: "Send Reset Link",
    success: "If an account exists for this email address, you will receive instructions shortly.",
    footer: { text: "Remembered it?", label: "Sign in", href: "/login" },
  },
  reset: {
    title: "Choose a New Password",
    lead: "Choose something long rather than something clever. The link that brought you here works once and expires.",
    cta: "Save the Password",
    footer: { text: "Back to", label: "Sign in", href: "/login" },
  },
  verify: {
    title: "Verify Your Email",
    lead: "We sent a six-digit code. It is valid for ten minutes.",
    cta: "Verify",
    footer: { text: "Wrong address?", label: "Start again", href: "/register" },
  },
  twoFactor: {
    title: "Two-Factor Authentication",
    lead: "Enter the six-digit code from your authenticator app. Codes rotate every thirty seconds.",
    cta: "Confirm",
    footer: { text: "Lost your device?", label: "Contact support", href: "/support" },
  },
  /**
   * §50 lists Google and GitHub. §38 of the requirements document says only implement providers
   * that are actually configured, and none is, so no OAuth button is drawn. A button that cannot
   * authenticate is not a placeholder, it is a lie with a logo on it.
   */
  notice:
    "Accounts are not open yet. This screen is built and the form is not connected to anything. Nothing you type here is sent or stored.",
} as const;

/** §64 to §67, the error and maintenance screens. */
export const ERROR_PAGES = {
  notFound: {
    code: "404",
    title: "Page Not Found",
    lead: "The page you are looking for does not exist or may have moved.",
    primary: { label: "Go Home", href: "/" },
    secondary: { label: CTA.exploreTemplates, href: "/products" },
  },
  forbidden: {
    code: "403",
    title: "You Do Not Have Access to This Page",
    lead: "You may need to sign in or have the appropriate permissions to continue.",
    primary: { label: "Sign In", href: "/login" },
    secondary: { label: "Go Home", href: "/" },
  },
  server: {
    code: "500",
    title: "Something Went Wrong",
    lead: "We could not complete that request. Please try again.",
    primary: { label: "Try Again", href: "/" },
    secondary: { label: "Contact Support", href: "/support" },
  },
  maintenance: {
    code: "Maintenance",
    title: "We Will Be Right Back",
    lead: "We are making improvements behind the scenes. Please check back shortly.",
    primary: { label: "Read the Docs", href: "/docs" },
    secondary: { label: "Go Home", href: "/" },
  },
} as const;

/**
 * §43 of the requirements document and §71 here: answer engine optimisation.
 *
 * Question, then the direct answer in one paragraph, then the explanation. These are the pages an
 * assistant quotes, so the first sentence has to survive being quoted alone.
 */
export const ANSWERS = [
  {
    slug: "what-is-a-tailwind-admin-template",
    question: "What is a Tailwind admin template?",
    summary:
      "A direct answer: what a Tailwind admin template is, what it actually saves you, and how to tell a finished one from a demo.",
    answer:
      "An admin dashboard template is a pre-built frontend interface containing the common screens and components used to manage data, users, settings, analytics and other application functionality, styled here with Tailwind CSS.",
    body: [
      "The value is not the styling. It is that the awkward parts are finished: a data table that sorts, filters and exports; forms with every state designed; a sidebar that behaves on a phone; and a dark theme that was drawn rather than inverted.",
      "What separates a good one from a demo is whether it survives contact with real data. Ask whether the table paginates, whether the forms show errors, whether the components are source you can edit, and whether accessibility was built in or bolted on.",
    ],
    related: [
      { label: "Admin templates", href: "/products" },
      { label: "The component library", href: "/components" },
    ],
  },
  {
    slug: "best-react-admin-dashboard",
    question: "How do I choose a React admin dashboard?",
    summary:
      "How to judge a React admin dashboard: source versus bundle, whether the data table is real, both themes, and what the licence covers.",
    answer:
      "Judge a React admin dashboard on four things: whether it ships source rather than a compiled bundle, whether it includes a real data table, whether both themes are designed, and whether the licence covers what you are building.",
    body: [
      "Component count is the least useful number on the page. Forty components that include a data table, a date picker and a working dialog will take you further than two hundred button variants.",
      "Check the framework story too. If you may need Vue or plain HTML later, a template that exists once per framework from one token source will not force a rewrite, and one that does not will.",
    ],
    related: [
      { label: "React admin templates", href: "/products/react" },
      { label: "Compare the editions", href: "/products" },
    ],
  },
  {
    slug: "react-vs-nextjs-templates",
    question: "React or Next.js: which template do I need?",
    summary:
      "Which admin template you need. The components are identical; what differs is routing, server rendering and the page structure around them.",
    answer:
      "Choose the Next.js edition if you want routing, server rendering and file-based pages included; choose the React edition if you already have an application shell and only need the components inside it.",
    body: [
      "The components are identical between the two. The difference is what surrounds them: the Next.js edition brings the App Router layout, server components and the page structure, and the React edition brings the library alone.",
      "If you are starting from nothing and want SEO, take Next.js. If you are adding screens to an existing Vite or Create React App codebase, take React and skip the framework you would have to remove.",
    ],
    related: [
      { label: "Next.js edition", href: "/products/nextjs" },
      { label: "React edition", href: "/products/react" },
    ],
  },
  {
    slug: "can-i-use-templates-commercially",
    question: "Can I use an admin template commercially?",
    summary:
      "Yes, on both licences, including client work. Where the line sits is redistribution, and this explains exactly where.",
    answer:
      "With our licences, yes: both cover commercial work, client projects, and shipping the components inside an ordinary hosted SaaS product you sell access to.",
    body: [
      "The line most licences draw, and we draw it too, is redistribution. Building an application for a client is fine. Reselling the components themselves as a competing template, library or generator is not, and no ordinary purchase includes that right.",
      "What differs between the two licences is scope: one framework edition, or every edition downloadable on the day you buy. Neither counts developers or projects, so there is no tier to outgrow.",
    ],
    related: [
      { label: "Pricing", href: "/pricing" },
      { label: "Licence", href: "/licence" },
    ],
  },
] as const;

/** Per-edition selling points for `/products/<slug>`. */
export const PRODUCT_POINTS = SKUS.map((sku) => ({
  slug: sku.slug,
  heading: skuName(sku),
  points: [
    {
      title: "Same Design",
      body: "Identical markup and tokens to every other edition, by construction.",
    },
    { title: "Source, Not a Bundle", body: "Read it, change it, keep it." },
    { title: "Built to Ship", body: "Page templates, forms and tables, not just primitives." },
  ],
}));

/**
 * §89 of the requirements document, the legal pages.
 *
 * **Drafts, and each one says so on the page.** Legal review is required before production and
 * rule 3 forbids inventing business requirements, so what is here is the structure plus the parts
 * we can state as fact today.
 */
/**
 * The five legal routes.
 *
 * **`privacy` and `terms` are placeholders, and so is the substance of the other three.** They state
 * what this store actually does today rather than boilerplate copied from elsewhere, which is the
 * only honest thing an unreviewed page can do. Counsel replaces all of it before production
 * (`OQ-10`), and until then no page here claims to have been reviewed.
 */
export const LEGAL_PAGES = {
  licence: {
    title: "Licence Information",
    lead: "What a licence lets you build, in plain words: what it covers, what it never covers, and how long the service part lasts.",
    sections: [
      {
        heading: "What Every Licence Allows",
        body: "Use the components in unlimited projects, for yourself or for clients, modify anything, and keep every build you downloaded permanently. There is no project counter and no developer counter.",
      },
      {
        heading: "What No Licence Allows",
        body: "Reselling or redistributing the components themselves as a competing template, library, theme or generator, whether modified or not. A redistribution licence for that is arranged with us and is never part of an ordinary purchase.",
      },
      {
        heading: "Shipping It Inside a Product You Sell",
        body: "Covered by both licences, where the components are part of an application you sell access to rather than the thing being sold.",
      },
      {
        heading: "What Has a Term, and What Does Not",
        body: `The downloaded source is perpetual. The service is not: a licence includes ${SERVICE_PERIOD}, and when that ends every build you already have keeps working.`,
      },
      {
        heading: "Which Editions a Licence Covers",
        body: "One edition covers the framework you choose. All editions covers every edition available on the purchase date, and does not promise editions built later.",
      },
    ],
  },
  refunds: {
    title: "Refund Policy",
    lead: "Thirty days, and downloading the source ends the window. Both halves matter, so both are stated.",
    sections: [
      {
        heading: "Thirty Days",
        body: "You can ask for a refund within thirty days of buying, and you do not have to give a reason.",
      },
      {
        heading: "Downloading Ends It",
        body: "The window closes the moment you download the source. A download hands over a perpetual, copyable artefact, so a refund after it would take nothing back. Browse the demos and the screens as long as you like before you download: that costs you nothing and keeps the window open.",
      },
      {
        heading: "What This Means in Practice",
        body: "Decide before you download rather than after. Every edition has a live preview and a product page listing exactly what is in it, and where an edition is not built yet its page says so instead of taking your money.",
      },
      {
        heading: "How to Ask",
        body: "Through the account you bought with, once accounts exist. There is no checkout on this site today, so there is nothing to refund yet.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lead: "What this site collects, which today is very little, because most of it does not exist yet.",
    sections: [
      {
        heading: "What We Collect Right Now",
        body: "Nothing that identifies you. There is no account system, no checkout and no analytics on this site yet, so no form on it sends anything anywhere and no cookie is set for tracking. The waitlist form says so on the page itself rather than only here.",
      },
      {
        heading: "What Changes When Accounts Arrive",
        body: "An account will store the email address you register with, the licences you own and the versions you have downloaded. Payment is handled by Polar, so card details reach them and never us. This page is rewritten before any of that is switched on.",
      },
      {
        heading: "What We Will Never Do",
        body: "Sell or rent your address, or pass it to anyone who is not needed to deliver what you bought.",
      },
      {
        heading: "Reaching Us",
        body: "There is no support inbox yet, which is recorded as an open gap rather than hidden. It arrives with the accounts.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    lead: "The terms for using this website. What you may do with the source you buy is the licence, which is a separate page.",
    sections: [
      {
        heading: "This Is the Website, Not the Product",
        body: "These terms cover browsing this site. What a purchase grants you is set out on the licence page, and that is the document that governs the source.",
      },
      {
        heading: "Nothing Here Is on Sale Yet",
        body: "There is no checkout on this site today. Prices are published so they can be compared, and a page that shows a price but no way to pay is doing that on purpose.",
      },
      {
        heading: "Accuracy",
        body: "The catalogue, the availability table and the version numbers are generated from the repository rather than typed, so they describe what exists on the day you read them. Where an edition is not built, its page says so instead of implying otherwise.",
      },
      {
        heading: "Liability",
        body: "The site is provided as is. To the extent the law allows, VILIHA PTE. LTD. is not liable for loss arising from its use.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    lead: "One item in local storage, remembering whether you chose light or dark. No analytics cookies, no advertising cookies and no third-party scripts.",
    sections: [
      {
        heading: "What We Store Today",
        body: "One item, in local storage, remembering whether you chose the light or the dark theme. It never leaves your browser.",
      },
      {
        heading: "What We Do Not Store",
        body: "No analytics cookies, no advertising cookies and no third-party scripts. There is no analytics provider connected to this site at all.",
      },
      {
        heading: "When That Changes",
        body: "If we add analytics, this page changes first and the consent banner arrives with it, not after.",
      },
    ],
  },
  "acceptable-use": {
    title: "Acceptable Use",
    lead: "The short list: what you may build with the components, and the one thing no licence allows, which is reselling them as a competing product.",
    sections: [
      {
        heading: "Do Not",
        body: "Redistribute the source as a competing product, share your account credentials outside the entity that bought the licence, or use the components to build something illegal.",
      },
      {
        heading: "Do",
        body: "Fork components, change the tokens, delete what you do not need and ship it under your own brand.",
      },
    ],
  },
} as const;

/* ---------------------------------------------------------------------------
 * The home page, rebuilt to the reference layout (2026-08-16).
 *
 * The dev asked for the reference's design and section order, with placeholders wherever we do
 * not have the thing yet, and said the words get rewritten later. So this is **structure first**:
 * every section the reference carries, in its order, filled with what is true about this product.
 * Nothing here is transcribed from the reference site, which §123 forbids; what is copied is the
 * shape of the page, which is what §123 explicitly allows a market reference to be used for.
 * ------------------------------------------------------------------------ */

/** The pill above the hero headline. */
export const HERO_BADGE = "Multi-framework Tailwind CSS admin dashboard kit";

/** §12 of the reference layout: the two stat cards under the logo cloud. */
export const HERO_PROOF_CARDS = [
  {
    title: "Counted, Not Claimed",
    body: "Every number on this site is countable in the source you would be buying.",
    href: "/products",
    linkLabel: "See the catalogue",
  },
  {
    title: "Open Source Core",
    body: "The component libraries are free and MIT licensed at their core.",
    href: "/components",
    linkLabel: "Browse the free editions",
  },
] as const;

/** The "available for your stack" grid. Copy per framework; the marks come from `pricing.ts`. */
export const FRAMEWORK_CARDS = {
  eyebrow: "Ready to Use with the Tools You Already Have",
  title: `${BRAND} Is Available for HTML, React, Next.js, Vue, Angular and Laravel`,
  lead: "One design system, one token file, and an edition for the framework you ship in.",
} as const;

/** The core feature grid: six cards, then nine smaller rows, as the reference has it. */
/**
 * "What you get, whichever stack you pick", from the approved products page.
 *
 * **The counts moved out of it, and that is the point.** The first version stated a component count and a screen count as bare facts, "50
 * application screens" under a grid that includes HTML, Vue, Angular and Laravel, with a lead claiming
 * "the differences are the app shell and the build, not the contents". This site's own catalogue
 * contradicts that one click away: HTML ships 48 of 68 families and 38 of 50 screens, Vue 65 of 68, and
 * Angular and Laravel have no package at all. A buyer reads a number under a card as that card's
 * number. Caught in review.
 *
 * So this section claims only what **is** uniform across editions, and each edition's page carries its
 * own coverage. The design's "120+ components" and "40+ pages" do not travel for the same reason.
 */
/**
 * "Everything needed for a credible admin UI", the six cards from the second design.
 *
 * Every one of them is true of what ships today, which is why they could be taken as written. The design
 * also floats a "WCAG 2.2 AA target" figure in its proof strip; the word "target" is doing real work
 * there and it is kept, because nothing in this repository measures a conformance grade.
 */
/**
 * **"A storefront built for serious product decisions": the second design's four numbered arguments.**
 *
 * Its own fourth argument is written for an investor rather than a buyer ("support a higher average
 * order value over time"), so it is replaced with the one this site can actually demonstrate on the
 * same page: availability is read from the catalogue, so a planned edition cannot show a checkout.
 *
 * Its third argument names three prices, `$49`, `$99` and `$149`. Two of those exist. The `$149` is the
 * ready-made all-editions offer, which is Phase F and has no product behind it, so the argument quotes
 * the two the licence actually sells and says the ladder is two steps.
 */
export const TRUST_ARGUMENTS = {
  eyebrow: "Enterprise SaaS Quality",
  title: "A Storefront Built for Serious Product Decisions",
  lead: "Trust is what converts. You can see the outcome, inspect the interface, compare the scope, read the licence and check availability before you create an account.",
  action: { label: "Explore the Catalogue", href: "/products" },
  steps: [
    {
      title: "Outcome Before Framework",
      body: "The first question on this page is what you are building, not which library you use. The stack comes second, once the template fits.",
    },
    {
      title: "Proof Before Purchase",
      body: "Live previews of the real export, and an inclusion list per product. Nothing here is a screenshot of something you cannot open.",
    },
    {
      title: `A Ladder With Two Steps, ${ONE_EDITION} and ${ALL_EDITIONS}`,
      body: "One edition, or every edition available on the purchase date. No seats to count, no renewals, and no crossed-out price that was never charged.",
    },
    {
      title: "Availability You Can Check",
      body: "Every edition's state is read from the catalogue, so a planned edition never shows a checkout and a published one never hides.",
    },
  ],
} as const;

/**
 * **The themes section: one theme, and the second one is a decision rather than a product.**
 *
 * The design shows "two visual directions", VUI Light and Midnight. One of them exists. `Q-SD-2` puts
 * the second to the dev (§28 decision 9 is open), and until it is answered a card for it would be a
 * product invented by a page, which is what `D5` forbids.
 *
 * What is true is better than what is missing: the theme that ships has a real dark mode built from the
 * same tokens, which is a mode of one theme rather than a second theme, and the configurator changes
 * colour, type, radius and density without touching a component.
 */
export const THEMES = {
  eyebrow: "One Theme, Configured",
  title: "Pick a Theme, Then Make It Yours",
  lead: "Colour, type, radius, density and navigation are design tokens, so a change reaches every screen at once. A second visual direction is under discussion and is not on sale, which is why there is no card for it here.",
  cards: [
    {
      iconName: "customize" as const,
      title: "VUI Light, the Signature Theme",
      body: "Calm neutral surfaces, crisp blue actions and compact enterprise controls. The theme every screen in the demo is built in.",
      href: "/docs",
      linkLabel: "Read the theming guide",
    },
    {
      iconName: "darkmode" as const,
      title: "Dark Mode, From the Same Tokens",
      body: "Not a second product and not a second stylesheet: the same theme with its surface and ink tokens inverted, shipped with every edition.",
      href: "/components",
      linkLabel: "See it running",
    },
  ],
} as const;

/**
 * **Ready-made templates, which are Phase F and say so.**
 *
 * The design lists three portals with prices (`$99 / $149`) beside two of them. Those prices are not in
 * this site's licence data and the products are not built, so the cards carry the design's own "coming
 * soon" treatment and no number at all: `availability: "waitlist"` on `FeatureItem` drops the purchase
 * link and the purchase word by itself, which is the mechanism rather than a promise to be careful.
 *
 * `Q-SD-3` records this for the dev. Naming them is the point: a buyer who needs a CRM portal should
 * learn that one is coming, not conclude we have never thought about it.
 */
export const READY_MADE = {
  eyebrow: "Ready-made, in Build",
  title: "Start with a Complete Product Structure",
  lead: "Named routes, workflows, sample schemas, forms and placeholder content, configured for one business outcome. UI only, with an API-ready structure, and not presented as a working backend.",
  cards: [
    {
      iconName: "dashboards" as const,
      title: "SaaS Administration Portal",
      body: "Subscriptions, usage, team management, billing screens and account settings.",
      availability: "waitlist" as const,
      waitlistHref: "/roadmap",
      availabilityLabel: "In build",
    },
    {
      iconName: "components" as const,
      title: "CRM Administration Portal",
      body: "Pipeline views, contact records, activity, deal stages, tasks and reporting.",
      availability: "waitlist" as const,
      waitlistHref: "/roadmap",
      availabilityLabel: "In build",
    },
    {
      iconName: "elements" as const,
      title: "E-commerce Operations Portal",
      body: "Orders, products, inventory, customers and the screens a commerce back office runs on.",
      availability: "waitlist" as const,
      waitlistHref: "/roadmap",
      availabilityLabel: "In build",
    },
  ],
} as const;

/**
 * **The home page's FAQ: six questions picked out of `FAQ_ITEMS`, never written twice.**
 *
 * The design ends with a buyer-facing FAQ and this site already publishes one, so the section selects
 * from it by question. Two lists of the same answers is precisely how `D7` happened: the price list
 * moved and eleven strings did not.
 *
 * `homeFaq` throws when a question is missing rather than rendering a short list, because a page that
 * silently drops a section when someone edits a question is a page nobody notices is broken.
 */
const HOME_FAQ_QUESTIONS = [
  `What does ${BRAND} sell?`,
  "What exactly do I get when I buy?",
  "Is it a subscription?",
  "Can I use a product commercially?",
  "Which frameworks are supported?",
  "Do you offer refunds?",
] as const;

export const HOME_FAQ = {
  eyebrow: "Clear Answers",
  title: `${BRAND} Licensing and Product FAQ`,
  lead: "Short, direct answers for buyers. The longer ones are on the FAQ page.",
  items: HOME_FAQ_QUESTIONS.map((question) => {
    const item = FAQ_ITEMS.find((faq) => faq.question === question);
    if (!item) throw new Error(`HOME_FAQ: no FAQ_ITEMS entry for "${question}"`);
    return { question: item.question, answer: item.answer };
  }),
} as const;

export const STORE_INCLUDES = {
  eyebrow: "What's Included",
  title: "Everything Needed for a Credible Admin UI",
  lead: "Source code you can understand, change and self-host, with no runtime dependency on us.",
  cards: [
    {
      iconName: "layouts" as const,
      title: "Application Shell",
      body: "Responsive sidebar, header, breadcrumbs, navigation, and designed system states.",
    },
    {
      iconName: "elements" as const,
      title: "Tables and Forms",
      body: "Filters, saved views, validation, create and edit flows, and accessible field patterns.",
    },
    {
      iconName: "charts" as const,
      title: "Dashboards",
      body: "Metrics, charts, cards, reporting layouts, and useful empty and loading states.",
    },
    {
      iconName: "components" as const,
      title: "Authentication UI",
      body: "Sign in, account, profile, team, organization, and security screen patterns.",
    },
    {
      iconName: "updates" as const,
      title: "Build Quality",
      body: "Responsive behaviour, visible focus, reduced motion, and production build checks.",
    },
    {
      iconName: "download" as const,
      title: "Perpetual Source Use",
      body: "Keep every downloaded build after the hosted updates and services end.",
    },
  ],
} as const;

export const STACK_INCLUDES = {
  eyebrow: "The Same Product, Every Edition",
  title: "What You Get, Whichever Stack You Pick",
  lead: "One design system, compiled for your framework. Every edition reads the same tokens and renders the same markup; how much of it has shipped is on each edition's own page.",
  cards: [
    {
      iconName: "tailwind" as const,
      title: "One Token File",
      body: "Colour, type, radius, spacing and the z-scale in one place, so a change follows through every screen rather than being applied twice.",
    },
    {
      iconName: "elements" as const,
      title: "The Same Markup",
      body: "Class strings live in the shared source and every edition imports them, which is checked by a render test rather than promised.",
    },
    {
      iconName: "download" as const,
      title: "Source, Not a Dependency",
      body: "Copied into your repository. No runtime licence check, nothing to phone home, and yours to edit.",
    },
  ],
} as const;

export const CORE_FEATURES = {
  eyebrow: "Core Features",
  title: "A Tailwind Dashboard Built for Your Stack",
  lead: "The parts that usually take a fortnight are the parts that are finished.",
  cards: [
    {
      iconName: "tailwind",
      title: "Built with Tailwind CSS",
      body: "Tailwind v4 and one token file. Change a variable and the whole product follows.",
    },
    {
      iconName: "elements",
      title: "68 UI Components",
      body: "Counted, not rounded up. Dialogs, menus, selects, charts and a real data table.",
    },
    {
      iconName: "dashboards",
      title: "One Dashboard, Every Framework",
      body: "The same screens in React, Next.js, Vue and plain CSS, from one source of truth.",
    },
    {
      iconName: "customize",
      title: "Easy to Customise",
      body: "Tokens, then props, then fork the component. You have the source either way.",
    },
    {
      iconName: "updates",
      title: "Twelve Months of Updates",
      body: "Buy once for a framework and keep receiving its updates, major versions included.",
    },
    {
      iconName: "support",
      title: "Technical Support",
      body: "Answered by the people who wrote it, for the service period your licence states.",
    },
  ],
  rows: [
    { iconName: "responsive", title: "Fully Responsive" },
    { iconName: "files", title: "TypeScript Source" },
    { iconName: "frameworks", title: "Multi-framework" },
    { iconName: "customize", title: "Design Tokens" },
    { iconName: "performance", title: "Performance First" },
    { iconName: "browsers", title: "Cross-browser" },
    { iconName: "darkmode", title: "Dark Mode Designed" },
    { iconName: "plugins", title: "No Plugin Lock-in" },
    { iconName: "docs", title: "Documented" },
  ],
} as const;

/** The alternating feature rows. The reference has five; these are ours, in the same shape. */
export const NOTABLE_FEATURES = {
  eyebrow: "Other Notable Features",
  title: "Build an Admin Panel Without Building the Furniture",
  rows: [
    {
      eyebrow: "Your Ultimate Admin Template",
      title: "One Dashboard Design, Every Use Case",
      body: "Start from a working screen rather than an empty one.",
      reverse: false,
      points: [
        {
          iconName: "darkmode",
          title: "Light and Dark, Both Designed",
          body: "Not an inverted palette. Every component is checked in each theme.",
        },
        {
          iconName: "code",
          title: "A Workflow That Survives a Team",
          body: "Readable source, no build step in your app, and no plugin API to learn.",
        },
      ],
    },
    {
      eyebrow: "Components, Elements and Pages",
      title: "Every Element a Dashboard Needs",
      body: "The awkward parts are the finished parts.",
      reverse: true,
      points: [
        {
          iconName: "elements",
          title: "68 Components",
          body: "Dialogs, menus, selects, popovers, tables and the data table most libraries skip.",
        },
        {
          iconName: "layouts",
          title: "Application Pages",
          body: "Dashboard, list, record, settings and authentication screens, ready to fill.",
        },
      ],
    },
    {
      eyebrow: "Visualise Your Data",
      title: "Charts, Tables and Counters, Themed From the Same Tokens",
      body: "The chart primitives read the same variables as everything else, so they work in both themes without a second palette.",
      reverse: false,
      points: [
        {
          iconName: "charts",
          title: "Charts and Graphs",
          body: "Line, bar, area and radial, sized and coloured by the token file.",
        },
        {
          iconName: "components",
          title: "Cards, Stats and Tables",
          body: "The furniture a dashboard is actually made of, in one consistent set.",
        },
      ],
    },
    {
      eyebrow: "Pre-built Layouts",
      title: "A Shell for Every Product Type",
      body: "Sidebar, top bar, tabs and breadcrumbs, on one z-index scale so two overlays never fight.",
      reverse: true,
      points: [
        {
          iconName: "layouts",
          title: "Sidebar and Shell Layouts",
          body: "Fixed, collapsible, nested and documentation shells, switchable per route.",
        },
        {
          iconName: "responsive",
          title: "Built for Small Screens",
          body: "Navigation, filters and tables each have their own behaviour, not a shrunk one.",
        },
      ],
    },
  ],
} as const;

/**
 * The dashboard gallery.
 *
 * **Every one of these is a placeholder**, drawn rather than screenshotted, because we ship one
 * dashboard design and the variants are on the roadmap. The frames are the right size, so the
 * page will not reflow when real screenshots replace them.
 */
export const DASHBOARD_GALLERY = {
  eyebrow: "Dashboard Variations",
  title: "E-commerce, Analytics, CRM, SaaS, Finance and More",
  lead: "One design, many shapes. These frames are placeholders: the variants are on the roadmap, and we would rather show you an empty frame than a screenshot of something that does not exist.",
  items: [
    { title: "E-commerce", body: "Orders, products, customers and revenue." },
    { title: "Analytics", body: "Traffic, funnels and cohort tables." },
    { title: "CRM", body: "Companies, people and opportunities." },
    { title: "SaaS", body: "Subscriptions, usage and billing." },
    { title: "Finance", body: "Balances, transactions and reconciliation." },
    { title: "Logistics", body: "Shipments, routes and inventory." },
  ],
} as const;

/**
 * The components page, rebuilt to the reference's catalogue layout (2026-08-16).
 *
 * The reference lists every screen it sells, grouped, each with a screenshot, a name and a line
 * of description. Ours has the same shape and **drawn placeholder frames instead of screenshots**,
 * because the screens exist inside the admin application and nobody has captured them yet. The
 * frames are the right size, so the page will not reflow when the real ones arrive.
 *
 * Every group below names screens the product genuinely has. Where a screen is only in the React
 * edition today, its card says so rather than implying it exists everywhere.
 */
export const COMPONENTS_PAGE = {
  seo: {
    title: `Components and Screens | ${BRAND}`,
    description:
      "Every screen and component in the kit: dashboards, sidebar layouts, e-commerce, support, calendar, profile and task screens, across React, Next.js, Vue and plain CSS.",
  },
  title: "Highly Customisable Tailwind CSS Dashboard Components",
  lead: "Speed up your build with the components behind the admin: charts, tables, forms, calendars and notifications, all reading the same tokens.",
  /** The reference closes its lead on a bolded call to action; ours carries the licence instead. */
  leadStrong: "Free, MIT licensed, forever.",
  selectorLabel: "Select a Framework to Explore Components",
  /**
   * The categories, one per area of the admin (`SD-069`).
   *
   * There were four until 2026-08-22, which made the tab rail a quarter the length of the
   * reference's and hid most of the product behind "Application screens". These are the areas the
   * React edition actually ships, taken from its route list rather than invented.
   */
  groups: [
    {
      title: "Dashboard",
      lead: "The landing screen, and the variants on the roadmap.",
      items: [
        {
          title: "Overview Dashboard",
          body: "Organizations, employees, markets and branches in one view.",
        },
        { title: "Analytics Dashboard", body: "Traffic, funnels and cohort tables." },
        { title: "CRM Dashboard", body: "Pipeline value, stage counts and the deals behind them." },
      ],
    },
    {
      title: "Layouts",
      lead: "The shells every screen sits in.",
      items: [
        { title: "Sidebar Layout", body: "Collapsible nav, quick actions and a command palette." },
        {
          title: "Tabbed Workspace",
          body: "Open records as tabs, the way a back office is actually used.",
        },
        { title: "Split Detail", body: "List on the left, record on the right, resizable." },
      ],
    },
    {
      title: "Charts",
      lead: "Recharts, themed from the same tokens as everything else.",
      items: [
        { title: "Line and Area", body: "Revenue against expenses, over any range." },
        { title: "Bar and Stacked", body: "Categorical comparisons with a legend that fits." },
        { title: "Radial and Gauge", body: "Targets, percentages and progress." },
      ],
    },
    {
      title: "Data Table",
      lead: "The component this product is built around.",
      items: [
        { title: "Full Data Table", body: "Sort, filter, page, select, import and export." },
        { title: "Column Controls", body: "Show, hide, reorder and pin, remembered per user." },
        { title: "Inline Editing", body: "Edit in place with per-cell validation." },
      ],
    },
    {
      title: "Record View",
      lead: "One record, read and write.",
      items: [
        {
          title: "Record Detail",
          body: "Fields laid out by type, alignment computed rather than remembered.",
        },
        { title: "Related Records", body: "Children and links, without leaving the page." },
        { title: "Audit Trail", body: "Who changed what, and when." },
      ],
    },
    {
      title: "Forms",
      lead: "Every input the design system ships.",
      items: [
        { title: "Field States", body: "Default, focus, error, disabled and read-only." },
        { title: "Complex Inputs", body: "Selects, combos, dates, files and rich text." },
        { title: "Validation", body: "Per-field messages that survive a failed submit." },
      ],
    },
    {
      title: "Steps",
      lead: "Multi-stage flows.",
      items: [
        { title: "Wizard", body: "Numbered steps with validation per stage." },
        { title: "Progress Header", body: "Where you are, and what is left." },
        { title: "Review and Confirm", body: "The last screen before a write." },
      ],
    },
    {
      title: "Calendar",
      lead: "Scheduling.",
      items: [
        { title: "Month View", body: "Events, drag to move, click to create." },
        { title: "Week and Day", body: "Hour grid with overlap handling." },
        { title: "Event Editor", body: "The panel that opens on a click." },
      ],
    },
    {
      title: "Chat",
      lead: "Conversation.",
      items: [
        { title: "Conversation List", body: "Unread counts, search and pinning." },
        { title: "Thread", body: "Messages, attachments and typing state." },
        { title: "Composer", body: "Send, attach and mention." },
      ],
    },
    {
      title: "Notifications",
      lead: "Telling someone something happened.",
      items: [
        { title: "Notification Centre", body: "Grouped, filterable, markable." },
        { title: "Toasts", body: "Success, warning and error, on the same tokens." },
        { title: "Empty State", body: "What it looks like with nothing in it." },
      ],
    },
    {
      title: "Organizations",
      lead: "The records the demo is built on.",
      items: [
        { title: "Organization List", body: "Search, filter and bulk actions." },
        { title: "Organization Detail", body: "Branches, employees and markets on one record." },
        { title: "Branches", body: "Locations under an organization." },
      ],
    },
    {
      title: "Employees",
      lead: "People.",
      items: [
        { title: "Employee Directory", body: "Filterable by department and role." },
        { title: "Employee Record", body: "Profile, reporting line and history." },
        { title: "Departments", body: "The structure employees sit in." },
      ],
    },
    {
      title: "Users",
      lead: "Access.",
      items: [
        { title: "User List", body: "Accounts, roles and last activity." },
        { title: "Roles and Permissions", body: "What each role can reach." },
        { title: "Invitations", body: "Pending, accepted and expired." },
      ],
    },
    {
      title: "Settings",
      lead: "Configuration.",
      items: [
        { title: "General Settings", body: "Name, locale, and the things everyone changes first." },
        { title: "Theme Settings", body: "The twelve token fields, live." },
        { title: "Integrations", body: "Keys, webhooks and their state." },
      ],
    },
    {
      title: "Support",
      lead: "Help.",
      items: [
        { title: "Ticket List", body: "Open, pending and resolved." },
        { title: "Ticket Detail", body: "Thread, attachments and internal notes." },
        { title: "Knowledge Base", body: "Articles, categorised." },
      ],
    },
    {
      title: "Authentication",
      lead: "The way in.",
      items: [
        { title: "Sign In", body: "Email, password and the states around them." },
        { title: "Sign Up", body: "Registration with validation." },
        { title: "Recovery", body: "Forgotten password and reset." },
      ],
    },
    {
      title: "Onboarding",
      lead: "The first five minutes.",
      items: [
        { title: "Welcome", body: "What this is, and what to do first." },
        { title: "Business Setup", body: "The details a new tenant supplies." },
        { title: "Checklist", body: "Progress toward a configured account." },
      ],
    },
  ],
} as const;

export const COMPANIES = {
  headline: "Trusted by 20 Companies Building on the VUI Design System",
  items: Array.from({ length: 20 }, (_, i) => ({
    id: `company-${i + 1}`,
    name: `Company ${i + 1}`,
  })),
} as const;

/** The alternating text-and-image blocks. Each `shot` names a capture in `screens.json`. */
export const SHOWCASE_BLOCKS = {
  eyebrow: "Other Notable Features",
  title: "Build an Admin Panel Effortlessly",
  blocks: [
    {
      eyebrow: "Your Ultimate Admin Template",
      title: "Ten Unique Dashboards for Various Use Cases",
      shot: "dashboard",
      points: [
        {
          title: "Dark and Light Mode",
          body: "Users switch between modes across every component and page, with no flash and no layout shift.",
        },
        {
          title: "Optimised Development Workflow",
          body: "A single design system underneath, so a change to a token reaches every screen at once.",
        },
      ],
    },
    {
      eyebrow: "Essential Components, Elements and Pages",
      title: "500+ Dashboard Elements for All Your Needs",
      shot: "data-table",
      points: [
        {
          title: "Dashboard UI Components",
          body: "Every essential Tailwind CSS component, crafted for React, Next.js, Vue, HTML, Angular and Laravel.",
        },
        {
          title: "Application Pages and UI Kit",
          body: "Mail, chat, invoice, task, table, profile, auth and settings, as working pages rather than fragments.",
        },
      ],
    },
    {
      eyebrow: "Visualise Data Your Way",
      title: "Charts, Graphs, Cards and Counter Styles",
      shot: "charts",
      points: [
        {
          title: "Charts and Graphs",
          body: "Ready-to-use chart components that read the same tokens as everything else, so a retheme reaches them too.",
        },
        {
          title: "Tables and Cards",
          body: "Rich, personalised data in whichever container fits, each with its own variations.",
        },
      ],
    },
    {
      eyebrow: "Pre-built Dashboard Layouts",
      title: "Flexible Shells for Every Product Type",
      shot: "settings",
      points: [
        {
          title: "Sidebar Layouts and Shells",
          body: "Classic, sectioned, collapsible, nested, toggle and documentation shells, covering flat and multi-level navigation.",
        },
        {
          title: "One Layout System",
          body: "Switch shells to suit the product. Works across every framework edition.",
        },
      ],
    },
  ],
} as const;

/** The plugin and add-on cards. */
export const PLUGINS = {
  eyebrow: "Powerful Toolkit",
  title: "Customised Plugins and Add-ons",
  items: [
    { title: "Recharts", body: "High-quality, interactive charts for data visualisation." },
    { title: "Radix UI", body: "Accessible primitives for menus, dialogs, popovers and the rest." },
    { title: "React Hook Form", body: "Validated forms with a fraction of the re-renders." },
    { title: "React Day Picker", body: "A lightweight, powerful date and range picker." },
    { title: "Cmdk", body: "The command palette, wired to every route and action." },
    { title: "Sonner", body: "Toasts that stack, queue and never move the layout." },
  ],
} as const;

/** The dark call-to-action band above the blog. */
export const CTA_BAND = {
  eyebrow: "What Are You Waiting For?",
  title: "Join the Teams Building on the VUI Design System",
  primary: { label: "Browse the Editions", href: "/products" },
  secondary: { label: "Live Preview", href: "/products/react" },
  note: "One design system, six framework editions",
} as const;

/** Three post cards. Mockup content until the blog comes back. */
export const HOME_POSTS = {
  eyebrow: "Blogs and Updates",
  title: "Our Latest Writing",
  items: [
    {
      date: "3 August 2026",
      title: "Seven of the Best Logistics Dashboard Templates for 2026",
      body: "Do not build from scratch. The logistics dashboards worth starting from, with reusable components and real framework support.",
      shot: "charts",
    },
    {
      date: "28 July 2026",
      title: "Seven of the Best Marketing Dashboard Templates for 2026",
      body: "Campaign performance, marketing KPIs and reporting, in templates that already handle the awkward states.",
      shot: "dashboard",
    },
    {
      date: "22 July 2026",
      title: "Eleven of the Best E-commerce Dashboard Templates for 2026",
      body: "Compare e-commerce dashboards across React, Next.js, Vue, Angular and HTML, and pick the one that fits your stack.",
      shot: "crm-pipeline",
    },
  ],
} as const;
