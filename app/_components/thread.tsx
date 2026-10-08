"use client";

import { Check, Copy, Edit, Reload } from "@/app/_vendor/icons";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Composer, Glyph } from "./composer";
import type { CardRect } from "./conversation";
import { Explore } from "./explore";
import type { MasonryCard } from "./masonry";
import { Preview } from "./preview";
import { ThemePreview } from "./theme-preview";
import { nextStep, parse, promptFor, type Recipe, type Step } from "./recipe";
import { type Answer, DownloadCard, StepCard } from "./recipe-ui";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FONT } from "./type";

/**
 * The conversation, once the reader has sent something (`SD-216`): **a guided recipe**, not a chat
 * with an assistant (2026-10-07, after `Viliha-Chat-First-UI-UX-Requirements`).
 *
 * The brief is plain that the core flow must work "without an AI agent: authored messages, keyword
 * matching, selectable options and validation", and must not "imply unlimited natural-language
 * understanding". So every reply here comes from `recipe.ts`: a message is read for keywords, the
 * recipe takes what it found, and the next reply asks for the one thing still missing, with the
 * options to answer it inside the message (`recipe-ui.tsx`). Typing and clicking are the same
 * action: a click is echoed as the reader's own message, exactly as if they had typed it.
 *
 * **Replies appear at once.** The previous thread revealed a canned answer a word at a time; the
 * brief rules that out ("Avoid simulated thinking, artificial typing delays"), and a guided step has
 * nothing to think about.
 *
 * **The preview opens beside the conversation** (§ 6) with a divider the reader can drag or move
 * with the arrow keys; below `lg` the two become Chat / Preview tabs, and both keep their state.
 *
 * The bubble measurements are the reference's own chat DOM (`.chat-user-bubble`, `.chat-history-list`)
 * and are unchanged from the first thread: the reader's bubble is a pale brand tint at 16px.
 */

type Turn =
  | {
      readonly id: number;
      readonly from: "reader";
      readonly text: string;
      /** The recipe just before this message, so editing it can rewind to that point. */
      readonly before: Recipe;
    }
  | {
      readonly id: number;
      readonly from: "voilet";
      readonly text: string;
      /** The question this message asks, with the recipe as it was when asked. */
      readonly step?: Step;
      readonly asked?: Recipe;
      /** The recipe after the reader answered, so the card keeps showing what they chose. */
      readonly answered?: Recipe;
      /** A package to confirm before download. */
      readonly download?: Recipe;
    };

/* ─── The actions under a message ─────────────────────────────────────────────────────────── */

/**
 * The actions under a message (`SD-217`), **one component for both sides of the conversation**.
 *
 * It was one component until the guided-recipe rewrite (`b5fdb7f`) dropped the system reply's row
 * and left the reader's written out inline; restored 2026-10-08 so both rows share one button, one
 * size and one hover, and a change to either is made once.
 *
 * **No card.** The glyphs sit on the page in grey under the message they belong to, ChatGPT's way,
 * which the dev chose over the first reference's floating white surface. **Both rows are always
 * shown** (2026-10-08, by request), not revealed on hover or focus.
 *
 * **Copy and Edit do their jobs. The two votes do not leave the browser**, and that is the honest
 * state rather than a toast thanking nobody for their feedback. They toggle, so a reader can see
 * the click registered, and the moment there is somewhere to send a vote this is the one place
 * that changes.
 *
 * **Try again re-asks the newest question, fresh** (restored 2026-10-08). Replies come from the
 * guided recipe, so it cannot word an answer differently; what it does is redraw the question's card
 * from the recipe as it stands, which clears anything half-chosen (a framework picked but not
 * continued) and keeps every answer already given. Only the newest reply has it: retrying an older
 * one would discard every turn after it, and a button that quietly deletes four messages is worse
 * than no button.
 */
interface Action {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
  /** Drawn as held down. The votes use it; copy uses its own tick instead. */
  readonly active?: boolean;
  /** Shown but not usable, with the reason as its tooltip (Edit while a reply is on its way). */
  readonly disabled?: string;
}

const ACTION_BUTTON =
  "flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-[var(--store-neutral-80)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] hover:text-[var(--store-neutral-100)]";

