"use client";

import { Check, Copy, Edit, Reload } from "../_vendor/icons";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Composer, Glyph } from "./composer";
import { FONT } from "./type";

/**
 * The conversation, once the reader has sent something (`SD-216`).
 *
 * **Every measurement here is read from the reference's own chat DOM**, which the dev pasted rather
 * than described: `.chat-history-list` is a column at `gap: 40px`, a reader row is `row-reverse` with
 * `padding-top: 20px` and `margin-top: -20px` so its entrance is not clipped, `.chat-user-bubble` is
 * `width: fit-content` on `#f9fafb` at `line-height: 21px`, and `.chat-result-row` is **14px at 400**
 * with its paragraphs 12px apart. Nothing in this file is a convention: 16px body copy is what it
 * was before the paste, and it was a whole step wrong.
 *
 * Their `#f9fafb` is not in our palette. `--store-neutral-30` is `#f8f8f8`, CIE76 **0.89** away,
 * which is under the threshold at which two greys read as two greys; the next nearest, `-20`, is 1.25.
 *
 * **The reply is written here, not fetched.** There is no assistant behind this yet, and the honest
 * way to say so is in a comment rather than with a spinner that never resolves: `reply()` answers
 * from what the storefront already claims, which is the six frameworks, the three CSS systems and
 * the eleven themes. When a real one arrives it replaces that one function and nothing else moves.
 *
 * **It reveals a word at a time, and that is the whole interaction.** A reply that appears whole is a
 * page; a reply that arrives is a conversation, which is the thing the dev asked for. 18ms a word
 * reads as writing rather than as a machine printing, and `prefers-reduced-motion` skips to the end
 * rather than slowing down, because a reader who asked for less motion wants the text.
 */

export interface Message {
  readonly from: "reader" | "voilet";
  readonly text: string;
}

/**
 * What Voilet answers, from what the storefront already states.
 *
 * The shape is the reference's: a sentence, a list of what it makes, a line about the editor, then a
 * question. The content is **not** theirs. Their list promises research, video and image generation;
 * ours lists what a buyer actually receives, because a line here that over-claims is a refund after
 * payment rather than a sale (`PROJECT.md` on scope).
 *
 * A line beginning `- ` is a list item, and `**` marks its lead. That is the whole format, because
 * the reveal below counts words in one string and a richer structure would have to be re-joined to
 * be counted.
 *
 * **Each item leads with an emoji, as the reference's does** (`SD-217`). It is the one way to put
 * colour and expression in a reply without shipping eight illustrations or asking an icon set for
 * marks it does not have: the system's emoji font draws them, they need no asset, no licence and no
 * dark-mode variant, and they survive being copied out of the page as text.
 */
export function reply(prompt: string): string {
  const wantsFree = prompt.trim().toLowerCase().includes("free");
  return [
    "Hello. I am **Voilet**, and I generate the admin your business needs as editable frontend source.",
    "- 🎨 **Design system** — colour, type, spacing and the eleven themes, as tokens you can change",
    "- 🖥️ **Screens** — the lists, records, forms and dashboards your entities actually need",
    "- 🧭 **Shell** — the navigation, header and layout the screens sit inside",
    "- 🧩 **Six frameworks** — React, Next.js, Vue, Angular, Laravel and plain HTML",
    "- 💅 **Three CSS systems** — Tailwind, Bootstrap and Bulma, from one set of tokens",
    wantsFree
      ? "The free tier is the Voilet theme on Tailwind, in all six frameworks, without the paid screens."
      : "Every download is a zip you own and connect to your own backend. Frontend only, which is worth knowing before you pay rather than after.",
    "**What should we build?**",
  ].join("\n");
}

/**
 * `**bold**` within a line.
 *
 * **A dangling `**` is dropped rather than printed.** The reveal below adds a word at a time and
 * `**Design system**` is two words, so for one tick the text holds an opening pair with no closing
 * one; without this the reader watches literal asterisks appear and disappear on every bold lead in
 * the answer.
 */
