// Relative rather than `@/`, to match `catalogue.ts`, which `apps/e2e` does reach. Nothing imports
// this module from outside the app today; keeping one convention across `src/data` is cheaper than
// remembering which half is portable.
import { SITE } from "../../lib/site";
import { BRAND } from "./catalogue";
import type { Product } from "./products";

/**
 * Structured data, built as plain objects (section 46).
 *
 * **Only types we can fill honestly.** There is no `AggregateRating` and no `Review` anywhere in
 * this file, because we have no reviews, and Google's own guidance plus rule 7 of §122 both say
 * the same thing about inventing them. There is no `Offer` with a price either: our products are
 * sold through subscription tiers, so a per-product price would be fiction (decision M4).
 *
 * `SoftwareApplication` rather than `Product` for the editions: they are software you install,
 * which is what the type means, and `Product` invites the price and rating fields we cannot fill.
 */

/**
 * `SITE` used to be declared here as well as in `lib/site.ts`, which is two lists of the same facts
 * and the defect this file's own comments warn about. There is one now, it reads the environment,
 * and this module imports it.
 */
export { SITE };

type Json = Record<string, unknown>;

export const organizationSchema = (origin: string): Json => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  url: origin,
  logo: new URL("/logo.svg", origin).toString(),
  brand: { "@type": "Brand", name: BRAND },
});

/**
 * No `potentialAction`. It advertised a sitelinks search box at `/search`, and the page list retires
 * that route, so the schema was inviting Google to send people to a 404 on our own domain. It was
 * correct under Astro, when `/search` existed, and carrying it over unchecked is how it survived.
 */
export const webSiteSchema = (origin: string): Json => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND,
  url: origin,
  description: SITE.description,
});

export const collectionSchema = (
  collection: {
    name: string;
    description: string;
    path: string;
    items: readonly { name: string; path: string; description?: string }[];
  },
  origin: string,
): Json => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: collection.name,
  description: collection.description,
  url: new URL(collection.path, origin).toString(),
  mainEntity: {
    "@type": "ItemList",
    itemListElement: collection.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(item.path, origin).toString(),
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  },
});

export interface Crumb {
  label: string;
  href: string;
}

export const breadcrumbSchema = (crumbs: Crumb[], origin: string): Json => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.label,
    item: new URL(c.href, origin).toString(),
  })),
});

export const productSchema = (product: Product, origin: string): Json => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: product.name,
  description: product.shortDescription,
  url: new URL(`/products/${product.slug}`, origin).toString(),
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  author: { "@type": "Organization", name: SITE.legalName },
  ...(product.version ? { softwareVersion: product.version } : {}),
  ...(product.frameworks.length ? { keywords: product.tags.join(", ") } : {}),
});

export const articleSchema = (
  article: {
    title: string;
    description: string;
    datePublished: Date;
    dateModified?: Date;
    path: string;
    author: string;
  },
  origin: string,
): Json => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  datePublished: article.datePublished.toISOString(),
  dateModified: (article.dateModified ?? article.datePublished).toISOString(),
  author: { "@type": "Organization", name: article.author },
  publisher: { "@type": "Organization", name: SITE.legalName },
  mainEntityOfPage: new URL(article.path, origin).toString(),
  isAccessibleForFree: true,
});

/**
 * FAQ schema, for pages that genuinely are a list of questions.
 *
 * Google restricted rich results for FAQ markup to authoritative sites, so this is here for the
 * answer engines section 43 is actually about rather than for a star rating in a search result.
 */
export const faqSchema = (items: readonly { question: string; answer: string }[]): Json => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});
