export interface CompetitorComparison {
  slug: string;
  competitor: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  competitorCategory: string;
  competitorBestFor: string;
  competitorDelivery: string;
  competitorStrengths: readonly string[];
  vuiBestFor: string;
  decision: string;
  questions: readonly { question: string; answer: string }[];
  officialUrl: string;
  reviewed: string;
}

/**
 * Fair decision pages, one per alternative (`SD-100`).
 *
 * **Every claim here was read off the vendor's own page on the date in `reviewed`, not recalled.**
 * All eight were checked on 2026-09-06 against the URL in `officialUrl`, and three were corrected
 * in the process: AdminLTE's framework ports are third-party rather than official, Preline's Figma
 * access is the free design system rather than a Pro file, and CoreUI advertises Next.js alongside
 * React, Angular and Vue. A comparison page written from memory is the same defect class as the npm
 * install instructions this store shipped for a package that was never published.
 *
 * **No prices, and no rankings.** Prices change faster than a quarterly review catches, so the page
 * links the vendor's own pricing page instead of restating it, and every entry names the audience
 * for whom the alternative is the better choice. `officialUrl` is what the reader is sent to verify
 * against, so it must be the page the facts came from rather than the vendor's home page.
 *
 * Recheck quarterly, and immediately after a competitor changes pricing or licensing. Moving a
 * `reviewed` date without reopening the page is the one edit that makes this file worse than
 * having no dates at all.
 */
