import Link from "next/link";

import { AVAILABLE, labelOf } from "@/src/configurator-core";
import { STYLE_PAGES } from "@/src/data/styles";
import { THEMES } from "@/src/data/themes";

import { FONT } from "./type";

/**
 * The mega-footer: grouped columns of links, then a legal row, as the reference ends. Theirs is a
 * tool catalogue; this is ours, and **three of the groups are read from the data the store already
 * renders**, so a new theme, CSS system or framework appears here without an edit:
 * frameworks from `AVAILABLE`, CSS systems from `STYLE_PAGES`, themes from `THEMES`.
 *
 * **Only routes that exist are linked.** Every static href below has a `page.tsx` under
 * `app/(site)`, and the five legal slugs are the keys of `LEGAL_PAGES`. `/docs` is the exported documentation in `public/docs`. There is no changelog route,
 * so there is no changelog link; a dead link in a footer is seen on every page. All framework
 * entries go to `/themes` because the catalogue is where framework is filtered, and there is no
 * per-framework page.
 *
 * Type is the reference's: 12px at 20px line height for links, 10px at 15px for the legal line,
 * links in the ink colour turning to the primary on hover.
 */
const FRAMEWORKS = [...new Set(AVAILABLE.map((row) => row.framework))].map((id) => ({
  label: labelOf(id),
  href: "/themes",
}));

const GROUPS: readonly { title: string; links: readonly { label: string; href: string }[] }[] = [
  { title: "Frameworks", links: FRAMEWORKS },
  {
    title: "CSS Systems",
    links: STYLE_PAGES.map((style) => ({ label: style.label, href: `/styles/${style.id}` })),
  },
  {
    title: "Themes",
    links: THEMES.map((theme) => ({ label: theme.label, href: `/themes/${theme.id}` })),
  },
  {
    title: "Product",
    links: [
      { label: "Free", href: "/themes" },
      { label: "Pro", href: "/pricing" },
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Platform", href: "/platform" },
      { label: "Compare", href: "/compare" },
      { label: "Waitlist", href: "/waitlist" },
    ],
  },
  {
    title: "Build With Voilet",
    links: [
      { label: "Applications", href: "/applications" },
      { label: "Dashboards", href: "/dashboards" },
      { label: "Layouts", href: "/layouts" },
      { label: "Pages", href: "/pages" },
      { label: "Blocks", href: "/blocks" },
      { label: "Components", href: "/components" },
      { label: "Designs", href: "/designs" },
      { label: "Explore", href: "/explore" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Guides", href: "/guides" },
      { label: "Solutions", href: "/solutions" },
      { label: "Support", href: "/support" },
      { label: "Agent Support", href: "/agent-support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Licence", href: "/licence" },
      { label: "Refund Policy", href: "/refunds" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      data-chrome="footer"
      className="mt-[var(--tn-space-3xl)] border-t border-[var(--store-neutral-40)]"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-[var(--tn-space-sm)] px-[var(--tn-space-sm)] pt-[var(--tn-space-xl)] md:grid-cols-4 lg:grid-cols-7">
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2
              className={`${FONT} text-[length:var(--store-body-2)] font-semibold leading-[1.5] text-[var(--store-neutral-100)]`}
            >
              {group.title}
            </h2>
            <ul className="mt-[var(--tn-space-2xs)]">
              {group.links.map((link) => (
                <li key={link.label} className="whitespace-nowrap">
                  <Link
                    href={link.href}
                    className={`${FONT} mt-[var(--tn-space-2xs)] inline-block text-[length:var(--store-body-3)] font-normal leading-5 text-[var(--store-neutral-100)] transition-colors duration-150 hover:text-[var(--store-primary-40)]`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p
        className={`${FONT} px-[var(--tn-space-sm)] pb-[var(--tn-space-xs)] pt-[30px] text-center text-[length:var(--store-body-4)] font-medium leading-[15px] text-[var(--store-neutral-70)]`}
      >
        Voilet &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </footer>
  );
}
