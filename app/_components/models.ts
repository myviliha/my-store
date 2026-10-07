/**
 * The model and agent catalogue behind the composer's selector (`SD-221`).
 *
 * **This is mock data and nothing here is wired to anything**, by the dev's decision: "right now, we
 * are developing UI/UX, so keep mock data, later on, we will implement the functionality". It is in
 * its own file for that reason, so the day there is an API the change is this file and not the
 * component that draws it.
 *
 * **It is not an inventory of what Voilet can do**, and it must not be read back as one: no row here
 * is checked against a capability, a price or a licence, and `check:inventory` does not see it.
 * Before any of this reaches a page a buyer pays from, the list becomes a feed and the costs become
 * real numbers.
 *
 * `cost` is in credits, `locked` means a paid tier the account does not have, `badge` is the pill
 * the reference draws beside a name.
 */

export interface ModelRow {
  readonly id: string;
  /** Two or three letters for the tile, since we ship no third-party marks. */
  readonly mono: string;
  readonly name: string;
  readonly note?: string;
  readonly cost?: number;
  readonly locked?: boolean;
  readonly badge?: "New";
}

export interface ModelGroup {
  readonly id: string;
  readonly title: string;
  /** How many to show before the group needs a "See all". */
  readonly fold?: number;
  readonly rows: readonly ModelRow[];
}

/** The two rows the reference puts above every group, with ours in place of theirs. */
export const TOP_ROWS: readonly ModelRow[] = [
  { id: "web", mono: "W", name: "Web search", note: "Search the web for information" },
  { id: "voilet", mono: "V", name: "Voilet", note: "Free, multilingual, for text and image" },
];

export const MODEL_GROUPS: readonly ModelGroup[] = [
  {
    id: "agents",
    title: "Agents",
    fold: 4,
    rows: [
      { id: "a-theme", mono: "Th", name: "Theme agent", note: "Builds the tokens, the shell and the eleven themes", badge: "New", cost: 4 },
      { id: "a-screen", mono: "Sc", name: "Screen agent", note: "Turns your entities into lists, records and forms", badge: "New", cost: 6 },
      { id: "a-data", mono: "Da", name: "Data agent", note: "Shapes the fields, the filters and the exports", cost: 3 },
      { id: "a-copy", mono: "Co", name: "Copy agent", note: "Writes the labels, the empty states and the help", cost: 2 },
      { id: "a-brand", mono: "Br", name: "Brand agent", note: "Reads a logo and proposes a palette and a type scale", cost: 5, locked: true },
      { id: "a-audit", mono: "Au", name: "Audit agent", note: "Checks the output against the design rules", cost: 3, locked: true },
    ],
  },
  {
    id: "text",
    title: "Text",
    fold: 4,
    rows: [
      { id: "t-opus47", mono: "An", name: "Anthropic Claude Opus 4.7", note: "Natural, high-quality writing output", cost: 10, locked: true, badge: "New" },
      { id: "t-gpt55", mono: "Op", name: "OpenAI GPT 5.5", note: "Human-like writing with premium tone", cost: 6, locked: true, badge: "New" },
      { id: "t-gemini31", mono: "Go", name: "Google Gemini 3.1 Pro", note: "Smart, detailed reasoning and clear answers", cost: 3, locked: true, badge: "New" },
      { id: "t-opus55", mono: "An", name: "Anthropic Claude Opus 5.5", note: "Human-like writing with premium tone", cost: 3, locked: true, badge: "New" },
      { id: "t-sonnet55", mono: "An", name: "Anthropic Claude Sonnet 5.5", note: "Natural, high-quality writing output", cost: 2, locked: true, badge: "New" },
      { id: "t-gpt41", mono: "Op", name: "OpenAI GPT 4.1", note: "Reliable, consistent output for work and study", cost: 2, locked: true },
      { id: "t-qwen3", mono: "Al", name: "Alibaba Qwen 3", note: "Balanced, high-quality writing and reasoning", cost: 2, locked: true },
      { id: "t-deepseek", mono: "De", name: "Deepseek 3.2", note: "Clear, structured writing and explanations", cost: 1, locked: true },
    ],
  },
  {
    id: "image",
    title: "Image",
    fold: 3,
    rows: [
      { id: "i-gpt25low", mono: "Op", name: "GPT Image 2.5 Low", note: "Fast drafts for layout and placement", cost: 20, locked: true, badge: "New" },
      { id: "i-gpt25med", mono: "Op", name: "GPT Image 2.5 Medium", note: "Sharp, photorealistic high-quality images", cost: 70, locked: true, badge: "New" },
      { id: "i-nano2", mono: "Go", name: "Google Nano Banana 2", note: "Sharp, photorealistic high-quality images", cost: 24, locked: true, badge: "New" },
      { id: "i-kling3", mono: "Kl", name: "Kling 3.0 Image", note: "Photo-realistic scenes with natural lighting", cost: 1, locked: true },
    ],
  },
  {
    id: "video",
    title: "Video",
    fold: 2,
    rows: [
      { id: "v-seedance", mono: "Se", name: "Seedance 2.5", note: "Premium video up to 30 seconds with native audio", cost: 40, locked: true, badge: "New" },
      { id: "v-minimax", mono: "Mi", name: "MiniMax H3", note: "Cinematic multi-shot video with synced audio", cost: 40, locked: true, badge: "New" },
    ],
  },
];

/** Every row, flattened, for the search. */
export const ALL_ROWS: readonly ModelRow[] = [
  ...TOP_ROWS,
  ...MODEL_GROUPS.flatMap((g) => g.rows),
];
