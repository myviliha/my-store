/**
 * The marketplace taxonomy: what kinds of thing we sell, and what they are built with.
 *
 * Section 94 of the requirements document defines four vocabularies (product type, framework,
 * industry, style). Two of them earn a page each and two are tags, and the difference is
 * deliberate: **a vocabulary becomes a route only when we have something to put on it.**
 * Industry and style landing pages are Phase 3 in the document's own plan, and generating them
 * now would be the thin-page farm section 40 warns against.
 *
 * Every listing URL in the site is a slug from `PRODUCT_TYPES`, and every facet URL is a slug
 * from `FRAMEWORKS`. Nothing else routes.
 */

export type ProductTypeSlug =
  | "admin-templates"
  | "website-templates"
  | "components"
  | "forms"
  | "blocks"
  | "landing-pages"
  | "figma-kits";

export interface ProductType {
  slug: ProductTypeSlug;
  /** Plural, as a nav item and a breadcrumb. */
  label: string;
  /**
   * The page heading, which is **not** the nav label.
   *
   * The copy specification gives each listing page its own `h1` ("Admin Dashboard Templates",
   * "UI Components Built for Real Products"), longer and more descriptive than a menu entry can
   * be. Both are here because both are right in their own place.
   */
  h1: string;
  /** Singular, for a breadcrumb on a product page. */
  singular: string;
  /** One line, on the home page category card. */
  summary: string;
  /** The paragraph under the `h1` on the listing page. Section 96 calls this the introduction. */
  intro: string;
  /**
   * The `<title>`.
   *
   * §69 gives a pattern, `[CATEGORY] Templates & Components`, and applying it to our labels
   * produced "Admin templates Templates & Components": half our categories already contain the
   * noun. The pattern is the intent, so each title follows its shape and reads like a person
   * wrote it. §19 supplies this one outright for admin templates.
   */
  seoTitle: string;
  /**
   * The label in title case, for a `<title>` that names both a framework and a category.
   *
   * "React Admin templates" reads like a typo and "React admin templates" reads like a sentence
   * fragment in a browser tab, so the third form exists rather than title-casing `label` with a
   * regular expression that would get "UI" and "Figma" wrong.
   */
  noun: string;
  /** §19's supporting line, under the introduction. Absent where the specification gives none. */
  supporting?: string;
  /** §19's empty state, for a filter combination with nothing in it. */
  emptyState?: string;
  /**
   * The meta description, written for a search result rather than for the page.
   *
   * Separate from `intro` because the two have different jobs and different lengths: `intro`
   * persuades someone who has already arrived, and this has to fit inside about 155 characters
   * before a search engine truncates it mid-word. Section 41 requires it to be unique per page.
   */
  seoDescription: string;
  /** Answer-engine bait, and a real answer: section 43 wants the question answered on the page. */
  question: string;
  answer: string;
}

/**
 * The seven types, in the order the document lists them (§11).
 *
 * Four of them have no products yet and that is visible rather than hidden: their listing pages
 * render the waitlist state. Rules 5 to 8 of §122 forbid inventing products to fill a grid, and a
 * category that says "in design, tell me when it ships" converts better than one that lies.
 */
/**
 * Slugs that name something with no product behind it, so nothing may promise them.
 *
 * `odin/product/PRODUCT.md`: remove Figma from paid promises until a distributable
 * Figma product exists. Figma appears in this taxonomy **twice**, once as a product type and once as a
 * framework, and it was in the menus, the footer, the "available in" strip, the sitemap and the pricing
 * matrix. One list, used by all of them, is the only way that stays true.
 *
 * **Typed as the union of both slug kinds on purpose.** It began as `readonly string[]`, and review
 * pointed out that a rename on either side would silently reinstate Figma everywhere with nothing
 * failing. Now `tsgo` fails instead.
 */
export const PROMISED_WITHOUT_A_PRODUCT: readonly (ProductTypeSlug | FrameworkSlug)[] = [
  "figma-kits",
  "figma",
];