export const COMPARISONS: readonly CompetitorComparison[] = [
  {
    slug: "tailadmin",
    competitor: "TailAdmin",
    title: "VuiAdmin and TailAdmin Compared",
    seoTitle: "VuiAdmin vs TailAdmin: Admin Dashboard Comparison",
    seoDescription:
      "Compare VuiAdmin and TailAdmin by framework coverage, licensing, application patterns and coding-agent workflow.",
    lead: "Two multi-framework admin products with different emphasis: template breadth versus a governed design grammar for humans and agents.",
    competitorCategory: "Multi-framework Tailwind admin template",
    competitorBestFor:
      "Buyers who want a mature Tailwind dashboard package with published framework editions and Figma source.",
    competitorDelivery: "Framework-specific downloadable templates with tiered lifetime licences.",
    competitorStrengths: [
      "Six advertised framework editions",
      "Established free distribution",
      "Figma source",
      "Multiple licence scopes",
    ],
    vuiBestFor:
      "Teams that want source plus explicit agent instructions, semantic component discovery, canonical page patterns and compliance rules.",
    decision:
      "Choose based on workflow. TailAdmin is a strong conventional template choice. VuiAdmin is designed for teams that expect coding agents to extend the interface repeatedly without drifting from the system.",
    questions: [
      {
        question: "Is VuiAdmin a TailAdmin fork?",
        answer:
          "No. VuiAdmin has its own tokens, components, page patterns, source and agent contract.",
      },
      {
        question: "Which product has more established framework availability?",
        answer:
          "TailAdmin publicly advertises downloadable HTML, React, Next.js, Vue, Angular and Laravel editions. Verify VuiAdmin's current availability table before purchasing.",
      },
      {
        question: "Which is designed around coding agents?",
        answer:
          "VuiAdmin makes agent behaviour a product contract through repository instructions, registries, examples and validation rules.",
      },
    ],
    officialUrl: "https://tailadmin.com/pricing",
    reviewed: "2026-09-06",
  },
  {
    slug: "shadcnblocks",
    competitor: "Shadcnblocks",
    title: "VuiAdmin and Shadcnblocks Compared",
    seoTitle: "VuiAdmin vs Shadcnblocks: Application System or Block Library",
    seoDescription:
      "Compare VuiAdmin with Shadcnblocks for admin applications, block discovery, CLI installation, MCP and complete workflows.",
    lead: "The products overlap in interface code but solve different starting problems: building a governed back office versus selecting individual blocks.",
    competitorCategory: "Large shadcn/ui component, block and template library",
    competitorBestFor:
      "Developers who want a very large searchable inventory, shadcn CLI installation, MCP discovery, Figma assets and a visual page builder.",
    competitorDelivery:
      "Individual source blocks, components, pages and templates installed into a project.",
    competitorStrengths: [
      "Large block inventory",
      "shadcn registry and CLI",
      "MCP discovery",
      "Page builder and Figma kit",
    ],
    vuiBestFor:
      "Developers building data-heavy back offices who want shared rules for navigation, records, forms, states and arbitrary agent-led extensions.",
    decision:
      "Choose Shadcnblocks when breadth and section-level selection are the priority. Choose VuiAdmin when the main concern is making every new operational screen follow one application grammar.",
    questions: [
      {
        question: "Does VuiAdmin replace shadcn/ui?",
        answer:
          "No. VuiAdmin is an application design system and admin product. Its project rules explain which shipped component owns each job.",
      },
      {
        question: "Which has the larger block catalog?",
        answer:
          "Shadcnblocks, by a wide margin: on the review date its pricing page advertised over two thousand blocks and over two thousand components. VuiAdmin ships a deliberately smaller governed vocabulary and complete administrative page patterns, so compare on the screens you have to build rather than on inventory size.",
      },
      {
        question: "Can both work with coding agents?",
        answer:
          "Yes. Shadcnblocks uses the shadcn registry and MCP workflow; VuiAdmin adds repository-specific design and page-composition rules.",
      },
    ],
    officialUrl: "https://www.shadcnblocks.com/pricing",
    reviewed: "2026-09-06",
  },
  {
    slug: "preline-ui",
    competitor: "Preline UI",
    title: "VuiAdmin and Preline UI Compared",
    seoTitle: "VuiAdmin vs Preline UI: Framework-Native Admin Comparison",
    seoDescription:
      "Compare VuiAdmin and Preline UI for Tailwind components, templates, framework-native code, AI prompts and MCP access.",
    lead: "A framework-native admin system compared with a broad HTML, Tailwind and JavaScript component ecosystem.",
    competitorCategory: "Tailwind component, block, plugin and template library",
    competitorBestFor:
      "Teams wanting a broad framework-neutral HTML and Tailwind source library, templates, headless plugins, a free Figma design system and MCP access.",
    competitorDelivery:
      "HTML, Tailwind CSS and JavaScript patterns adapted by customers into their chosen framework.",
    competitorStrengths: [
      "Large free component catalog",
      "Broad Pro block and template library",
      "Headless plugins",
      "AI prompts and MCP",
    ],
    vuiBestFor:
      "Teams that prefer native React, Next.js and planned framework editions with one admin application grammar and explicit state requirements.",
    decision:
      "Choose Preline when framework-neutral HTML patterns and library scale matter most. Choose VuiAdmin when native application structure and agent-governed admin workflows matter more.",
    questions: [
      {
        question: "Does Preline Pro ship React or Vue source?",
        answer:
          "No. Its pricing FAQ states Preline Pro does not ship framework-specific source files for React, Vue or similar frameworks, and provides HTML, Tailwind CSS and JavaScript patterns to adapt into any stack instead.",
      },
      {
        question: "Does VuiAdmin include a large marketing-block library?",
        answer:
          "VuiAdmin includes its own marketing blocks, but its primary differentiation is operational admin screens and extension rules.",
      },
      {
        question: "Which one should a Laravel team choose?",
        answer:
          "Preline can be adapted from HTML today. Use VuiAdmin only when the availability table confirms the Laravel edition is downloadable.",
      },
    ],
    officialUrl: "https://preline.co/pricing/",
    reviewed: "2026-09-06",
  },
  {
    slug: "adminlte",
    competitor: "AdminLTE",
    title: "VuiAdmin and AdminLTE Compared",
    seoTitle: "VuiAdmin vs AdminLTE: Tailwind and Bootstrap Admin Systems",
    seoDescription:
      "Compare VuiAdmin and AdminLTE across Tailwind, Bootstrap, licensing, framework ports, accessibility and agent workflows.",
    lead: "A commercial Tailwind-first application system compared with a widely used open-source Bootstrap admin foundation.",
    competitorCategory: "Open-source Bootstrap admin dashboard",
    competitorBestFor:
      "Teams wanting a free MIT-licensed Bootstrap admin foundation with a mature HTML implementation that drops into any template-rendering stack.",
    competitorDelivery:
      "Open-source Bootstrap HTML core, adapted by the customer into their framework.",
    competitorStrengths: [
      "MIT licence",
      "Bootstrap 5.3 in the v4 release",
      "No dependencies beyond a browser",
      "Long established and widely deployed",
    ],
    vuiBestFor:
      "Teams choosing a token-driven Tailwind application system with commercial screens and explicit instructions for coding-agent extensions.",
    decision:
      "Choose AdminLTE when Bootstrap compatibility, open-source licensing and its existing ecosystem are decisive. Choose VuiAdmin when Tailwind, source-governed components and agent consistency are the priority.",
    questions: [
      {
        question: "Is AdminLTE free?",
        answer:
          "Yes. Its own site states AdminLTE is released under the MIT Licence, allowing free use in personal and commercial projects with no attribution requirement.",
      },
      {
        question: "Can I combine AdminLTE and VuiAdmin?",
        answer:
          "It is technically possible but not recommended. Two token, component and layout systems make generated interfaces less consistent.",
      },
      {
        question: "Does AdminLTE ship official React or Vue editions?",
        answer:
          "Its site says AdminLTE works with React, Next.js, Vue, Laravel, Svelte, Astro and any framework that renders HTML templates. The premium framework editions sold around it are third party rather than official ports, which is worth confirming before you budget for one.",
      },
    ],
    officialUrl: "https://adminlte.io/",
    reviewed: "2026-09-06",
  },
  {
    slug: "coreui",
    competitor: "CoreUI",
    title: "VuiAdmin and CoreUI Compared",
    seoTitle: "VuiAdmin vs CoreUI: Enterprise Admin UI Comparison",
    seoDescription:
      "Compare VuiAdmin and CoreUI for React, Angular, Vue, Bootstrap, enterprise components, licensing and agent-led development.",
    lead: "A focused agent-readable theme compared with an established multi-framework admin and enterprise component vendor.",
    competitorCategory: "Multi-framework admin templates and UI components",
    competitorBestFor:
      "Teams that want an established Bootstrap-oriented admin ecosystem, premium components and enterprise support options.",
    competitorDelivery: "Open-source and commercial framework-specific UI packages and templates.",
    competitorStrengths: [
      "React, Angular, Vue and Next.js editions",
      "Bootstrap-based products",
      "Enterprise plan with response-time commitments",
      "A free tier alongside the paid components",
    ],
    vuiBestFor:
      "Teams prioritizing Tailwind source, a compact design vocabulary and repository-native agent instructions over a broad enterprise component catalog.",
    decision:
      "CoreUI is a credible choice for established Bootstrap and enterprise requirements. VuiAdmin is the more focused choice when the development workflow begins with a coding agent and a strict application grammar.",
    questions: [
      {
        question: "Is VuiAdmin an enterprise component suite?",
        answer:
          "Not in the same sense as a vendor offering dedicated enterprise support and advanced commercial widgets. Evaluate the exact VuiAdmin inventory before purchase.",
      },
      {
        question: "Which product is Tailwind-first?",
        answer:
          "VuiAdmin's current store editions are Tailwind-first. CoreUI's own pricing page advertises React, Angular, Vue, Bootstrap and Next.js, and its component libraries are built on Bootstrap.",
      },
      {
        question: "Which is easier for an agent to extend consistently?",
        answer:
          "VuiAdmin explicitly ships a component registry, page patterns and repository instructions for that purpose.",
      },
    ],
    officialUrl: "https://coreui.io/pricing/",
    reviewed: "2026-09-06",
  },
  {
    slug: "creative-tim",
    competitor: "Creative Tim",
    title: "VuiAdmin and Creative Tim Compared",
    seoTitle: "VuiAdmin vs Creative Tim: Templates, Blocks and AI Workflows",
    seoDescription:
      "Compare VuiAdmin with Creative Tim's templates, UI blocks, AI builder, agent products and subscription bundles.",
    lead: "A focused admin design system compared with a broad catalog that now combines templates, UI blocks, AI builders, agents and automation.",
    competitorCategory: "Template, UI block and AI-product ecosystem",
    competitorBestFor:
      "Developers wanting a broad subscription catalog spanning templates, shadcn blocks, AI generation and automation products.",
    competitorDelivery:
      "Subscription access to multiple UI and AI products, plus service offerings.",
    competitorStrengths: [
      "Broad product catalog",
      "Large historical template range",
      "UI blocks and CLI",
      "AI builder and automation positioning",
    ],
    vuiBestFor:
      "Teams that want one understandable admin design system, perpetual downloaded source and a project-local agent contract.",
    decision:
      "Choose Creative Tim for breadth across many products and AI services. Choose VuiAdmin for a narrower, source-owned admin system whose design rules travel with the repository.",
    questions: [
      {
        question: "Does Creative Tim only sell admin themes?",
        answer:
          "No. Its current catalog extends into UI blocks, AI app generation, hosted agents, automation and development services.",
      },
      {
        question: "Does VuiAdmin include hosted AI agents?",
        answer:
          "No. Agent-ready means coding agents can understand and extend the theme; it does not mean VuiAdmin hosts autonomous agents.",
      },
      {
        question: "Which pricing model is simpler?",
        answer:
          "VuiAdmin currently presents one-time source licences. Creative Tim's current all-access offering uses monthly and annual plans.",
      },
    ],
    officialUrl: "https://www.creative-tim.com/ui/pricing",
    reviewed: "2026-09-06",
  },
  {
    slug: "bootstrapdash",
    competitor: "BootstrapDash",
    title: "VuiAdmin and BootstrapDash Compared",
    seoTitle: "VuiAdmin vs BootstrapDash: Multi-Framework Admin Themes",
    seoDescription:
      "Compare VuiAdmin and BootstrapDash for Bootstrap, Tailwind, React, Angular, Vue, Laravel and template bundles.",
    lead: "One governed cross-framework product compared with a marketplace-style catalog of many individual admin themes.",
    competitorCategory: "Admin template catalog and framework bundles",
    competitorBestFor:
      "Buyers who want to choose among many separate Bootstrap, React, Angular, Tailwind, Vue and Laravel designs at lower individual prices.",
    competitorDelivery:
      "Individual templates and framework-specific bundles with commercial licences.",
    competitorStrengths: [
      "Large theme selection",
      "Multiple framework categories",
      "Free and premium products",
      "Framework bundles",
    ],
    vuiBestFor:
      "Teams that want the same design language and extension rules across frameworks rather than selecting unrelated themes for each stack.",
    decision:
      "Choose BootstrapDash when catalog variety and price-per-template are the priority. Choose VuiAdmin when design consistency across application teams and agents is the priority.",
    questions: [
      {
        question: "Does BootstrapDash specialize only in Bootstrap?",
        answer:
          "No. Its public catalog includes React, Angular, Tailwind, Vue and Laravel categories alongside Bootstrap products.",
      },
      {
        question: "Does VuiAdmin offer many visual brands?",
        answer:
          "VuiAdmin concentrates on one token-driven system with configurable styles rather than a marketplace of unrelated visual themes.",
      },
      {
        question: "Which is better for an agency?",
        answer:
          "An agency wanting design variety may prefer a broad catalog. An agency standardizing delivery across projects may prefer VuiAdmin's shared rules.",
      },
    ],
    officialUrl: "https://www.bootstrapdash.com/premium-admin-templates",
    reviewed: "2026-09-06",
  },
  {
    slug: "flatlogic",
    competitor: "Flatlogic",
    title: "VuiAdmin and Flatlogic Compared",
    seoTitle: "VuiAdmin vs Flatlogic: Theme or AI Application Platform",
    seoDescription:
      "Compare VuiAdmin's source theme and agent design contract with Flatlogic's AI application generation, hosting and business-app platform.",
    lead: "These products belong at different layers: a source-owned interface system versus a hosted environment that generates and operates applications.",
    competitorCategory: "AI business-application generation and hosting platform",
    competitorBestFor:
      "Teams wanting AI-generated full applications, managed development environments, hosting and optional implementation services.",
    competitorDelivery:
      "Subscription platform, usage credits, hosting and separately licensed templates.",
    competitorStrengths: [
      "AI application generation",
      "Development and stable environments",
      "Hosting",
      "Full-stack and service options",
    ],
    vuiBestFor:
      "Developers who already control their application architecture and need a reusable frontend system that coding agents can extend locally.",
    decision:
      "Choose Flatlogic when you want a platform to generate and host the application. Choose VuiAdmin when you want the interface source and rules inside your own development workflow.",
    questions: [
      {
        question: "Does VuiAdmin generate a backend?",
        answer:
          "No. It deliberately does not invent authentication, database, billing or authorization behaviour.",
      },
      {
        question: "Does Flatlogic sell only templates?",
        answer:
          "No. Its current offering combines AI modifications, development environments, hosting and template licences.",
      },
      {
        question: "Can VuiAdmin be used with a generated backend?",
        answer:
          "Yes, if you implement typed adapters between the generated API and the VuiAdmin page patterns.",
      },
    ],
    officialUrl: "https://flatlogic.com/pricing",
    reviewed: "2026-09-06",
  },
] as const;

export const comparisonBySlug = (slug: string): CompetitorComparison | undefined =>
  COMPARISONS.find((comparison) => comparison.slug === slug);
