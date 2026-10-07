import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * `robots.txt`, and the two sitemap pointers that make both sitemaps findable (`SD-100`).
 *
 * **Two `Sitemap:` lines, not a sitemap index.** The documentation is a separate Next export mounted
 * at `/docs`, so it writes its own `/docs/sitemap.xml` and neither build has to know the other's
 * routes. Multiple `Sitemap:` lines are what the protocol is for; an index file would be a third
 * thing to keep in sync with two files that already generate themselves.
 *
 * **`/login/` is disallowed, and that is not the same as noindex.** `Disallow` stops the fetch, which
 * also stops a crawler ever seeing a `noindex` on the page, so a disallowed URL linked from elsewhere
 * can still be listed. The page carries `robots: { index: false }` in its own metadata for that
 * reason (`app/login/page.tsx`); this line is the crawl-budget half, that one is the indexing half.
 * The trailing slash matches the exported path, because `trailingSlash` is on.
 *
 * Nothing else is excluded. There is no account area yet and no search-results route, so a longer
 * `disallow` list would be cargo cult. It grows when one exists.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/login/"] },
    sitemap: [`${SITE.url}/sitemap.xml`, `${SITE.url}/docs/sitemap.xml`],
  };
}