export const PRODUCT_TYPES: readonly ProductType[] = [
  {
    slug: "admin-templates",
    label: "Admin templates",
    h1: "Admin Dashboard Templates",
    noun: "Admin Templates",
    seoTitle: "Admin Dashboard Templates | React, Next.js & Tailwind",
    singular: "Admin template",
    summary: "Complete dashboards and application interfaces designed for real-world products.",
    intro:
      "Build powerful applications faster with production-ready admin dashboards designed for modern web products.",
    seoDescription:
      "Explore production-ready admin dashboard templates for SaaS, CRM, analytics, e-commerce, finance, AI, and more.",
    supporting:
      "Explore dashboards for SaaS applications, analytics platforms, CRM systems, e-commerce products, internal tools, and more.",
    emptyState:
      "No templates match your current filters. Try removing a filter or searching for something else.",
    question: "What is an admin dashboard template?",
    answer:
      "An admin dashboard template is a pre-built frontend interface containing the common screens and components used to manage data, users, settings, analytics and other application functionality.",
  },
  {
    slug: "website-templates",
    label: "Website templates",
    h1: "Website Templates for Modern Brands",
    noun: "Website Templates",
    seoTitle: "Website Templates for Modern Brands",
    singular: "Website template",
    summary:
      "Launch marketing websites, SaaS products, agencies, portfolios, and more with ready-to-use website templates.",
    intro:
      "Launch polished websites faster with responsive templates designed for startups, SaaS companies, agencies, businesses, portfolios, and modern brands.",
    seoDescription:
      "Complete marketing sites built from the same tokens as our dashboards. In design today, with an honest waitlist rather than a shelf of mockups.",
    question: "What is a website template?",
    answer:
      "A website template is a complete marketing site: home, pricing, blog, documentation and legal pages already designed, which you fill with your own content.",
  },
  {
    slug: "components",
    label: "Components",
    h1: "UI Components Built for Real Products",
    noun: "Components",
    seoTitle: "UI Components for React, Vue and Plain CSS",
    singular: "Component library",
    summary: "Reusable buttons, forms, navigation, tables, modals, cards, charts, and more.",
    intro:
      "Stop rebuilding common interface patterns. Explore reusable components designed for modern web applications.",
    seoDescription:
      "Production-ready UI components as React and Vue source, and as plain CSS with no framework. Free, and the libraries the paid editions are built from.",
    question: "What is a UI component library?",
    answer:
      "A UI component library is a set of reusable interface parts, built once and styled consistently, that you compose into screens rather than writing from scratch each time.",
  },
  {
    slug: "forms",
    label: "Forms",
    h1: "Production-Ready Forms",
    noun: "Forms",
    seoTitle: "Production-Ready Form Components",
    singular: "Form kit",
    summary:
      "Production-ready forms for authentication, onboarding, checkout, settings, contact, and application workflows.",
    intro:
      "Build better user flows with reusable forms for authentication, onboarding, checkout, settings, contact, and more.",
    seoDescription:
      "Form components with all eight field states designed: default, focus, filled, error, success, disabled, loading and required. Inside the component library today.",
    question: "What should a form component include?",
    answer:
      "A form component needs every state designed, not just the empty one: default, focus, filled, error, success, disabled, loading and required, plus a label and a description a screen reader can reach.",
  },
  {
    slug: "blocks",
    label: "Blocks",
    h1: "Build Pages One Block at a Time",
    noun: "Blocks",
    seoTitle: "Marketing Page Blocks and Sections",
    singular: "Block library",
    summary:
      "Build pages faster with ready-made heroes, pricing sections, testimonials, FAQs, CTAs, and more.",
    intro:
      "Drop professionally designed sections into your pages and spend less time recreating common marketing patterns.",
    seoDescription:
      "58 marketing page sections: hero, features, pricing, testimonials, FAQ and footer. Content as props, server rendered, no JavaScript unless you ask.",
    question: "What is a UI block?",
    answer:
      "A UI block is a complete page section, such as a hero, a pricing table or an FAQ, that you drop into a page and fill with your own content instead of laying out from scratch.",
  },
  {
    slug: "landing-pages",
    label: "Landing pages",
    h1: "Landing Pages That Start You Ahead",
    noun: "Landing Pages",
    seoTitle: "Landing Page Templates",
    singular: "Landing page",
    summary: "Complete landing page experiences designed to help you launch faster.",
    intro:
      "Complete landing page experiences for SaaS products, startups, agencies, AI products, and modern businesses.",
    seoDescription:
      "Complete landing pages composed from our blocks, for launches and campaigns. In design, with a waitlist rather than a placeholder product.",
    question: "What is a landing page template?",
    answer:
      "A landing page template is a single page built to convert one audience for one offer, with the hero, proof, pricing and call to action already arranged.",
  },
  {
    slug: "figma-kits",
    label: "Figma kits",
    h1: "Figma Kits",
    noun: "Figma Kits",
    seoTitle: "Figma UI Kits",
    singular: "Figma kit",
    summary: "The design source behind the code.",
    intro:
      "The same tokens and components as the code, in Figma, so a designer and a developer are describing one system.",
    seoDescription:
      "The design source behind the code: the same tokens and components in Figma, so design and development describe one system. In design today.",
    question: "What is a Figma UI kit?",
    answer:
      "A Figma UI kit is the design-side twin of a component library: the same colours, spacing and components as variables and components in Figma, so design and code stay in step.",
  },
];

export type FrameworkSlug =
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "html"
  | "laravel"
  | "tailwind"
  | "figma";

export interface Framework {
  slug: FrameworkSlug;
  label: string;
  /** One line, on the framework card and in the facet page's meta description. */
  summary: string;
}

/** Section 13's list, and the axis every facet page is generated on. */
export const FRAMEWORKS: readonly Framework[] = [
  { slug: "react", label: "React", summary: "The component library, as TypeScript source." },
  {
    slug: "nextjs",
    label: "Next.js",
    summary: "App Router, server components, and the admin template.",
  },
  { slug: "vue", label: "Vue", summary: "Built on Reka UI, rendering the same markup as React." },
  { slug: "angular", label: "Angular", summary: "In design. Join the list and we will tell you." },
  { slug: "html", label: "HTML", summary: "Plain CSS, no build step, no framework." },
  { slug: "laravel", label: "Laravel", summary: "In design, as Blade components." },
  {
    slug: "tailwind",
    label: "Tailwind CSS",
    summary: "Every edition is Tailwind v4 and one token file.",
  },
  { slug: "figma", label: "Figma", summary: "The design source. In progress." },
];

/**
 * Industries and styles are **tags, not routes**, this phase.
 *
 * They label products so that search matches "crm dashboard" and so a Phase 3 industry page has
 * something to select on. Giving them URLs now would mean ten pages selecting from ten products.
 */
export const INDUSTRIES = [
  "SaaS",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Real estate",
  "AI",
  "Marketing",
  "CRM",
  "Logistics",
] as const;

export const STYLES = [
  "Minimal",
  "Modern",
  "Corporate",
  "Creative",
  "Dark",
  "Light",
  "Editorial",
] as const;

export const productType = (slug: string): ProductType | undefined =>
  PRODUCT_TYPES.find((t) => t.slug === slug);

export const framework = (slug: string): Framework | undefined =>
  FRAMEWORKS.find((f) => f.slug === slug);
