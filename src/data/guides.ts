export interface GuideSection {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface Guide {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  answer: string;
  published: string;
  updated: string;
  readingMinutes: number;
  sections: readonly GuideSection[];
  faq: readonly { question: string; answer: string }[];
}

/** Evergreen educational pages with distinct search intent and no framework-name substitution. */
export const GUIDES: readonly Guide[] = [
  {
    slug: "choose-admin-dashboard-template",
    title: "How to Choose an Admin Dashboard Template",
    seoTitle: "How to Choose an Admin Dashboard Template",
    seoDescription:
      "Evaluate admin dashboard templates by workflows, states, accessibility, code ownership, framework fit, licensing and maintenance.",
    summary:
      "A purchasing checklist for teams that need a foundation they can maintain after the demo looks good.",
    answer:
      "Choose an admin template by testing one real workflow end to end. Verify framework compatibility, source quality, responsive states, accessibility, data adapters, licensing and upgrade policy before comparing the number of screens.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 8,
    sections: [
      {
        title: "Begin With a Real Workflow",
        paragraphs: [
          "A dashboard screenshot is not the product. Select a workflow your team must ship, such as creating a customer, filtering a large list, approving an invoice or resolving a ticket, then implement it against the candidate template.",
        ],
        bullets: [
          "Can the user complete the task on mobile?",
          "Are loading, empty, error and permission states designed?",
          "Does the form preserve data after a validation failure?",
          "Can the table use server-side pagination and filtering?",
        ],
      },
      {
        title: "Inspect the Source Contract",
        paragraphs: [
          "Determine whether you receive editable source, compiled assets or access to a hosted builder. Confirm component import paths, TypeScript quality, dependency boundaries and whether examples use the same code that is sold.",
        ],
        bullets: [
          "Documented component ownership",
          "Stable design tokens",
          "No duplicate UI system",
          "Build and type-check commands",
          "Versioned upgrade notes",
        ],
      },
      {
        title: "Check the Licence Against Your Business",
        paragraphs: [
          "Unlimited projects, client work, hosted SaaS and redistribution are separate rights. Read the actual licence rather than inferring rights from the word commercial.",
        ],
        bullets: [
          "Legal entity covered",
          "Number of developers or seats",
          "Client-project rights",
          "SaaS end-product rights",
          "Source redistribution restrictions",
          "Update and support period",
        ],
      },
      {
        title: "Evaluate Agent Readiness",
        paragraphs: [
          "A coding agent needs more than public documentation. Strong agent support lives inside the repository and names the components, patterns, validation commands and things the agent must not invent.",
        ],
        bullets: [
          "Repository instructions",
          "Machine-readable component registry",
          "Canonical page examples",
          "Required UI states",
          "Theme compliance validation",
        ],
      },
    ],
    faq: [
      {
        question: "How many pages should an admin template include?",
        answer:
          "There is no universal number. Coverage of your actual workflows matters more than a high count of lightly varied pages.",
      },
      {
        question: "Should I choose a free or paid admin template?",
        answer:
          "Choose based on maintenance cost, licence, support and workflow coverage. A free foundation can be excellent; a paid product should save enough implementation and governance work to justify its price.",
      },
      {
        question: "Should the template include a backend?",
        answer:
          "Only if you want its backend architecture. A frontend-only theme should clearly define adapters and avoid pretending demo data is production business logic.",
      },
    ],
  },
  {
    slug: "agent-ready-design-system",
    title: "What Makes a Design System Agent-Ready",
    seoTitle: "Agent-Ready Design Systems for Coding Agents",
    seoDescription:
      "Learn how component registries, semantic page specifications, canonical examples and validators help coding agents build consistent interfaces.",
    summary:
      "The repository contract that turns an attractive component library into a dependable system for Codex, Claude and other coding agents.",
    answer:
      "An agent-ready design system exposes its decisions as data and rules: semantic component purposes, page patterns, design tokens, canonical examples, required states, repository instructions and deterministic validation.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 9,
    sections: [
      {
        title: "Give the Agent a Vocabulary",
        paragraphs: [
          "Component names are not enough. Record when to use each component, which variants are supported, which states are mandatory and which alternatives are prohibited.",
        ],
        bullets: [
          "Intent tags",
          "Import paths",
          "Variants and states",
          "Accessibility requirements",
          "Good and bad examples",
        ],
      },
      {
        title: "Define Page Grammar",
        paragraphs: [
          "Most product screens are compositions of recurring intentions: list, detail, create, edit, settings, dashboard, conversation, calendar and workflow. Each pattern should define regions, action placement and state requirements.",
        ],
      },
      {
        title: "Use a Semantic Intermediate Specification",
        paragraphs: [
          "Let the agent first describe the page as structured intent: field type, width, relationship and action, rather than as framework classes. Validate that specification, then render or implement it using the current framework adapter.",
        ],
      },
      {
        title: "Validate the Result",
        paragraphs: [
          "A successful build proves syntax, not design-system compliance. Add checks for raw colours, unsupported props, duplicate components, missing states, inaccessible names and inconsistent route or navigation structure.",
        ],
      },
    ],
    faq: [
      {
        question: "Is an AGENTS.md file enough?",
        answer:
          "It is an important starting point, but machine-readable registries, examples and validators make the instructions discoverable and enforceable.",
      },
      {
        question: "Does agent-ready mean AI-generated design?",
        answer:
          "No. It means a coding agent can correctly reuse and extend a designed system. The system, not the model, remains the source of design decisions.",
      },
      {
        question: "Should the registry be hosted?",
        answer:
          "Keep a versioned local copy with the project. A hosted service may improve discovery and updates, but private source should not need to leave the customer's environment.",
      },
    ],
  },
  {
    slug: "react-admin-dashboard-architecture",
    title: "A Maintainable React Admin Dashboard Architecture",
    seoTitle: "React Admin Dashboard Architecture Guide",
    seoDescription:
      "Structure a React admin dashboard with routes, feature boundaries, typed adapters, reusable page patterns and predictable UI states.",
    summary:
      "A frontend structure that keeps business features separate while preserving one design system.",
    answer:
      "A maintainable React admin separates application shell, feature routes, domain adapters and reusable UI primitives. Pages compose approved patterns; components do not fetch arbitrary data or encode business authorization.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 7,
    sections: [
      {
        title: "Separate the Shell From Features",
        paragraphs: [
          "Navigation, workspace switching, notifications and global commands belong to the application shell. Customer, billing and support logic belong to feature folders with explicit routes and adapters.",
        ],
      },
      {
        title: "Keep Data Behind Typed Adapters",
        paragraphs: [
          "A component should receive a stable record shape rather than know whether data came from REST, GraphQL, local mocks or a third-party SDK.",
        ],
        bullets: [
          "List query",
          "Record query",
          "Create and update commands",
          "Pagination contract",
          "Error normalization",
        ],
      },
      {
        title: "Compose Page Patterns",
        paragraphs: [
          "List pages should share search, filters, table, pagination and states. Detail pages should share identity, actions, summary, related records and activity. Repetition at the pattern level is consistency; copied component source is debt.",
        ],
      },
      {
        title: "Keep Authorization on Both Sides",
        paragraphs: [
          "The interface may hide or disable unavailable actions, but the API must enforce authorization independently. Treat UI permissions as communication, not security.",
        ],
      },
    ],
    faq: [
      {
        question: "Should React components call APIs directly?",
        answer:
          "Prefer feature-level data hooks or adapters. Visual components remain easier to test when they receive typed data and callbacks.",
      },
      {
        question: "Where should global state live?",
        answer:
          "Keep server data in a data-query layer and reserve client global state for genuine cross-route interface state such as current workspace or user preference.",
      },
      {
        question: "Should every page use the same layout?",
        answer:
          "Use a small set of intentional layouts. Authentication, focused workflows and dense operations may need different shells while sharing tokens and components.",
      },
    ],
  },
  {
    slug: "nextjs-admin-dashboard-architecture",
    title: "Building an Admin Dashboard With the Next.js App Router",
    seoTitle: "Next.js App Router Admin Dashboard Guide",
    seoDescription:
      "Plan a Next.js admin dashboard with route groups, server and client boundaries, metadata, loading states and typed data adapters.",
    summary:
      "How to use the App Router without turning the entire back office into one client-side component.",
    answer:
      "Use route groups to separate authenticated and public layouts, server components for data and static structure, and client components only for interactive state. Define loading, error and not-found behaviour at meaningful route boundaries.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 8,
    sections: [
      {
        title: "Design Route Groups Around Shells",
        paragraphs: [
          "Keep marketing, authentication and application routes under layouts that reflect their actual chrome. Parentheses organize the source without changing public URLs.",
        ],
      },
      {
        title: "Choose the Client Boundary Deliberately",
        paragraphs: [
          "Tables, menus and forms may require client behaviour; headings, descriptions and static page structure usually do not. Move the boundary down to the smallest component that needs browser state.",
        ],
      },
      {
        title: "Make Route States Part of the Product",
        paragraphs: [
          "Use loading, error and not-found boundaries that preserve navigation and explain recovery. A blank suspense fallback or generic exception page is not enough for operational software.",
        ],
      },
      {
        title: "Keep Public and Private SEO Separate",
        paragraphs: [
          "Public product pages need canonical metadata and crawlable text. Authenticated application routes and login pages generally need noindex directives and should never leak private data into metadata.",
        ],
      },
    ],
    faq: [
      {
        question: "Should an admin dashboard be fully server-rendered?",
        answer:
          "No. Render data and structure on the server where useful, then add focused client islands for interaction.",
      },
      {
        question: "Should private admin pages appear in the sitemap?",
        answer:
          "No. Sitemaps should contain canonical public URLs intended for discovery, not authenticated application routes.",
      },
      {
        question: "Can the same components work in Vite and Next.js?",
        answer:
          "Yes when framework-specific routing, metadata and server behaviour remain outside the visual component package.",
      },
    ],
  },
  {
    slug: "accessible-data-tables",
    title: "Designing Accessible Data Tables for Admin Applications",
    seoTitle: "Accessible Admin Data Table Design Guide",
    seoDescription:
      "Design accessible admin data tables with semantic structure, keyboard controls, responsive alternatives, filters and complete states.",
    summary: "Practical requirements for the screen where most back-office work actually happens.",
    answer:
      "An accessible data table needs semantic headers, clear labels, keyboard-operable controls, visible focus, announced sorting, meaningful selection and responsive behaviour that preserves relationships between labels and values.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 7,
    sections: [
      {
        title: "Start With Table Semantics",
        paragraphs: [
          "Use a real table for tabular relationships, with a caption where context is not already clear, scoped headers and accessible names for controls. Do not turn a data grid into an unlabeled collection of generic div elements.",
        ],
      },
      {
        title: "Make Operations Understandable",
        paragraphs: [
          "Sort controls should announce direction. Row selection needs a label tied to the record. Bulk actions should state how many records they affect and remain unavailable when nothing is selected.",
        ],
      },
      {
        title: "Design Every Data State",
        paragraphs: [
          "Loading, empty dataset, no filter results, partial data, permission restrictions and errors communicate different situations and require different recovery actions.",
        ],
      },
      {
        title: "Preserve Meaning on Small Screens",
        paragraphs: [
          "Horizontal scrolling can be appropriate for comparison-heavy tables. A card transformation can work for record lists, but only if field labels remain present and action order stays predictable.",
        ],
      },
    ],
    faq: [
      {
        question: "Should every record list use a table?",
        answer:
          "No. Use tables when users compare the same fields across records. Use cards or lists when scanning identity and one primary action matters more.",
      },
      {
        question: "Is horizontal scrolling accessible?",
        answer:
          "It can be when the region is keyboard reachable, clearly indicated and does not trap focus. Test it with keyboard and screen-reader workflows.",
      },
      {
        question: "Where should row actions appear?",
        answer:
          "Keep frequent actions visible when space permits and group secondary actions in a consistently named menu. Do not rely on hover alone.",
      },
    ],
  },
  {
    slug: "admin-loading-empty-error-states",
    title: "Loading, Empty and Error States Are Part of the Page",
    seoTitle: "Admin Dashboard Loading, Empty and Error States",
    seoDescription:
      "Design loading, first-use, no-results, error, offline and permission states as part of every data-backed admin page.",
    summary:
      "Why the happy path is only one state of a production interface, and what every other state should communicate.",
    answer:
      "Every data-backed page needs distinct loading, first-use empty, filtered-empty, error and success states. Each state should explain what happened, preserve context and offer the safest useful next action.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 6,
    sections: [
      {
        title: "Separate First Use From No Results",
        paragraphs: [
          "An empty account should teach the first successful action. A filter returning no matches should preserve the filter and offer to clear or adjust it. Using one generic empty illustration for both loses essential context.",
        ],
      },
      {
        title: "Keep Loading Stable",
        paragraphs: [
          "Skeletons should approximate the final structure so content does not jump when it arrives. Avoid indefinite spinners where progressive or partial content is available.",
        ],
      },
      {
        title: "Make Errors Recoverable",
        paragraphs: [
          "Explain whether retry is safe, preserve the user's input, expose a support reference when useful and avoid blaming the user for service failures.",
        ],
      },
      {
        title: "Treat Permissions as a State",
        paragraphs: [
          "A user who can view but not edit should see why an action is unavailable. A user who cannot view the resource should receive a clear boundary without leaking sensitive record details.",
        ],
      },
    ],
    faq: [
      {
        question: "Should forms validate on every keystroke?",
        answer:
          "Usually validate on submit or after a field has been meaningfully completed. Immediate errors can interrupt entry before the value is valid.",
      },
      {
        question: "Should an error state remove the page navigation?",
        answer:
          "Usually no. Preserve the application shell and enough context to retry, go back or seek help.",
      },
      {
        question: "What should a filtered-empty state do?",
        answer:
          "Show that the dataset exists but the current query matched nothing, display active filters and offer a clear way to adjust or remove them.",
      },
    ],
  },
  {
    slug: "multi-framework-design-system",
    title: "Maintaining One Design System Across Multiple Frameworks",
    seoTitle: "Multi-Framework Design System Architecture",
    seoDescription:
      "Keep React, Next.js, Vue, Angular, Laravel and HTML editions aligned through semantic tokens, contracts and parity tests.",
    summary:
      "How to support several implementation stacks without allowing them to become several unrelated products.",
    answer:
      "A multi-framework design system needs one semantic source of truth for tokens, component intentions, variants and page patterns. Each framework implements that contract natively and parity tests detect drift.",
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 8,
    sections: [
      {
        title: "Share Meaning Before Markup",
        paragraphs: [
          "A button's intent, sizes and states can be shared even when React, Vue and Blade express them differently. Treat semantic behaviour as the contract and implementation syntax as an adapter.",
        ],
      },
      {
        title: "Generate What Must Be Identical",
        paragraphs: [
          "Tokens, class variants, icon names and documentation indexes are strong generation candidates. Framework-specific lifecycle and accessibility behaviour should remain native and tested.",
        ],
      },
      {
        title: "Publish an Honest Parity Matrix",
        paragraphs: [
          "Do not say every edition is identical when one lacks a data table, calendar or form workflow. Generate availability from package manifests and distinguish built, previewable, published and purchasable states.",
        ],
      },
      {
        title: "Version the Contract",
        paragraphs: [
          "A shared contract needs migration notes when a token, component prop or page pattern changes. Otherwise one framework can silently remain on the previous meaning while keeping the same visual name.",
        ],
      },
    ],
    faq: [
      {
        question: "Should all framework editions share component APIs?",
        answer:
          "Share names and concepts where natural, but do not force React hooks or Vue slots into frameworks that express composition differently.",
      },
      {
        question: "Can Tailwind and Bootstrap use the same design contract?",
        answer:
          "Yes at the semantic level, but each needs a separately tested renderer and component implementation.",
      },
      {
        question: "How should parity be measured?",
        answer:
          "Track component families, variants, states, page patterns, accessibility behaviour, build status, documentation and release availability.",
      },
    ],
  },
] as const;

export const guideBySlug = (slug: string): Guide | undefined =>
  GUIDES.find((guide) => guide.slug === slug);
