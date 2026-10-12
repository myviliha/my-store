import type { Metadata } from "next";

import { PreviewScreen } from "../_components/preview-screen";

/**
 * `/preview?design=…`: a design's live preview in its own tab (2026-10-12, by request), opened by the
 * Preview drawer's expand. It is one reader's configuration, not content, so it is never indexed
 * (SEO.md: a page earns its place; this one has nothing to say to a search engine).
 */
export const metadata: Metadata = {
  title: "Live preview",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return <PreviewScreen />;
}
