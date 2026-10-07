export interface MarketFaq {
  question: string;
  answer: string;
}

export interface TargetMarket {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  audience: string;
  directAnswer: string;
  problems: readonly string[];
  screens: readonly { name: string; purpose: string }[];
  workflow: readonly string[];
  components: readonly string[];
  agentPrompt: string;
  faq: readonly MarketFaq[];
}

/**
 * Buyer-led solution pages. Each entry represents a different application workflow, not a keyword
 * variation of the same dashboard page. That distinction keeps the pages useful and prevents the
 * framework-by-industry combinations from becoming duplicate doorway pages.
 */
export const TARGET_MARKETS: readonly TargetMarket[] = [
  {
    slug: "saas-back-office",
    name: "SaaS Back Offices",
    eyebrow: "For SaaS Product Teams",
    title: "Build the Operational Back Office Behind Your SaaS",
    seoTitle: "SaaS Admin Dashboard and Back-Office UI Kit",
    seoDescription:
      "Build a SaaS back office with tenants, subscriptions, usage, permissions and support using reusable, agent-readable UI patterns.",
    lead: "Give operators one coherent place to manage customers, workspaces, plans, entitlements, usage and account health.",
    audience: "SaaS founders, product teams and agencies building subscription software.",
    directAnswer:
      "A SaaS back office needs more than analytics cards. It needs tenant-aware customer records, subscriptions, usage, entitlements, support history, roles and an audit trail arranged around daily operating tasks.",
    problems: [
      "Generic dashboards stop at charts and leave operational workflows undefined.",
      "Billing, workspace and customer data often end up scattered across unrelated tools.",
      "Agents generate inconsistent screens when the project has no page and component rules.",
    ],
    screens: [
      { name: "Tenant Overview", purpose: "Health, plan, usage, owners and recent activity." },
      { name: "Subscription Management", purpose: "Plans, add-ons, renewals and failed payments." },
      { name: "Entitlements", purpose: "Features and limits granted to each workspace." },
      { name: "Customer Timeline", purpose: "Support, billing and product events in one history." },
      { name: "Team and Roles", purpose: "Membership, invitations and permission boundaries." },
      { name: "Usage Analytics", purpose: "Adoption, limits, cohorts and account-level trends." },
    ],
    workflow: [
      "Create Tenant",
      "Invite Team",
      "Assign Plan",
      "Track Usage",
      "Resolve Risk",
      "Renew",
    ],
    components: [
      "RecordView",
      "Data Table",
      "Metric Cards",
      "Tabs",
      "Usage Chart",
      "Activity Timeline",
    ],
    agentPrompt:
      "Build a SaaS tenant detail page with plan, usage, members, entitlements, invoices and an activity timeline. Use existing VuiAdmin patterns and include loading, empty, error and permission states.",
    faq: [
      {
        question: "Is VuiAdmin a SaaS backend?",
        answer:
          "No. VuiAdmin supplies the interface, page patterns and typed integration boundaries. You connect those screens to your authentication, billing and application APIs.",
      },
      {
        question: "Can an AI coding agent extend the SaaS screens?",
        answer:
          "Yes. The shipped agent instructions, component registry and canonical examples tell a coding agent how to add fields, pages and states without creating a second design system.",
      },
      {
        question: "Does the theme support multi-tenant products?",
        answer:
          "The UI includes organization, workspace, member and role patterns. Tenant isolation remains a backend responsibility and must be enforced by your API and database.",
      },
    ],
  },
  {
    slug: "crm-software",
    name: "CRM Products",
    eyebrow: "For CRM Builders",
    title: "Design a CRM Around the Work Sales Teams Actually Do",
    seoTitle: "CRM Admin Dashboard Template and UI Patterns",
    seoDescription:
      "Build CRM software with contacts, companies, pipelines, activities, quotes and sales reporting using consistent application patterns.",
    lead: "Move from a lead to a customer without forcing teams through unrelated tables and one-off forms.",
    audience: "CRM startups, sales-software teams, consultants and vertical SaaS builders.",
    directAnswer:
      "A useful CRM interface connects contacts, companies, opportunities and activity history. The design should make the next action obvious while preserving context across the entire relationship.",
    problems: [
      "Customer context is lost when contacts, deals and conversations use different layouts.",
      "Pipeline boards look convincing in demos but omit filters, permissions and empty states.",
      "Sales teams need rapid editing without losing their current list or pipeline position.",
    ],
    screens: [
      { name: "Contact List", purpose: "Search, segmentation, ownership and bulk actions." },
      { name: "Company Record", purpose: "Contacts, deals, tasks, notes and account history." },
      { name: "Sales Pipeline", purpose: "Stage movement, value, probability and next action." },
      { name: "Activity Composer", purpose: "Calls, emails, meetings, notes and follow-ups." },
      { name: "Quote Builder", purpose: "Line items, discounts, approvals and customer delivery." },
      { name: "Sales Forecast", purpose: "Weighted pipeline, targets and team performance." },
    ],
    workflow: ["Capture Lead", "Qualify", "Create Deal", "Record Activity", "Send Quote", "Close"],
    components: ["RecordView", "Kanban", "Combobox", "Timeline", "Form Actions", "Charts"],
    agentPrompt:
      "Add a customer record with first name, last name, email, date of birth, company and owner. Include Cancel and Create Customer actions, validation, a responsive field grid and all required states.",
    faq: [
      {
        question: "Can I change the CRM fields?",
        answer:
          "Yes. CRM fields are application data, not fixed theme content. Agents map each field intent to the approved input, select, date, relationship or upload component.",
      },
      {
        question: "Does VuiAdmin include a CRM database?",
        answer:
          "No. It provides the frontend workflow and typed adapter boundaries so you can connect your own CRM schema and API.",
      },
      {
        question: "Can I build a vertical CRM?",
        answer:
          "Yes. Keep the shared record, list, pipeline and activity patterns, then introduce fields and workflows specific to real estate, healthcare, legal work or another domain.",
      },
    ],
  },
  {
    slug: "ecommerce-operations",
    name: "E-Commerce Operations",
    eyebrow: "For Commerce Teams",
    title: "Run Orders, Products and Fulfilment From One Interface",
    seoTitle: "E-Commerce Admin Dashboard for Operations Teams",
    seoDescription:
      "Build an e-commerce operations dashboard for products, orders, customers, fulfilment, returns and revenue analysis.",
    lead: "Create the operating layer behind a storefront, from catalog maintenance through fulfilment and returns.",
    audience: "Commerce platforms, marketplace operators, retailers and ecommerce agencies.",
    directAnswer:
      "An e-commerce admin dashboard should connect product, inventory, order, payment and fulfilment states. Operators need exceptions and next actions, not only revenue charts.",
    problems: [
      "Order exceptions disappear inside large tables without actionable states.",
      "Catalog editing becomes slow when variants, media and inventory are split across forms.",
      "Returns and refunds require a traceable workflow rather than one destructive button.",
    ],
    screens: [
      { name: "Product Catalogue", purpose: "Products, variants, categories, media and status." },
      { name: "Order Queue", purpose: "Payment, fulfilment, risk and delivery exceptions." },
      { name: "Order Detail", purpose: "Items, customer, addresses, payment and timeline." },
      { name: "Inventory", purpose: "Availability, warehouses, reservations and adjustments." },
      { name: "Returns", purpose: "Approval, receipt, inspection, refund and restocking." },
      { name: "Commerce Analytics", purpose: "Revenue, conversion, average order and returns." },
    ],
    workflow: [
      "Publish Product",
      "Receive Order",
      "Approve Payment",
      "Fulfil",
      "Deliver",
      "Return",
    ],
    components: [
      "Product Form",
      "RecordView",
      "Status Badges",
      "Order Timeline",
      "Charts",
      "Dialogs",
    ],
    agentPrompt:
      "Build an order detail page with customer, shipping address, line items, payment state, fulfilment timeline and refund action. Require confirmation for destructive financial actions.",
    faq: [
      {
        question: "Does VuiAdmin include a storefront?",
        answer:
          "The admin edition focuses on back-office operations. A customer storefront, checkout and payment processing remain separate application concerns.",
      },
      {
        question: "Can the order table handle large catalogues?",
        answer:
          "The record patterns support server-side pagination, filtering and sorting through your data adapter. The backend must implement those queries efficiently.",
      },
      {
        question: "Can I connect Shopify or another commerce API?",
        answer:
          "Yes. Implement an adapter for the provider and map its order, product and customer states into the theme's record patterns.",
      },
    ],
  },
  {
    slug: "ai-products",
    name: "AI Products",
    eyebrow: "For AI Product Teams",
    title: "Build the Control Plane for an AI Product",
    seoTitle: "AI Admin Dashboard for Agents, Models and Usage",
    seoDescription:
      "Build AI product interfaces for agents, prompts, models, knowledge, runs, approvals, evaluations and usage costs.",
    lead: "Make model behaviour, tool execution, knowledge sources, costs and human approvals understandable to operators.",
    audience: "AI startups, internal AI platform teams and agent-product developers.",
    directAnswer:
      "An AI product dashboard needs operational transparency: which model ran, which tools it called, what sources it used, how much it cost and where a human approved or corrected the result.",
    problems: [
      "A chat screen alone does not explain agent runs, failures or cost.",
      "Operators need to distinguish prompts, models, tools and knowledge versions.",
      "High-impact actions require visible human approval and an audit trail.",
    ],
    screens: [
      { name: "Agent Directory", purpose: "Ownership, status, model, tools and deployment." },
      { name: "Run Detail", purpose: "Steps, tool calls, sources, latency, tokens and errors." },
      { name: "Prompt Library", purpose: "Versions, environments, testing and rollback." },
      { name: "Knowledge Sources", purpose: "Documents, sync state, freshness and permissions." },
      { name: "Evaluations", purpose: "Datasets, graders, scores and regression history." },
      { name: "Usage and Cost", purpose: "Spend by model, agent, workspace and customer." },
    ],
    workflow: ["Configure Agent", "Connect Tools", "Add Knowledge", "Test", "Approve", "Monitor"],
    components: [
      "AI Chat",
      "Run Timeline",
      "Code Block",
      "Approval Dialog",
      "Data Table",
      "Cost Charts",
    ],
    agentPrompt:
      "Create an agent-run detail page showing the input, model, tool calls, cited sources, token usage, cost, latency, errors and human approval history.",
    faq: [
      {
        question: "Does VuiAdmin provide an AI model?",
        answer:
          "No. It provides interfaces for AI products and coding-agent guidance for building them. You select and integrate the model provider.",
      },
      {
        question: "Can I show streaming responses?",
        answer:
          "Yes. The AI chat patterns cover composition, message history, code and progressive response states. Your API supplies the stream.",
      },
      {
        question: "How are risky agent actions handled?",
        answer:
          "Use an explicit approval state, clear action description and audit entry before executing high-impact operations. Enforcement belongs in your backend.",
      },
    ],
  },
  {
    slug: "finance-operations",
    name: "Finance Operations",
    eyebrow: "For Finance Software Teams",
    title: "Make Financial Workflows Clear, Traceable and Reviewable",
    seoTitle: "Finance Admin Dashboard for Billing and Transactions",
    seoDescription:
      "Build finance operations screens for invoices, payments, transactions, approvals, reconciliation and reporting.",
    lead: "Give finance teams precise records, review states and audit context without hiding important actions behind decorative dashboards.",
    audience: "Fintech products, billing platforms, accounting tools and internal finance teams.",
    directAnswer:
      "Finance interfaces must make state, amount, counterparty and audit history unambiguous. Mutating actions should be permission-controlled, confirmed and safe to retry.",
    problems: [
      "Generic tables make financial status and exception handling difficult to scan.",
      "Approvals need separation of duties and visible decision history.",
      "Retries and duplicate submissions can create real financial consequences.",
    ],
    screens: [
      { name: "Invoice List", purpose: "Status, due date, amount, customer and collection state." },
      { name: "Invoice Builder", purpose: "Line items, taxes, discounts, totals and approval." },
      { name: "Transaction Detail", purpose: "Parties, ledger references, events and reversals." },
      { name: "Payment Exceptions", purpose: "Failures, disputes, retries and ownership." },
      { name: "Approval Queue", purpose: "Policy, evidence, reviewer and decision history." },
      { name: "Finance Analytics", purpose: "Revenue, cash flow, ageing and collection trends." },
    ],
    workflow: ["Draft", "Review", "Approve", "Issue", "Collect", "Reconcile"],
    components: [
      "Currency Fields",
      "Invoice Lines",
      "RecordView",
      "Status Field",
      "Alert Dialog",
      "Charts",
    ],
    agentPrompt:
      "Build an invoice approval page with customer, line items, taxes, total, supporting files, approval history and Approve and Reject actions. Require a rejection reason and confirmation.",
    faq: [
      {
        question: "Does VuiAdmin process payments?",
        answer:
          "No. Payment processing must use a qualified provider. VuiAdmin supplies the interface patterns around payment and transaction states.",
      },
      {
        question: "Can financial actions be permission-controlled?",
        answer:
          "Yes at the interface level, but the API must independently enforce every permission. Hiding a button is not authorization.",
      },
      {
        question: "Are invoice pages printable?",
        answer:
          "The product includes invoice and single-record patterns. Verify your final implementation's print stylesheet against the jurisdictions and documents you support.",
      },
    ],
  },
  {
    slug: "logistics-operations",
    name: "Logistics Operations",
    eyebrow: "For Logistics Platforms",
    title: "Coordinate Shipments, Routes and Exceptions in Real Time",
    seoTitle: "Logistics Admin Dashboard for Shipments and Fleets",
    seoDescription:
      "Build logistics operations software for shipments, routes, drivers, vehicles, tracking, exceptions and proof of delivery.",
    lead: "Combine location, status, ownership and operational exceptions without turning the dashboard into an unreadable control room.",
    audience: "Delivery platforms, freight operators, fleet products and supply-chain teams.",
    directAnswer:
      "A logistics dashboard should prioritize exceptions: delayed shipments, route risk, capacity constraints and failed delivery attempts. Maps support decisions but should not replace searchable records.",
    problems: [
      "Maps become decorative when shipment status and ownership are not connected to them.",
      "Operators need fast filters for delays, routes, hubs and assigned drivers.",
      "Delivery evidence and exception notes must remain attached to the shipment history.",
    ],
    screens: [
      { name: "Shipment Board", purpose: "Stage, route, promised time, risk and ownership." },
      { name: "Live Operations Map", purpose: "Vehicles, stops, incidents and selected records." },
      { name: "Shipment Detail", purpose: "Parties, packages, events, documents and proof." },
      { name: "Route Planning", purpose: "Stops, capacity, time windows and assignments." },
      { name: "Fleet", purpose: "Vehicles, drivers, availability and maintenance." },
      { name: "Exception Queue", purpose: "Delay, damage, address and delivery failures." },
    ],
    workflow: [
      "Create Shipment",
      "Plan Route",
      "Dispatch",
      "Track",
      "Resolve Exception",
      "Deliver",
    ],
    components: ["Maps", "RecordView", "Status Badges", "Timeline", "Filters", "File Upload"],
    agentPrompt:
      "Build a shipment detail page with sender, recipient, packages, live status, route map, tracking timeline, exceptions and proof-of-delivery files.",
    faq: [
      {
        question: "Which mapping libraries are supported?",
        answer:
          "The edition can integrate map renderers through an application component. Choose the provider based on licensing, data, geocoding and deployment requirements.",
      },
      {
        question: "Can the theme display real-time tracking?",
        answer:
          "Yes, when connected to your event or location stream. The theme provides display patterns; your backend controls update frequency and data integrity.",
      },
      {
        question: "Does the template include route optimization?",
        answer:
          "No. Route optimization is business logic supplied by your service or provider. The interface can display and edit its proposed route.",
      },
    ],
  },
  {
    slug: "customer-support",
    name: "Customer Support",
    eyebrow: "For Support Platforms",
    title: "Give Support Teams Context Before They Reply",
    seoTitle: "Customer Support Admin Dashboard and Ticket UI",
    seoDescription:
      "Build customer-support software with ticket queues, conversations, customer context, SLAs, knowledge and team reporting.",
    lead: "Unify the queue, conversation, customer history and operational controls agents need to resolve work accurately.",
    audience: "Help-desk products, customer-success teams and service operations platforms.",
    directAnswer:
      "A support interface should reduce context switching. The ticket, customer history, SLA, assignment, related incidents and reply tools belong in one coherent workspace.",
    problems: [
      "Agents lose time switching between tickets, billing records and customer profiles.",
      "Queues become unmanageable without ownership, priority and SLA filters.",
      "Reply interfaces need drafts, attachments, internal notes and failure recovery.",
    ],
    screens: [
      { name: "Ticket Queue", purpose: "Priority, SLA, assignment, channel and status." },
      {
        name: "Conversation Workspace",
        purpose: "Thread, composer, customer and ticket controls.",
      },
      { name: "Customer Context", purpose: "Account, plan, prior tickets and product activity." },
      { name: "Knowledge Base", purpose: "Articles, categories, freshness and publishing state." },
      { name: "SLA Policies", purpose: "Targets, calendars, escalation and exceptions." },
      { name: "Support Analytics", purpose: "Volume, response, resolution and satisfaction." },
    ],
    workflow: ["Receive", "Classify", "Assign", "Investigate", "Reply", "Resolve"],
    components: [
      "Data Table",
      "Conversation",
      "Composer",
      "Drawer",
      "Status Field",
      "Activity Timeline",
    ],
    agentPrompt:
      "Build a ticket workspace with conversation history, reply composer, internal notes, attachments, customer context, assignment, priority, SLA and resolution actions.",
    faq: [
      {
        question: "Can I connect email and chat channels?",
        answer:
          "Yes. Normalize provider messages in your backend and render them through the shared conversation model so channel differences do not fragment the interface.",
      },
      {
        question: "Does VuiAdmin calculate SLA deadlines?",
        answer:
          "No. Your service calculates policy deadlines and escalation states. The interface displays those results clearly.",
      },
      {
        question: "Can agents add custom ticket fields?",
        answer:
          "Yes. The same semantic field-selection rules used by record forms can map custom text, choice, date, user and relationship fields to approved components.",
      },
    ],
  },
  {
    slug: "internal-tools",
    name: "Internal Tools",
    eyebrow: "For Operations and Platform Teams",
    title: "Standardize the Internal Tools Your Company Keeps Rebuilding",
    seoTitle: "Internal Tool UI Kit for Admin Panels and Operations",
    seoDescription:
      "Build consistent internal tools with record lists, forms, approvals, permissions, audit history and operational dashboards.",
    lead: "Give teams a repeatable interface grammar for the custom workflows that do not fit an off-the-shelf product.",
    audience: "Platform teams, operations engineers, enterprise developers and software agencies.",
    directAnswer:
      "Internal tools vary by workflow but repeat the same interface needs: records, forms, filters, approvals, roles, audit trails and reliable feedback states. A shared design system prevents each tool becoming a separate product to maintain.",
    problems: [
      "Every internal tool starts with a different table, form and navigation pattern.",
      "Permission and destructive-action states are treated as late implementation details.",
      "Agents duplicate components when the project has no machine-readable component vocabulary.",
    ],
    screens: [
      { name: "Operations Dashboard", purpose: "Workload, exceptions, ownership and targets." },
      { name: "Record Workspace", purpose: "Search, filters, bulk actions and editing." },
      { name: "Approval Queue", purpose: "Evidence, policy, reviewer and decision." },
      { name: "Role Management", purpose: "Users, teams, roles and permission matrix." },
      { name: "Audit History", purpose: "Actor, action, change, reason and time." },
      { name: "Integration Settings", purpose: "Connections, credentials, webhooks and health." },
    ],
    workflow: ["Find Record", "Review Context", "Take Action", "Confirm", "Audit", "Report"],
    components: [
      "RecordView",
      "Form",
      "Command Palette",
      "Alert Dialog",
      "Audit Timeline",
      "Settings",
    ],
    agentPrompt:
      "Build an internal approval queue with filters, saved views, assignees, evidence preview, approve and reject actions, comments and a complete audit history.",
    faq: [
      {
        question: "Can VuiAdmin work with an existing API?",
        answer:
          "Yes. Create typed adapters around the existing endpoints and keep API-specific data transformations outside the visual components.",
      },
      {
        question: "Is the design system limited to one business domain?",
        answer:
          "No. Its page patterns are based on interface intent: list, detail, form, dashboard, settings and workflow, so teams can apply them to new domains.",
      },
      {
        question: "How does an agent know which component to use?",
        answer:
          "The component registry records each family, import path and supported role, while page-pattern examples show how those components are composed.",
      },
    ],
  },
] as const;

export const marketBySlug = (slug: string): TargetMarket | undefined =>
  TARGET_MARKETS.find((market) => market.slug === slug);