function Actions({
  items,
  align,
}: {
  items: readonly Action[];
  align: "start" | "end";
}) {
  return (
    <div
      className={`flex items-center gap-[4px] ${align === "end" ? "justify-end" : "justify-start"}`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          aria-pressed={item.active}
          onClick={item.onClick}
          disabled={Boolean(item.disabled)}
          title={item.disabled}
          className={`${ACTION_BUTTON} disabled:cursor-not-allowed disabled:opacity-40 ${item.active ? "text-[var(--store-primary-40)]" : ""}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

/** Copies, and says so for a moment. The tick is the whole confirmation; a toast for a copy is noise. */
function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);
  return {
    copied,
    copy: () => {
      void navigator.clipboard?.writeText(text).then(() => setCopied(true));
    },
  };
}

/** Copy, with its tick while the copy is fresh. Both rows lead with it. */
function useCopyAction(text: string): Action {
  const { copied, copy } = useCopy(text);
  return {
    label: copied ? "Copied" : "Copy",
    icon: copied ? (
      <Check width={16} height={16} />
    ) : (
      <Copy width={16} height={16} />
    ),
    onClick: copy,
  };
}

/**
 * **Radix ships no thumb**, and neither does the reference page, so these two are drawn here and
 * nowhere else; swap them for the real pair the moment there is one (`SD-217`). Every other glyph on
 * these rows is `@viliha/vui-react/icons`, which is where an icon belongs.
 */
function Thumb({ down = false }: { down?: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${down ? "rotate-180 scale-x-[-1]" : ""}`}
    >
      <path d="M7 21V10l4.5-7a2 2 0 0 1 2 2.6L12.5 9h5.3a2.2 2.2 0 0 1 2.1 2.7l-1.8 7A2.2 2.2 0 0 1 16 20.4H7z" />
      <path d="M7 10H4.8A1.8 1.8 0 0 0 3 11.8v7.4A1.8 1.8 0 0 0 4.8 21H7" />
    </svg>
  );
}

/** Under a system reply: copy its words, rate it, and on the newest one, try again. */
function ReplyActions({ text, onRetry }: { text: string; onRetry?: () => void }) {
  const copy = useCopyAction(text);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  return (
    <Actions
      align="start"
      items={[
        copy,
        {
          label: "Good answer",
          icon: <Thumb />,
          active: vote === "up",
          onClick: () => setVote((v) => (v === "up" ? null : "up")),
        },
        {
          label: "Bad answer",
          icon: <Thumb down />,
          active: vote === "down",
          onClick: () => setVote((v) => (v === "down" ? null : "down")),
        },
        ...(onRetry
          ? [{ label: "Try again", icon: <Reload width={16} height={16} />, onClick: onRetry }]
          : []),
      ]}
    />
  );
}

/**
 * A message the reader sent, **editable where it stands** (2026-10-08). Edit used to copy the text
 * down into the composer, which left the original in place and the reader unsure which one counted.
 * Now the bubble becomes a text box with Cancel and Send: Enter sends, Shift+Enter breaks the line,
 * Escape cancels, and focus returns to the Edit button on the way out. Send is disabled while the
 * text is empty or unchanged, because neither is an edit. What Send does to the conversation is
 * `editAt` in `Thread`.
 */
function ReaderBubble({
  text,
  spaced,
  delay,
  onEdit,
  locked = false,
}: {
  text: string;
  /** Every message but the first opens a new turn and wants air above it. */
  spaced: boolean;
  /** How long it waits before rising, in ms; the first waits for the card to start moving away. */
  delay: number;
  /** The edited text, sent. */
  onEdit: (text: string) => void;
  /** A reply is on its way: editing now would rewind under it, so Edit waits. */
  locked?: boolean;
}) {
  const copy = useCopyAction(text);
  const [editing, setEditing] = useState(false);
  const fieldId = useId();
  const [value, setValue] = useState(text);
  const field = useRef<HTMLTextAreaElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const changed = value.trim() !== "" && value.trim() !== text.trim();

  /* Into the box with the caret at the end, as if the reader had clicked after the last word. */
  useEffect(() => {
    if (!editing) return;
    const el = field.current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const close = () => {
    setEditing(false);
    setValue(text);
    /* Back to Edit, so a keyboard reader is where they started rather than at the top of the page. */
    requestAnimationFrame(() =>
      row.current?.querySelector<HTMLButtonElement>('button[aria-label="Edit"]')?.focus(),
    );
  };
  const submit = () => {
    if (!changed) return;
    setEditing(false);
    onEdit(value.trim());
  };

  return (
    <div
      ref={row}
      className={`tn-message-in flex flex-col items-end gap-[4px] ${spaced ? "mt-[var(--tn-space-2xs)]" : ""}`}
      style={{ ["--delay" as string]: `${delay}ms` }}
    >
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex w-full max-w-[80%] flex-col gap-[8px] rounded-[20px] border border-[var(--store-primary-40)] bg-white p-[12px] shadow-[0_0_0_3px_var(--store-primary-10)]"
        >
          <label htmlFor={fieldId} className="sr-only">
            Edit your message
          </label>
          <textarea
            id={fieldId}
            ref={field}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              /* An input method's Enter commits its word; it does not send (see `Composer`). */
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            className={`${FONT} max-h-[240px] min-h-[52px] w-full resize-none bg-transparent px-[8px] py-[4px] text-[length:var(--store-body-2)] leading-[1.6] text-[var(--store-neutral-100)] outline-none [field-sizing:content]`}
          />
          <div className="flex justify-end gap-[8px]">
            <button type="button" onClick={close} className={BUTTON_SECONDARY}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!changed}
              className={`${BUTTON_PRIMARY} disabled:cursor-not-allowed disabled:bg-[var(--store-primary-30)]`}
            >
              Send
            </button>
          </div>
        </form>
      ) : (
        <div
          className={`${FONT} w-fit max-w-[80%] whitespace-pre-line rounded-[20px] bg-[var(--store-primary-10)] px-[20px] py-[12px] text-[length:var(--store-body-2)] font-normal leading-[1.6] text-[var(--store-neutral-100)]`}
        >
          {text}
        </div>
      )}
      {editing ? null : (
        <Actions
          align="end"
          items={[
            copy,
            {
              label: "Edit",
              icon: <Edit width={16} height={16} />,
              onClick: () => setEditing(true),
              disabled: locked ? "Wait for the reply to finish" : undefined,
            },
          ]}
        />
      )}
    </div>
  );
}