function Rich({ text }: { text: string }) {
  const opens = text.split("**").length - 1;
  const at = text.lastIndexOf("**");
  const safe = opens % 2 === 0 ? text : text.slice(0, at) + text.slice(at + 2);
  return (
    <>
      {safe.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments of one immutable string
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments of one immutable string
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * The actions under a message (`SD-217`).
 *
 * **No card.** This followed the first reference, which floats them on a white rounded surface; the
 * dev put ChatGPT's beside it and asked for that one instead, and it is plainly better: the glyphs
 * sit on the page in grey, under the message they belong to, and nothing is drawn that is not a
 * control. One surface fewer on a screen whose whole job is reading.
 *
 * **Voilet's are always visible, the reader's appear on hover or focus.** Also ChatGPT's, and the
 * reason is asymmetry of use: an answer is the thing a reader copies or rates, their own message is
 * the thing they occasionally fix. `@media (hover: none)` shows both, since there is no hover there.
 *
 * **Copy, edit and retry do their jobs. The two votes do not leave the browser**, and that is the
 * honest state rather than a toast thanking nobody for their feedback. They toggle, so a reader can
 * see the click registered, and the moment there is somewhere to send a vote this is the one handler
 * that changes.
 */
interface Action {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
  /** Drawn as held down. The votes use it; copy uses its own tick instead. */
  readonly active?: boolean;
}

const ACTION_BUTTON =
  "flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-[var(--store-neutral-80)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] hover:text-[var(--store-neutral-100)]";

function Actions({
  items,
  align,
  always = false,
}: {
  items: Action[];
  align: "start" | "end";
  always?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[4px] ${align === "end" ? "justify-end" : "justify-start"} ${
        always
          ? ""
          : "opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      }`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          aria-pressed={item.active}
          onClick={item.onClick}
          className={`${ACTION_BUTTON} ${item.active ? "text-[var(--store-primary-40)]" : ""}`}
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

/**
 * **Radix ships no thumb**, and neither does the reference page, so these two are drawn here and
 * nowhere else; swap them for the real pair the moment there is one (`SD-217`). Every other glyph on
 * this row is `@viliha/vui-react/icons`, which is where an icon belongs.
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

/** The cursor belongs to the message being written and to its last line. */
function Cursor() {
  return (
    <span className="ml-[2px] inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse bg-[var(--store-primary-40)] align-middle motion-reduce:animate-none" />
  );
}

interface Block {
  readonly kind: "list" | "para";
  /** The index of the block's first line, which is also its key and how the cursor finds its line. */
  readonly at: number;
  readonly lines: readonly { readonly at: number; readonly text: string }[];
}

/**
 * Consecutive list lines are one list; everything else is its own paragraph.
 *
 * A bare `"-"` counts, because the reveal joins on spaces and not on newlines, so the token
 * `"source.\n-"` leaves a line of one hyphen for a tick. Without this each bullet first appears as a
 * stray paragraph and then jumps into the list, five visible reflows per answer.
 */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  text.split("\n").forEach((line, at) => {
    const kind = line === "-" || line.startsWith("- ") ? "list" : "para";
    const open = blocks[blocks.length - 1];
    if (kind === "list" && open?.kind === "list") {
      (open.lines as { at: number; text: string }[]).push({ at, text: line });
      return;
    }
    blocks.push({ kind, at, lines: [{ at, text: line }] });
  });
  return blocks;
}

/** What a screen reader is given once an answer is finished: the words, without the markup. */
function plain(text: string): string {
  return text.replace(/\*\*/g, "").replace(/^- /gm, "");
}

function Bubble({
  message,
  writing,
  spaced,
  onEdit,
  onRetry,
}: {
  message: Message;
  /** True for a reader's message that follows an answer: the only place a turn needs air. */
  spaced: boolean;
  /** True while this message is the one being written. */
  writing: boolean;
  onEdit: (text: string) => void;
  /** Absent on every answer but the last, because retrying an older one would discard the turns
      after it and a button that quietly deletes four messages is worse than no button. */
  onRetry?: () => void;
}) {
  const { copied, copy } = useCopy(plain(message.text));
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const copyAction: Action = {
    label: copied ? "Copied" : "Copy",
    icon: copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />,
    onClick: copy,
  };

  if (message.from === "reader") {
    /* ChatGPT's bubble, which the dev chose over the first reference's: a pale tint of the brand
       rather than a grey, a 20px radius, roomier padding and body copy at 16px rather than 14px, so
       the reader's own words are as legible as the answer. `whitespace-pre-line` keeps the line
       breaks they typed, which the reference's bubble drops. */
    return (
      <div
        className={`group tn-rise flex flex-col items-end gap-[4px] ${spaced ? "mt-[var(--tn-space-sm)]" : ""}`}
      >
        <div
          className={`${FONT} w-fit max-w-[80%] whitespace-pre-line rounded-[20px] bg-[var(--store-primary-10)] px-[20px] py-[14px] text-[length:var(--store-body-1)] font-normal leading-[1.6] text-[var(--store-neutral-100)]`}
        >
          {message.text}
        </div>
        <Actions
          align="end"
          items={[
            copyAction,
            {
              label: "Edit",
              icon: <Edit width={16} height={16} />,
              onClick: () => onEdit(message.text),
            },
          ]}
        />
      </div>
    );
  }

  /* `.chat-result-title`: a column at `gap: 12px`, 14px at 400. **The 12px separates blocks, not
     list items**: the reference's bullets are `<li>` inside one `<ul>` and a list item has no margin
     of its own, so they stack at the line height. Their `<ul>` also carries `margin: 12px 0` on top
     of the gap, 24px around the list, which is deliberately not copied. */
  const blocks = toBlocks(message.text);
  const lastLine = message.text.split("\n").length - 1;

  return (
    <div className="tn-rise flex max-w-[760px] flex-col gap-[4px]">
      <div
        className={`${FONT} flex flex-col gap-[12px] text-[length:var(--store-body-2)] font-normal leading-[21px] text-[var(--store-neutral-100)]`}
      >
        {blocks.map((block) =>
          block.kind === "list" ? (
            <ul
              key={block.at}
              className="list-disc ps-[20px] marker:text-[var(--store-primary-40)]"
            >
              {block.lines.map((line) => (
                <li key={line.at} className="ps-[2px]">
                  <Rich text={line.text.replace(/^- ?/, "")} />
                  {writing && line.at === lastLine ? <Cursor /> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p key={block.at}>
              <Rich text={block.lines[0]?.text ?? ""} />
              {writing && block.at === lastLine ? <Cursor /> : null}
            </p>
          ),
        )}
      </div>
      {/* Under the answer, and only once it is finished: a retry button over a sentence still being
          written offers to redo what has not happened yet. */}
      {writing ? null : (
        <Actions
          always
          align="start"
          items={[
            copyAction,
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
              ? [
                  {
                    label: "Try again",
                    icon: <Reload width={16} height={16} />,
                    onClick: onRetry,
                  },
                ]
              : []),
          ]}
        />
      )}
    </div>
  );
}

/** One word every 18ms: read as writing rather than as a machine printing. */
const WORD_MS = 18;

function prefersReduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Thread({ first, onBack }: { first: string; onBack: () => void }) {
  /**
   * **Both messages of a turn are created by the event that caused it**, never derived in an effect
   * from the state that effect also sets. An effect keyed on the message count appended the answer,
   * which meant StrictMode's double mount appended it twice and left an empty bubble above every
   * first reply, and a follow-up sent mid-answer re-entered the same effect and froze the first
   * answer at whatever word it had reached.
   */
  const [messages, setMessages] = useState<Message[]>(() => [
    { from: "reader", text: first },
    { from: "voilet", text: "" },
  ]);
  const [draft, setDraft] = useState("");
  /** The full text of the answer being written, and which message it belongs to. */
  const full = useRef(reply(first));
  const target = useRef(1);
  /**
   * How many words are on screen, or `null` when nothing is being written. A fresh object every
   * tick, so a new turn that begins at the same word count still restarts the effect rather than
   * leaving the previous turn's timer to fire into it.
   */
  const [writing, setWriting] = useState<{ words: number } | null>({ words: 0 });
  const back = useRef<HTMLButtonElement>(null);
  const foot = useRef<HTMLDivElement>(null);

  /* The whole page changed, so the reader who was on the button that caused it is now on nothing.
     Moving focus to Back is what tells a screen reader the screen changed at all. */
  useEffect(() => {
    back.current?.focus();
  }, []);

  /* The thread owns the window while it is open: the page stops scrolling and the footer is not
     drawn (`SD-218`, and `globals.css` for why it is an attribute rather than a prop). The cleanup
     is what gives it back, so Back returns to a page that scrolls. */
  useEffect(() => {
    document.documentElement.dataset.thread = "open";
    return () => {
      delete document.documentElement.dataset.thread;
    };
  }, []);

  /* The writing itself. One word a tick, and the whole thing at once under reduced motion. */
  useEffect(() => {
    if (writing === null) return;
    const i = target.current;
    const words = full.current.split(" ");
    if (prefersReduced() || writing.words >= words.length) {
      setMessages((m) => m.map((x, k) => (k === i ? { ...x, text: full.current } : x)));
      setWriting(null);
      return;
    }
    const timer = setTimeout(() => {
      const text = words.slice(0, writing.words + 1).join(" ");
      setMessages((m) => m.map((x, k) => (k === i ? { ...x, text } : x)));
      setWriting({ words: writing.words + 1 });
    }, WORD_MS);
    return () => clearTimeout(timer);
  }, [writing]);

  /* Once per turn, not once per word. Keyed on `messages` it ran on all 200-odd ticks, which pulled
     a reader who had scrolled up back to the foot about fifty times a second. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: a turn, not a word
  useEffect(() => {
    foot.current?.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length]);

  const start = (text: string) => {
    /* Whatever is still being written is flushed to its full text first, so a follow-up never
       leaves the previous answer frozen mid-sentence. */
    const flushed = messages.map((m, i) =>
      i === target.current ? { ...m, text: full.current } : m,
    );
    target.current = flushed.length + 1;
    full.current = reply(text);
    setMessages([...flushed, { from: "reader", text }, { from: "voilet", text: "" }]);
    setWriting({ words: 0 });
  };

  const send = () => {
    const text = draft.trim();
    if (text === "") return;
    setDraft("");
    start(text);
  };

  /* Writes the answer again, from the prompt above it. */
  const retry = () => {
    const prompt = messages[target.current - 1];
    if (!prompt) return;
    full.current = reply(prompt.text);
    setMessages((m) => m.map((x, i) => (i === target.current ? { ...x, text: "" } : x)));
    setWriting({ words: 0 });
  };

  const answered = writing === null ? messages[target.current]?.text : undefined;

  /* **The underscores in the `calc` are load-bearing.** `calc(100dvh-var(--x))` is not valid CSS:
     a minus needs whitespace around it or the parser reads `100dvh-var` as one token and drops the
     declaration, which leaves the section at `height: auto`, the page scrolling and the composer
     floating in the middle of it. Tailwind turns `_` into a space. */
  return (
    <section className="mx-auto flex h-[calc(100dvh_-_var(--tn-h-topbar))] w-full max-w-[900px] flex-col px-[var(--tn-space-sm)] pt-[var(--tn-space-sm)] pb-[var(--tn-space-sm)]">
      <button
        ref={back}
        type="button"
        onClick={onBack}
        className={`${FONT} mb-[var(--tn-space-2xs)] flex shrink-0 cursor-pointer items-center gap-[6px] self-start text-[length:var(--store-body-2)] font-medium text-[var(--store-neutral-100)] transition-colors duration-150 hover:text-[var(--store-primary-40)]`}
      >
        <Glyph size={20}>
          <path d="M14 6l-6 6 6 6" />
        </Glyph>
        Back
      </button>

      {/* The finished answer, once, for a screen reader. Fed word by word it would announce two
          hundred times, which is worse than announcing nothing. */}
      <p aria-live="polite" className="sr-only">
        {answered ? plain(answered) : ""}
      </p>

      {/* **The spacing is a margin on the reader's message, not a gap on the list**, because a gap
          is uniform and the two boundaries are not: an answer belongs to the question above it and
          wants no air between them, while the next question is a new turn and wants 24px. A uniform
          gap put a dead band between a message and its own reply. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth">
        {messages.map((m, i) => (
          <Bubble
            // biome-ignore lint/suspicious/noArrayIndexKey: an append-only list
            key={i}
            message={m}
            writing={writing !== null && i === target.current}
            spaced={i > 0 && m.from === "reader"}
            onEdit={setDraft}
            onRetry={i === target.current ? retry : undefined}
          />
        ))}
        <div ref={foot} />
      </div>

      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={send}
        busy={writing !== null}
        placeholder="Ask Voilet"
        className="mt-[var(--tn-space-lg)] shrink-0"
      />
    </section>
  );
}
