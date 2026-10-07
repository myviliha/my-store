import type { Metadata } from "next";
import Link from "next/link";
import { ERROR_PAGES } from "@/src/data/content";
import { EDITIONS } from "@/src/data/products";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "./_components/type";

export const metadata: Metadata = {
  title: ERROR_PAGES.notFound.title,
  robots: { index: false, follow: true },
};

/**
 * `/404` (`ST-015`), driven by `not-found.tsx` (`SD-038`).
 *
 * A dead end is the failure here, so this offers three ways out: the two the copy names, and the
 * editions themselves, derived from the catalogue rather than a hand-picked list of "popular"
 * products that would go stale the first time one shipped.
 */
export default function NotFound() {
  const { code, title, lead, primary, secondary } = ERROR_PAGES.notFound;

  return (
    <div className="page py-24 text-center">
      {/* The supplied artwork, the same file the admin editions draw (`PD-1105`). Plain `<img>`:
          the store exports statically and this is one 2KB file above the fold. */}
      {/* biome-ignore lint/performance/noImgElement: see above */}
      <img
        src="/images/error/404.svg"
        alt=""
        width={240}
        height={240}
        className="mx-auto mb-8 block h-auto w-full max-w-[240px]"
      />
      <p className="text-sm font-semibold text-primary-hover">{code}</p>
      <h1 className="mx-auto mt-3 max-w-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-lead text-lg text-muted">{lead}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={primary.href}
          className={BUTTON_PRIMARY}
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className={BUTTON_SECONDARY}
        >
          {secondary.label}
        </Link>
      </div>

      <div className="mx-auto mt-16 max-w-lead">
        <h2 className="text-sm font-semibold text-muted">Or Go Straight to an Edition</h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {EDITIONS.map((edition) => (
            <li key={edition.slug}>
              <Link
                href={`/products/${edition.slug}`}
                className={`${BUTTON_SECONDARY} rounded-full font-medium`}
              >
                {edition.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