/**
 * **The loading state**: where the next reply will appear, while it is on its way.
 *
 * Three dots in the reply's own card, so the reply replaces it in place rather than arriving
 * somewhere else. `role="status"` with "Voilet is replying" for a screen reader; the dots are
 * decorative and stand still under reduced motion (`.tn-typing` in `globals.css`). No percentage and
 * no invented steps: it says a reply is coming and nothing it cannot back.
 */
function Replying() {
  return (
    <div
      role="status"
      className="tn-message-in mt-[var(--tn-space-2xs)] flex w-fit items-center gap-[5px] rounded-[16px] border border-[var(--store-card-border)] bg-white/75 px-[16px] py-[14px] backdrop-blur-sm"
    >
      <span className="sr-only">Voilet is replying</span>
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          aria-hidden="true"
          className="tn-typing size-[7px] rounded-full bg-[var(--store-primary-40)]"
          style={{ ["--d" as string]: `${d * 160}ms` }}
        />
      ))}
    </div>
  );
}

/* ─── Timing and layout ──────────────────────────────────────────────────────────────────────── */

function prefersReduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The card's slide from the home position to the dock: the rail's own decelerating curve. */
const DOCK_MS = 560;
const DOCK_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
/** The first message waits this long, so it rises behind the card rather than ahead of it. */
const FIRST_MESSAGE_DELAY = 160;
/*
 * ┌─ DEMO-ONLY(loading-delay) ─────────────────────────────────────────────────────────────────────┐
 * │ REMOVE WHEN REPLIES COME FROM A REAL API. Find every piece with:                               │
 * │   grep -rn "DEMO-ONLY(loading-delay)" app                                                      │
 * └────────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * **Why it exists.** There is no API behind the chat yet: every reply is authored by `recipe.ts` and
 * is ready at once, so the loading state (`Replying`, `pending`, the busy composer) could never be
 * seen or tested. This lets a developer or a reviewer see it on demand: **a message containing the
 * word "delay"** gets its reply after `DEMO_DELAY_MS`, with the loader showing meanwhile. "delay" on
 * its own re-asks the current question; "CRM admin delay" works as "CRM admin". **Every other reply,
 * and every click, is instant**, as `REQUIREMENTS.md` and the chat brief (§ 10: "Avoid simulated
 * thinking, artificial typing delays") expect.
 *
 * The same message also **streams** its reply in, a word at a time (`demoChunks`), so streaming
 * can be seen too; every other reply appears whole, because its text is complete the moment it is
 * written and revealing it slowly would be the simulated typing the brief rules out.
 *
 * **What to remove, and what to keep.** Remove `DEMO_DELAY_MS`, `DEMO_DELAY_WORD`,
 * `asksForDemoDelay`, `withoutDemoDelay`, `DEMO_WORD_MS`, `demoChunks` and the `delayed` arguments
 * marked below. **Keep** `later()`, `stream()`, `streaming`, `pending`, `busy` and `Replying`: they
 * are the real loading and streaming states. With an API, `later()` awaits the call while
 * `Replying` shows, then hands the response's text stream to `stream()` in place of `demoChunks`.
 */
const DEMO_DELAY_MS = 500;
const DEMO_DELAY_WORD = /\bdelay\b/gi;
/** DEMO-ONLY(loading-delay): did the reader ask to see the loading state? */
const asksForDemoDelay = (text: string): boolean => new RegExp(DEMO_DELAY_WORD.source, "i").test(text);
/** DEMO-ONLY(loading-delay): the message without the trigger word, so it is not read as a request. */
const withoutDemoDelay = (text: string): string =>
  text.replace(DEMO_DELAY_WORD, " ").replace(/\s+/g, " ").trim();
