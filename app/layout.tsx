import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  Jost,
  Plus_Jakarta_Sans,
  Podkova,
} from "next/font/google";

import "./globals.css";

import { SITE } from "@/lib/site";
import { organizationSchema, webSiteSchema } from "@/src/data/seo";
import { Aurora } from "./_components/aurora";
import { Footer } from "./_components/footer";
import { Rail } from "./_components/rail";
import { ScatterGlow } from "./_components/scatter-glow";
import { AuthModal } from "./_components/auth-modal";
import { TopBar } from "./_components/topbar";

/**
 * **Plus Jakarta Sans for headlines and Inter for body** (`SD-163`), self-hosted.
 *
 * The brand guideline names both, and both are loaded here because **a family name in CSS does
 * nothing unless something loads the face, and the failure is silent**: `globals.css` can say
 * `var(--font-jakarta)` all it likes and the browser will simply fall through to the next stack
 * entry. This repository has paid for that three times, most recently `PD-1046`, where a theme's
 * single most identifying property quietly did not apply.
 *
 * Outfit is gone. It was the store's own choice under `SD-003` and predates the guideline.
 *
 * `next/font/google` downloads at build and serves from our own origin, so there is no runtime
 * request to Google and no third party in the critical path. `SD-038` says `next/font/local`; the
 * difference is where the file comes from rather than where it is served from, and there is no
 * binary in this repository to point `local` at. Both faces are OFL, so nothing here is a licence
 * question. Swap to `local` the day we vendor the woff2.
 *
 * `display: "swap"` with `adjustFontFallback` on (the default) means text paints immediately and the
 * fallback is metric-matched, so switching does not shift the layout.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/*
 * **The footer's legal row is Jost, which is a third face for one line** (`SD-200`).
 *
 * Loaded rather than substituted because the brief was the design exactly, and loaded the same way
 * as the other two so it costs no third-party request. If it earns its weight is a question for the
 * designer: one row of two links and a copyright is a thin return on a font download.
 */
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

/*
 * **Four more faces the Hi-Fi screens ask for** (`SD-202`).
 *
 * The Design System page declares **two** families. The screens use **ten**, nineteen distinct
 * weights between them, and two of the ten are documentation furniture rather than product: the
 * foundation frames set their own page titles in Sora and their descriptions in Libre Caslon Text.
 * That leaves these four plus the three above, and SF Pro, which is Apple's system face and falls
 * through the stack rather than being downloaded.
 *
 * Loaded because the brief was the design exactly. **Whether a storefront should carry seven
 * families is a question for the designer**, and it is a real one: each is a download on the
 * critical path, and Podkova earns its place with four uses across every screen extracted. Each
 * arrives through `next/font/google`, which fetches at build and serves from our own origin, so the
 * cost is bytes rather than a third-party request.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});
const podkova = Podkova({ variable: "--font-podkova", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "Developer tools",
  alternates: { canonical: "/" },
  /* `app/` holds no `icon.*` or `favicon.ico`, so Next links nothing and the browser asks for
     `/favicon.ico` and gets a 404 while `public/favicon.svg` sits unused. Named explicitly. */
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    /* Declaring `summary_large_image` with no image is a blank card on X and in Slack, which is
       worse than no card at all. Resolved against `metadataBase`. */
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE.name} · ${SITE.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/** `themeColor` belongs to the viewport export in the App Router, not to `metadata`. */
export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /**
   * The `Organization` and `WebSite` JSON-LD the Astro layout emitted, restored here.
   *
   * It was lost in `ST-001` and review caught it. Built from `src/data/seo.ts` rather than written
   * inline, so the legal name and the origin have one source each.
   */
  const schema = [organizationSchema(SITE.url), webSiteSchema(SITE.url)];

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${jost.variable} ${geist.variable} ${geistMono.variable} ${instrument.variable} ${podkova.variable}`}
    >
      {/*
       * **The shell is here because there is no second layout any more** (`SD-215`). It used to sit
       * in `app/(site)/layout.tsx`, with a note that `/login` rendered without it; that group and
       * every route in it is gone, so the rail, the bar and the footer are the page's chrome rather
       * than one group's.
       *
       * `--website-bg-color` is `#f9fafe`, not white. The bar sits on it with no rule, and the
       * rail's own `#f2f5fd` reads as a band against it rather than against a white page.
       */}
      <body className="tn flex min-h-screen bg-[var(--store-page-ground)]">
        <Rail />
        {/* `min-w-0` so a wide child, the footer's seven columns, scrolls inside the column rather
            than pushing the rail's neighbour past the viewport.

            **The site's background lives here** (2026-10-09): `Aurora`'s three glows at the top and
            `ScatterGlow`'s evenly spaced ones down to the footer, on every page. `relative isolate`
            so their `-z-10` sits behind the bar, the page and the footer, none of which has a ground
            of its own, so the colour shows through all three. */}
        <div className="relative isolate flex min-w-0 flex-1 flex-col">
          <Aurora />
          <ScatterGlow />
          <TopBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {/* Sign in from the rail, Sign up from the top bar (`auth-store.ts`). */}
        <AuthModal />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has no other injection point, and this is `JSON.stringify` of objects we built, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  );
}
