import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ASSETS, KIND_COLLECTION } from "@/src/data/assets";
import { SKUS } from "@/src/data/catalogue";
import { COMPARISONS } from "@/src/data/comparisons";
import { LEGAL_PAGES } from "@/src/data/content";
import { GUIDES } from "@/src/data/guides";
import { TARGET_MARKETS } from "@/src/data/markets";
import { STYLE_PAGES } from "@/src/data/styles";

/**
 * The sitemap, derived from the same data the pages are (`SD-028`).
 *
 * The Astro store had one and it went with that app; nothing replaced it, so for a day this store
 * published twenty-two routes and told search engines about none of them. Deriving it means a
 * seventh SKU or a sixth legal page joins the sitemap without anyone remembering to.
 *
 * `priority` is deliberately sparse. Google ignores it, and a page-by-page ranking maintained by
 * hand is a file that goes stale to no effect.
 */

/** The routes that are not generated from a list. */
const STATIC_ROUTES = [
  "",
  /* The marketing front door since `SD-160`, when `/` became the workspace. It carries the eleven
     promotional sections that used to sit under the homepage fold, so it is the page that answers
     "what is this product" for a search engine. */
  "/platform",
  "/products",
  "/pricing",
  "/components",
  "/blocks",
  // `/download` was missing here while `STORE_PAGES` listed it, so `seo.spec.ts`'s "the sitemap
  // lists every page" assertion was red and nobody had run it. Added 2026-08-22.
  "/download",
  "/waitlist",
  "/support",
  "/about",
  "/solutions",
  "/compare",
  "/guides",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE.url}${path}/`.replace(/\/+$/, "/");

  return [
    ...STATIC_ROUTES.map((path) => ({ url: url(path), changeFrequency: "weekly" as const })),
    ...SKUS.map((sku) => ({
      url: url(`/products/${sku.slug}`),
      changeFrequency: "weekly" as const,
    })),
    ...TARGET_MARKETS.map((market) => ({
      url: url(`/solutions/${market.slug}`),
      changeFrequency: "monthly" as const,
    })),
    ...COMPARISONS.map((comparison) => ({
      url: url(`/compare/${comparison.slug}`),
      changeFrequency: "monthly" as const,
    })),
    /* The CSS vocabulary pages (`SD-115`). Derived from the same list the product matrix renders,
       so a fourth CSS system is one entry in `STYLE_PAGES` rather than three edits. */
    /* The catalogue (`SD-122`). Derived from the same assets the pages render, so a screen added to
       the application appears in the sitemap once its capture is committed. Account, cart and
       checkout are deliberately absent: § 4 keeps utility pages out of search and out of here. */
    ...(
      ["/explore", "/pages", "/dashboards", "/applications", "/layouts", "/agent-support"] as const
    ).map((path) => ({ url: url(path), changeFrequency: "weekly" as const })),
    ...ASSETS.map((asset) => ({
      url: url(`${KIND_COLLECTION[asset.kind]}/${asset.slug}`),
      changeFrequency: "monthly" as const,
    })),
    ...STYLE_PAGES.map((style) => ({
      url: url(`/styles/${style.id}`),
      changeFrequency: "monthly" as const,
    })),
    ...GUIDES.map((guide) => ({
      url: url(`/guides/${guide.slug}`),
      changeFrequency: "monthly" as const,
    })),
    // Legal pages change rarely and are not what anyone searches for, but a page absent from the
    // sitemap while present in the footer is the inconsistency crawlers report.
    ...Object.keys(LEGAL_PAGES).map((slug) => ({
      url: url(`/${slug}`),
      changeFrequency: "yearly" as const,
    })),
  ];
}