/** DEMO-ONLY(loading-delay): how fast the demo stream adds a word. */
const DEMO_WORD_MS = 35;
/**
 * DEMO-ONLY(loading-delay): a stand-in for an API's text stream, a word at a time. The reply's text
 * is already complete here, so this is the simulated typing the brief rules out and it only runs
 * for a "delay" message. A real stream (a `fetch` body read through a `TextDecoder`, or an SDK's
 * async iterator) has the same shape and goes where this is passed to `stream()`. Under reduced
 * motion it yields the whole text at once.
 */
async function* demoChunks(text: string): AsyncIterable<string> {
  if (prefersReduced()) {
    yield text;
    return;
  }
  for (const word of text.split(/(?<= )/)) {
    await new Promise((r) => setTimeout(r, DEMO_WORD_MS));
    yield word;
  }
}
/** The chat column's share of the split, and its limits, in percent. */
const SPLIT_DEFAULT = 46;
const SPLIT_MIN = 32;
const SPLIT_MAX = 68;

export function Thread({
  first,
  from = null,
  onBack,
}: {
  first: string;
  /** Where the home card was when Generate was pressed. The dock slides from here; `null` docks it
      in place, which is what reduced motion and a Back-then-return both get. */
  from?: CardRect | null;
  onBack: () => void;
}) {
  const ids = useRef(0);
  const nextId = () => ++ids.current;

  /** What the assistant says next for a recipe, optionally after one sentence of its own. */
  const ask = (recipe: Recipe, lead?: string): Turn => {
    const step = nextStep(recipe);
    return {
      id: nextId(),
      from: "voilet",
      text: [lead, promptFor(step, recipe)].filter(Boolean).join(" "),
      step,
      asked: recipe,
    };
  };

  /**
   * What a typed message changes. A message the keywords do not cover says so in one sentence and
   * goes back to the question (§ 5: "If the request is unclear, ask one focused question"); one that
   * asks for something unsupported says why and what is supported instead.
   */
  const read = (
    text: string,
    recipe: Recipe,
  ): { next: Recipe; lead?: string } => {
    /* DEMO-ONLY(loading-delay): the trigger word is not part of the request, and a message that was
       only the trigger changes nothing, so the reply is the current question again. */
    const request = withoutDemoDelay(text);
    if (request === "") return { next: recipe };
    const { patch, unsupported, understood } = parse(request);
    const next: Recipe = {
      ...recipe,
      ...patch,
      /* A new use case or plan changes which pages exist, so a hand-edited list starts over. */
      pages: patch.useCase || patch.tier ? undefined : recipe.pages,
    };
    if (unsupported) return { next, lead: unsupported };
    if (understood.length === 0) {
      return {
        next,
        lead: "I couldn't pick a choice out of that: I understand a kind of admin, a framework, a CSS framework, Free or Pro, and design names.",
      };
    }
    return { next };
  };

  /**
   * **Every turn is created by the event that caused it**, never derived in an effect from state the
   * effect also sets: the first thread learned that from StrictMode appending its answer twice.
   */
  /* DEMO-ONLY(loading-delay): whether the opening prompt asked to see the loading state. */
  const [firstDelayed] = useState(() => asksForDemoDelay(first));
  const [recipe, setRecipe] = useState<Recipe>(() => read(first, {}).next);
  const [turns, setTurns] = useState<Turn[]>(() => {
    const opening: Turn = { id: nextId(), from: "reader", text: first, before: {} };
    if (firstDelayed) return [opening];
    const { next, lead } = read(first, {});
    return [opening, ask(next, lead)];
  });
  /** A reply is on its way. Everything that would start another turn waits for it. */
  const [pending, setPending] = useState(firstDelayed);
  /**
   * The same flag as `pending`, but readable the instant it is set. Two clicks in one frame both
   * run before React re-renders, so both saw `pending` as false and a double click sent two turns;
   * the handlers guard on this instead. `pending` is still what the screen renders from.
   */
  const busy = useRef(firstDelayed);
  const timer = useRef<number | undefined>(undefined);
  /**
   * The reply being streamed, and how much of it has arrived. Its choice cards and actions wait
   * until it is complete, because a card under half a question offers answers to something not yet
   * asked. `null` when nothing is streaming.
   */
  const [streaming, setStreaming] = useState<{ id: number; text: string } | null>(null);
  /** Bumped to abandon a stream (unmount): a loop holding an older value stops adding text. */
  const run = useRef(0);
  /** Bumped on every change to the recipe, so a preview can tell it is out of date. */
  const [revision, setRevision] = useState(1);
  const [preview, setPreview] = useState<{
    recipe: Recipe;
    revision: number;
  } | null>(null);
  /**
   * What the space beside the conversation shows: the recipe's preview, the Explore Themes panel
   * (opened from the style step), or nothing. One at a time, in the same resizable split.
   */
  const [side, setSide] = useState<"preview" | "explore" | "theme" | null>(null);
  /** The card whose theme the "theme" panel previews, opened from Explore. */
  const [themeCard, setThemeCard] = useState<MasonryCard | null>(null);
  /** Below `lg` the chat and the side panel share the screen as tabs. */
  const [tab, setTab] = useState<"chat" | "side">("chat");
  const [split, setSplit] = useState(SPLIT_DEFAULT);
  const [draft, setDraftState] = useState("");
  /**
   * The draft, readable and clearable the instant it is sent (2026-10-08). `send` read `draft` from
   * state, and two submits in one moment (an input method's double Enter) both saw the old text
   * before React re-rendered, so the message and its reply went out twice. Reading and clearing this
   * ref first makes the second submit find nothing to send.
   */
  const draftRef = useRef("");
  const setDraft = (next: string) => {
    draftRef.current = next;
    setDraftState(next);
  };
  const foot = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLFormElement>(null);
  /** The scrolling list of messages, which is what `data-pointer` is set on. */
  const list = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const update = (next: Recipe) => {
    setRecipe(next);
    setRevision((r) => r + 1);
  };

  /**
   * **Every reply goes through here.** Today a reply is ready at once, so it is added immediately.
   * When replies come from an API, this is where the call is awaited: `pending` and `busy` go up,
   * `Replying` shows, and the reply replaces it when it lands. One timer/call at a time, so a reply
   * can never land twice, and every handler below refuses to start a turn while one is pending
   * (`if (busy.current) return`), which is the debounce: a double click is one turn.
   *
   * DEMO-ONLY(loading-delay): `delayed` stands in for that wait until the API exists; see
   * `DEMO_DELAY_MS`. Remove the argument and the timer with it.
   */
  const later = (make: () => Turn, delayed = false) => {
    if (!delayed) {
      const reply = make();
      setTurns((all) => [...all, reply]);
      return;
    }
    window.clearTimeout(timer.current);
    busy.current = true;
    setPending(true);
    timer.current = window.setTimeout(() => {
      const reply = make();
      void stream(reply, demoChunks(reply.text));
    }, DEMO_DELAY_MS);
  };

  /**
   * **Streams a reply in**: the reply is added at once, and its text fills in as `chunks` arrive,
   * with a cursor at the end; its cards and actions appear when the last chunk has. `pending` and
   * `busy` stay up until then, so the reader cannot start another turn mid-sentence, and the live
   * region announces the reply once, complete, rather than every word.
   *
   * This is not demo code: an API's text stream is passed here exactly as `demoChunks` is, and the
   * reply it builds (its `step` and cards) comes with the stream's final message. Only the source is
   * DEMO-ONLY today.
   */
  const stream = async (reply: Turn, chunks: AsyncIterable<string>) => {
    const mine = ++run.current;
    busy.current = true;
    setPending(true);
    setTurns((all) => [...all, reply]);
    setStreaming({ id: reply.id, text: "" });
    let text = "";
    for await (const chunk of chunks) {
      if (run.current !== mine) return;
      text += chunk;
      setStreaming({ id: reply.id, text });
    }
    if (run.current !== mine) return;
    setStreaming(null);
    busy.current = false;
    setPending(false);
  };

  /* DEMO-ONLY(loading-delay): the first reply, when the opening prompt asked for the delay. Without
     it the reply is already in the initial turns above. Cleared on unmount, so StrictMode's second
     mount schedules it once rather than twice. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, for the opening prompt
  useEffect(() => {
    if (!firstDelayed) return;
    const { next, lead } = read(first, {});
    later(() => ask(next, lead), true);
    return () => {
      window.clearTimeout(timer.current);
      run.current++;
    };
  }, []);

  /** One turn: the reader's words, the newest question marked answered, and the next question. */
  const turn = (
    echo: string,
    next: Recipe,
    lead?: string,
    /** DEMO-ONLY(loading-delay) */
    delayed = false,
  ) => {
    if (busy.current) return;
    update(next);
    setTurns((all) => {
      const marked = all.map((t, i) =>
        i === all.length - 1 && t.from === "voilet" && t.step
          ? { ...t, answered: next }
          : t,
      );
      return [...marked, { id: nextId(), from: "reader", text: echo, before: recipe }];
    });
    later(() => ask(next, lead), delayed);
  };

  const answer = ({ patch, echo }: Answer) =>
    turn(echo, { ...recipe, ...patch });

  const send = () => {
    const text = draftRef.current.trim();
    if (text === "" || busy.current) return;
    setDraft("");
    const { next, lead } = read(text, recipe);
    turn(text, next, lead, asksForDemoDelay(text)); // DEMO-ONLY(loading-delay): the last argument
  };

  /**
   * **Editing a sent message rewinds the conversation to it** (2026-10-08), ChatGPT's way: the edited
   * text replaces the message, every turn after it is dropped, and the recipe is rebuilt from the
   * one that stood just before the message (`before`), then read again with the new words. Keeping
   * the later turns would leave answers to a question that was never asked; keeping the later
   * recipe would mix old choices into the new request. An open preview turns Outdated, as it does
   * for any change.
   */
  const editAt = (index: number, text: string) => {
    const original = turns[index];
    if (busy.current || !original || original.from !== "reader") return;
    const { next, lead } = read(text, original.before);
    update(next);
    setTurns((all) => {
      const kept = all
        .slice(0, index)
        .map((t, i) =>
          i === index - 1 && t.from === "voilet" && t.step ? { ...t, answered: next } : t,
        );
      return [...kept, { id: nextId(), from: "reader", text, before: original.before }];
    });
    later(() => ask(next, lead), asksForDemoDelay(text)); // DEMO-ONLY(loading-delay): 2nd argument
  };

  const openPreview = () => {
    setPreview({ recipe, revision });
    setSide("preview");
    setTab("side");
  };

  /**
   * Re-asks the newest reply. A fresh id remounts its card, so local picks that were never sent
   * (the stack picker's radio, say) start over; the recipe and every earlier turn are untouched. A
   * download reply is redrawn from the recipe as it is now.
   */
  const retry = () => {
    const newest = turns[turns.length - 1];
    if (busy.current || !newest || newest.from !== "voilet") return;
    setTurns((all) => all.slice(0, -1));
    later(() => (newest.download ? { ...newest, id: nextId(), download: recipe } : ask(recipe)));
  };

  const download = () => {
    if (busy.current) return;
    setTurns((all) => [...all, { id: nextId(), from: "reader", text: "Download", before: recipe }]);
    later(() => ({
      id: nextId(),
      from: "voilet",
      text: "Here's the package. Check it before you download:",
      download: recipe,
    }));
    setTab("chat");
  };

  /**
   * **The card slides down from where the reader left it** (a FLIP: first, last, invert, play).
   * Before the first paint: measure the dock, put the card back at the home card's rectangle with a
   * transform and an explicit size, then let all three transition to the dock. Width and height
   * animate as lengths, so the text in the card is never stretched.
   */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const el = dock.current;
    if (!from || !el || prefersReduced()) return;
    const to = el.getBoundingClientRect();
    const s = el.style;
    s.transition = "none";
    s.alignSelf = "center";
    s.width = `${from.width}px`;
    s.height = `${from.height}px`;
    const at = el.getBoundingClientRect();
    s.transform = `translate(${from.left - at.left}px, ${from.top - at.top}px)`;
    void el.offsetHeight;
    const frame = requestAnimationFrame(() => {
      s.transition = ["transform", "width", "height"]
        .map((p) => `${p} ${DOCK_MS}ms ${DOCK_EASE}`)
        .join(", ");
      s.transform = "translate(0px, 0px)";
      s.width = `${to.width}px`;
      s.height = `${to.height}px`;
    });
    const done = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== "transform") return;
      s.transition = s.transform = s.width = s.height = s.alignSelf = "";
      el.removeEventListener("transitionend", done);
    };
    el.addEventListener("transitionend", done);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("transitionend", done);
      s.transition = s.transform = s.width = s.height = s.alignSelf = "";
    };
  }, [from]);

  /* Focus lands in the thread's own prompt box, not on Back: Back drew a focus ring on every send,
     because the reader had just pressed Enter and the browser took the move as keyboard focus. */
  useEffect(() => {
    dock.current?.querySelector("textarea")?.focus({ preventScroll: true });
  }, []);

  /* The thread owns the window while it is open (`SD-218`); the cleanup gives it back. */
  useEffect(() => {
    document.documentElement.dataset.thread = "open";
    return () => {
      delete document.documentElement.dataset.thread;
    };
  }, []);

  /* Once per turn, and again when the loading bubble appears: the newest thing scrolls into view. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: a turn, not a render
  useEffect(() => {
    foot.current?.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "end",
    });
  }, [turns.length, pending]);

  /**
   * **No hover until the pointer moves** (2026-10-08). New content lands under a pointer that has
   * not moved, often one the system has hidden because the reader was typing, and its option lit up
   * as hovered. So every time content arrives the list is marked `data-pointer="idle"`, and the
   * `hover:` variant (redefined in `globals.css`) ignores anything inside it until a real move or a
   * press clears the mark. Only movement counts: Chrome also fires `pointermove` with no movement
   * when content shifts under a still pointer. Clicks are never blocked; only the hover look waits.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-marked when content arrives
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    el.dataset.pointer = "idle";
    const live = (e: PointerEvent) => {
      if (e.type === "pointermove" && e.movementX === 0 && e.movementY === 0) return;
      delete el.dataset.pointer;
    };
    el.addEventListener("pointermove", live);
    el.addEventListener("pointerdown", live);
    return () => {
      el.removeEventListener("pointermove", live);
      el.removeEventListener("pointerdown", live);
    };
  }, [turns.length, pending, streaming === null]);

  /**
   * **Opening or closing a side panel keeps the latest message in view** (2026-10-08). The chat's
   * column changes width (and on a phone, visibility), its text reflows, and a reader who was at
   * the latest message would otherwise find themselves somewhere above it. Pinned before paint, so
   * the jump is never seen. Someone reading further up is left where they were.
   */
  const atBottom = useRef(true);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const track = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    };
    track();
    el.addEventListener("scroll", track, { passive: true });
    return () => el.removeEventListener("scroll", track);
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-pinned when the layout changes
  useLayoutEffect(() => {
    const el = list.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [side, tab]);

  /* While a reply streams, the view follows its last line down; `auto`, because a smooth scroll
     restarted on every word never arrives. When it completes, `pending` drops and the effect above
     brings its cards into view. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: follows the stream's length
  useEffect(() => {
    if (streaming) foot.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [streaming?.text.length]);

  /* ── The divider: drag it, or focus it and use the arrow keys. ── */
  const drag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = body.current?.getBoundingClientRect();
    if (!box) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const pct = ((ev.clientX - box.left) / box.width) * 100;
      setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const nudge = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const by = e.key === "ArrowLeft" ? -2 : e.key === "ArrowRight" ? 2 : 0;
    if (!by) return;
    e.preventDefault();
    setSplit((s) => Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, s + by)));
  };

  const last = turns.length - 1;
  const latest = turns[last];
  /* Announced once, when complete: a streaming reply is not read out word by word. */
  const announce = latest?.from === "voilet" && !streaming ? latest.text : "";
  const split2 = side !== null;
  const openExplore = () => {
    setSide("explore");
    setTab("side");
  };
  const closeSide = () => {
    setSide(null);
    setTab("chat");
  };
  const previewTheme = (card: MasonryCard) => {
    setThemeCard(card);
    setSide("theme");
    setTab("side");
  };
  /**
   * "Use this theme": the theme becomes the recipe's design, as the reader's answer (brief § 4:
   * applied "only after the user chooses Use this theme"). The panel closes so the reply is seen;
   * a theme the plan does not allow is asked about by the design step, never switched silently.
   */
  const applyTheme = (theme: MasonryCard["theme"]) => {
    closeSide();
    turn(`Use the ${theme.label} theme`, { ...recipe, design: theme.id });
  };

  const chat = (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col ${split2 && tab === "side" ? "max-lg:hidden" : ""}`}
    >
      <div ref={list} className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-[780px] flex-col">
          {turns.map((t, i) =>
            t.from === "reader" ? (
              <ReaderBubble
                key={t.id}
                text={t.text}
                spaced={i > 0}
                delay={i === 0 && from ? FIRST_MESSAGE_DELAY : 0}
                onEdit={(text) => editAt(i, text)}
                locked={pending}
              />
            ) : (
              /* The card, then its actions under it, outside the border: the same row the reader's
                 messages carry, on the left because the message is. They rise together, in the
                 place `Replying` held, so no reply needs an entrance delay of its own. */
              <div
                key={t.id}
                className="tn-message-in mt-[var(--tn-space-2xs)] flex max-w-[680px] flex-col gap-[4px]"
              >
                <div className="flex flex-col gap-[12px] rounded-[16px] border border-[var(--store-card-border)] bg-white/75 p-[16px] backdrop-blur-sm">
                  {/* 14px at 1.6, the same as the reader's bubble and its edit box (2026-10-08, by
                      request): both sides of the conversation read at one size. The brief suggests
                      16px (§ 10); 14px was chosen over it. */}
                  <p
                    className={`${FONT} text-[length:var(--store-body-2)] font-normal leading-[1.6] text-[var(--store-neutral-100)]`}
                  >
                    {streaming?.id === t.id ? (
                      <>
                        {streaming.text}
                        <span
                          aria-hidden="true"
                          className="tn-caret ml-[1px] inline-block h-[1.1em] w-[2px] translate-y-[3px] rounded-full bg-[var(--tn-accent-violet-solid)]"
                        />
                      </>
                    ) : (
                      t.text
                    )}
                  </p>
                  {streaming?.id === t.id ? null : t.step && t.asked ? (
                    <StepCard
                      step={t.step}
                      /* The live question always shows the live recipe, so a page ticked in the summary
                         stays ticked; an answered one shows the recipe it was answered with. */
                      asked={i === last ? recipe : t.asked}
                      answered={i === last ? undefined : t.answered}
                      live={i === last}
                      onAnswer={answer}
                      onEdit={(next, echo) =>
                        echo ? turn(echo, next) : update(next)
                      }
                      onPreview={openPreview}
                      onExplore={openExplore}
                      onDownload={download}
                    />
                  ) : null}
                  {t.download && streaming?.id !== t.id ? <DownloadCard recipe={t.download} /> : null}
                </div>
                {streaming?.id === t.id ? null : (
                  <ReplyActions text={t.text} onRetry={i === last ? retry : undefined} />
                )}
              </div>
            ),
          )}
          {pending && !streaming ? <Replying /> : null}
          <div ref={foot} className="h-[8px] shrink-0" />
        </div>
      </div>
      <Composer
        formRef={dock}
        value={draft}
        onChange={setDraft}
        onSubmit={send}
        /* While a reply is pending the card says Voilet is working and will not send: one turn at a
           time, so nothing the reader types can land between a question and its answer. */
        busy={pending}
        placeholder="Describe your admin or type a keyword…"
        className="mx-auto mt-[var(--tn-space-md)] w-full max-w-[780px] shrink-0"
      />
    </div>
  );

  /* **The underscores in the `calc` are load-bearing**: `100dvh-var(--x)` without spaces is one
     token and the declaration is dropped. Tailwind turns `_` into a space. */
  return (
    <section
      className={`mx-auto flex h-[calc(100dvh_-_var(--tn-h-topbar))] w-full flex-col px-[var(--tn-space-sm)] pt-[var(--tn-space-sm)] pb-[var(--tn-space-sm)] ${split2 ? "max-w-none" : "max-w-[900px]"}`}
    >
      <div className="mb-[var(--tn-space-2xs)] flex shrink-0 items-center justify-between gap-[12px]">
        <button
          type="button"
          onClick={onBack}
          className={`${FONT} flex cursor-pointer items-center gap-[6px] text-[length:var(--store-body-2)] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 hover:text-[var(--store-primary-40)]`}
        >
          <Glyph size={20}>
            <path d="M14 6l-6 6 6 6" />
          </Glyph>
          Back
        </button>
        {split2 ? (
          <div
            role="tablist"
            aria-label="View"
            className="flex gap-[4px] rounded-full bg-[var(--store-neutral-30)] p-[3px] lg:hidden"
          >
            {(["chat", "side"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={tab === v}
                onClick={() => setTab(v)}
                className={`${FONT} cursor-pointer rounded-full px-[14px] py-[5px] text-[length:var(--store-body-3)] font-semibold ${tab === v ? "bg-white text-[var(--store-primary-40)] shadow-[0_1px_3px_#0c0c0c1a]" : "text-[var(--store-neutral-80)]"}`}
              >
                {v === "chat" ? "Chat" : side === "preview" ? "Preview" : "Themes"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Each new reply, once, for a screen reader. */}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      <div ref={body} className="flex min-h-0 flex-1 gap-0">
        {/* **The chat's column is always this same element**, side panel or not (2026-10-08). It
            used to be the bare chat with no panel and this wrapper with one, two different places in
            the tree, so opening Explore or Preview threw the chat away and mounted a new one whose
            scroll started at the top. Only its classes change now.
            Below `lg` the chat and the side panel are tabs: the whole column goes when the side
            panel's tab is chosen, or its 46% split width stayed behind empty and squeezed the panel
            into half a phone. */}
        <div
          className={`flex min-h-0 min-w-0 ${split2 ? `max-lg:flex-1 ${tab === "side" ? "max-lg:hidden" : ""}` : "flex-1"}`}
          style={split2 ? { flexBasis: `${split}%` } : undefined}
        >
          {chat}
        </div>
        {split2 ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat and side panel"
              aria-valuemin={SPLIT_MIN}
              aria-valuemax={SPLIT_MAX}
              aria-valuenow={Math.round(split)}
              tabIndex={0}
              onPointerDown={drag}
              onKeyDown={nudge}
              className="group mx-[6px] hidden w-[12px] shrink-0 cursor-col-resize touch-none items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--store-primary-40)] lg:flex"
            >
              <span className="h-[48px] w-[4px] rounded-full bg-[var(--store-neutral-50)] transition-colors group-hover:bg-[var(--store-primary-40)]" />
            </div>
            {/* Slides in when it opens (`.tn-panel-in`); `key` replays it when the panel changes. */}
            <div
              key={side}
              className={`tn-panel-in min-h-0 min-w-0 flex-1 ${tab === "chat" ? "max-lg:hidden" : ""}`}
            >
              {side === "explore" ? (
                <Explore onClose={closeSide} onPreview={previewTheme} />
              ) : side === "theme" && themeCard ? (
                <ThemePreview
                  card={themeCard}
                  onBack={() => setSide("explore")}
                  onClose={closeSide}
                  onApply={applyTheme}
                />
              ) : preview ? (
                <Preview
                  recipe={preview.recipe}
                  revision={preview.revision}
                  outdated={preview.revision !== revision}
                  onRefresh={() => setPreview({ recipe, revision })}
                  onClose={closeSide}
                  onDownload={download}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
