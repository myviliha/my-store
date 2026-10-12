import { labelOf } from "@/src/configurator-core";
import { livePreviewUrl } from "@/src/data/live-preview";
import { THEMES } from "@/src/data/themes";

import { type includedPages, type Recipe, swatchOf, useCaseOf } from "./recipe";

/**
 * **The running admin's address** for a recipe and the pages it ships: the Preview drawer and the
 * preview's own tab (`/preview`) both load it. DEMO-ONLY(live-preview): it points at the stand-in
 * admin (`livePreviewUrl`); when there is a build, that function returns the build's address.
 *
 * The admin's "Theme details" page is drawn from `details` (2026-10-12, by request): what was chosen,
 * as label and value rows, so a generated build can render the same list.
 */
export const previewUrlFor = (recipe: Recipe, pages: ReturnType<typeof includedPages>): string => {
  const theme = THEMES.find((t) => t.id === recipe.design);
  const swatch = theme ? swatchOf(theme) : "";
  return livePreviewUrl({
    theme: theme?.label ?? "Admin",
    primary: swatch.startsWith("#") ? swatch : "",
    stack: `${labelOf(recipe.framework ?? "")} + ${labelOf(recipe.css ?? "")}`,
    pages: pages.map((p) => ({ slug: p.slug, title: p.title, src: p.src })),
    details: [
      { label: "Theme", value: theme?.label ?? "" },
      { label: "Admin", value: `${useCaseOf(recipe.useCase)?.label ?? ""} admin` },
      { label: "Framework", value: labelOf(recipe.framework ?? "") },
      { label: "CSS", value: labelOf(recipe.css ?? "") },
      { label: "Plan", value: recipe.tier === "pro" ? "Pro" : "Free" },
      { label: "Pages", value: pages.map((p) => p.title).join(", ") },
      { label: "Primary colour", value: swatch.startsWith("#") ? swatch.toUpperCase() : "Theme default" },
      { label: "Format", value: "ZIP + setup guide" },
    ],
  });
};
