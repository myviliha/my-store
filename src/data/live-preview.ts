/*
 * ┌─ DEMO-ONLY(live-preview) ────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE `livePreviewUrl` WITH THE GENERATED BUILD'S ADDRESS, AND DELETE public/live-preview/.     │
 * │   grep -rn "DEMO-ONLY(live-preview)" app src public                                              │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 * **Where "Show Preview" runs the generated admin** (2026-10-12, by request). Where the source comes
 * from is not decided yet, so the flow reads one address from here: today a stand-in admin in
 * `public/live-preview/` that draws the chosen pages' captures in a clickable shell, with the recipe
 * in the hash. When the build exists, this returns its URL and nothing else changes.
 */
export interface LivePreviewInput {
  readonly theme: string;
  /** The theme's primary colour, a hex, or empty for the default. */
  readonly primary: string;
  /** "React + Tailwind CSS", shown in the shell's foot. */
  readonly stack: string;
  readonly pages: readonly { readonly slug: string; readonly title: string; readonly src: string }[];
}

export const livePreviewUrl = (input: LivePreviewInput): string =>
  `/live-preview/index.html#${encodeURIComponent(JSON.stringify(input))}`;
