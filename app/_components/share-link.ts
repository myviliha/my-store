import { THEMES } from "@/src/data/themes";

import { type Recipe, useCaseOf } from "./recipe";

/**
 * **A shared design opens in the store, in the Preview drawer** (2026-10-12, by request), not as the
 * bare running admin: the link is the home page with the configuration in `?design=`, and the home
 * page opens a conversation with the drawer beside it (`Conversation`, `panel-store.ts`), so whoever
 * receives it lands in the product, can keep talking, and can make it their own.
 *
 * The configuration travels in the link, as the recipe in base64url JSON. That is the demo's way:
 * when designs are stored by the backend, the link carries the saved design's id instead, and
 * `readShared` fetches it; nothing that opens the drawer changes.
 */
const PARAM = "design";

const toBase64Url = (text: string) =>
  btoa(unescape(encodeURIComponent(text))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (code: string) =>
  decodeURIComponent(escape(atob(code.replace(/-/g, "+").replace(/_/g, "/"))));

/** The link to share a design: the home page, which opens it in the Preview drawer. */
export function shareUrlFor(recipe: Recipe): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/?${PARAM}=${toBase64Url(JSON.stringify(recipe))}`;
}

/** The design in this page's address, if it holds one that still makes sense; `null` otherwise. */
export function readShared(): Recipe | null {
  if (typeof window === "undefined") return null;
  const code = new URLSearchParams(window.location.search).get(PARAM);
  if (!code) return null;
  try {
    const recipe = JSON.parse(fromBase64Url(code)) as Recipe;
    /* A link from an older catalogue may name a design or an admin that is gone: ignore it. */
    if (!recipe || typeof recipe !== "object") return null;
    if (!THEMES.some((t) => t.id === recipe.design) || !useCaseOf(recipe.useCase)) return null;
    return recipe;
  } catch {
    return null;
  }
}

/** Takes the design out of the address once it is open, so a reload does not open it again. */
export function clearShared() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
