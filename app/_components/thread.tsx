"use client";

import { Check, Copy, Edit } from "@/app/_vendor/icons";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Composer, Glyph } from "./composer";
import type { CardRect } from "./conversation";
import { Preview } from "./preview";
import { nextStep, parse, promptFor, type Recipe, type Step } from "./recipe";
import { type Answer, DownloadCard, StepCard } from "./recipe-ui";
import { FONT } from "./type";

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
  | { readonly id: number; readonly from: "reader"; readonly text: string }
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

/* ─── The reader's own messages: copy and edit, on hover or focus ─────────────────────────────── */

interface Action {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

const ACTION_BUTTON =
  "flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-[var(--store-neutral-80)] transition-colors duration-150 hover:bg-[var(--store-neutral-30)] hover:text-[var(--store-neutral-100)]";

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

function ReaderBubble({
  text,
  spaced,
  delay,
  onEdit,
}: {
  text: string;
  /** Every message but the first opens a new turn and wants air above it. */
  spaced: boolean;
  /** How long it waits before rising, in ms; the first waits for the card to start moving away. */
  delay: number;
  onEdit: (text: string) => void;
}) {
  const { copied, copy } = useCopy(text);
  const actions: Action[] = [
    {
      label: copied ? "Copied" : "Copy",
      icon: copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />,
      onClick: copy,
    },
    { label: "Edit", icon: <Edit width={16} height={16} />, onClick: () => onEdit(text) },
  ];
  return (
    <div
      className={`group tn-message-in flex flex-col items-end gap-[4px] ${spaced ? "mt-[var(--tn-space-sm)]" : ""}`}
      style={{ ["--delay" as string]: `${delay}ms` }}
    >
      <div
        className={`${FONT} w-fit max-w-[80%] whitespace-pre-line rounded-[20px] bg-[var(--store-primary-10)] px-[20px] py-[12px] text-[length:var(--store-body-1)] font-normal leading-[1.6] text-[var(--store-neutral-100)]`}
      >
        {text}
      </div>
      <div className="flex items-center gap-[4px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        {actions.map((a) => (
          <button key={a.label} type="button" aria-label={a.label} onClick={a.onClick} className={ACTION_BUTTON}>
            {a.icon}
          </button>
        ))}
      </div>
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
  const read = (text: string, recipe: Recipe): { next: Recipe; lead?: string } => {
    const { patch, unsupported, understood } = parse(text);
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
  const [recipe, setRecipe] = useState<Recipe>(() => read(first, {}).next);
  const [turns, setTurns] = useState<Turn[]>(() => {
    const { next, lead } = read(first, {});
    return [
      { id: nextId(), from: "reader", text: first },
      ask(next, lead),
    ];
  });
  /** Bumped on every change to the recipe, so a preview can tell it is out of date. */
  const [revision, setRevision] = useState(1);
  const [preview, setPreview] = useState<{ recipe: Recipe; revision: number } | null>(null);
  /** Below `lg` the chat and the preview share the screen as tabs. */
  const [tab, setTab] = useState<"chat" | "preview">("chat");
  const [split, setSplit] = useState(SPLIT_DEFAULT);
  const [draft, setDraft] = useState("");
  const foot = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLFormElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const update = (next: Recipe) => {
    setRecipe(next);
    setRevision((r) => r + 1);
  };

  /** One turn: the reader's words, the newest question marked answered, and the next question. */
  const turn = (echo: string, next: Recipe, lead?: string) => {
    update(next);
    setTurns((all) => {
      const marked = all.map((t, i) =>
        i === all.length - 1 && t.from === "voilet" && t.step ? { ...t, answered: next } : t,
      );
      return [...marked, { id: nextId(), from: "reader", text: echo }, ask(next, lead)];
    });
  };

  const answer = ({ patch, echo }: Answer) => turn(echo, { ...recipe, ...patch });

  const send = () => {
    const text = draft.trim();
    if (text === "") return;
    setDraft("");
    const { next, lead } = read(text, recipe);
    turn(text, next, lead);
  };

  const openPreview = () => {
    setPreview({ recipe, revision });
    setTab("preview");
  };

  const download = () => {
    setTurns((all) => [
      ...all,
      { id: nextId(), from: "reader", text: "Download" },
      {
        id: nextId(),
        from: "voilet",
        text: "Here's the package. Check it before you download:",
        download: recipe,
      },
    ]);
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

  /* Once per turn: the newest question scrolls into view. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: a turn, not a render
  useEffect(() => {
    foot.current?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "end" });
  }, [turns.length]);

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
  const announce = latest?.from === "voilet" ? latest.text : "";
  const split2 = preview !== null;

  const chat = (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${split2 && tab === "preview" ? "max-lg:hidden" : ""}`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-[780px] flex-col">
          {turns.map((t, i) =>
            t.from === "reader" ? (
              <ReaderBubble
                key={t.id}
                text={t.text}
                spaced={i > 0}
                delay={i === 0 && from ? FIRST_MESSAGE_DELAY : 0}
                onEdit={setDraft}
              />
            ) : (
              <div
                key={t.id}
                className="tn-message-in mt-[var(--tn-space-xs)] flex max-w-[680px] flex-col gap-[12px] rounded-[16px] border border-[var(--store-card-border)] bg-white/75 p-[16px] backdrop-blur-sm"
                style={{ ["--delay" as string]: i === 1 && from ? `${FIRST_MESSAGE_DELAY + 120}ms` : "0ms" }}
              >
                <p className={`${FONT} text-[length:var(--store-body-2)] leading-[1.55] text-[var(--store-neutral-100)]`}>
                  {t.text}
                </p>
                {t.step && t.asked ? (
                  <StepCard
                    step={t.step}
                    /* The live question always shows the live recipe, so a page ticked in the summary
                       stays ticked; an answered one shows the recipe it was answered with. */
                    asked={i === last ? recipe : t.asked}
                    answered={i === last ? undefined : t.answered}
                    live={i === last}
                    onAnswer={answer}
                    onEdit={(next, echo) => (echo ? turn(echo, next) : update(next))}
                    onPreview={openPreview}
                    onDownload={download}
                  />
                ) : null}
                {t.download ? <DownloadCard recipe={t.download} /> : null}
              </div>
            ),
          )}
          <div ref={foot} className="h-[8px] shrink-0" />
        </div>
      </div>
      <Composer
        formRef={dock}
        value={draft}
        onChange={setDraft}
        onSubmit={send}
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
          <div role="tablist" aria-label="View" className="flex gap-[4px] rounded-full bg-[var(--store-neutral-30)] p-[3px] lg:hidden">
            {(["chat", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={tab === v}
                onClick={() => setTab(v)}
                className={`${FONT} cursor-pointer rounded-full px-[14px] py-[5px] text-[length:var(--store-body-3)] font-semibold capitalize ${tab === v ? "bg-white text-[var(--store-primary-40)] shadow-[0_1px_3px_#0c0c0c1a]" : "text-[var(--store-neutral-80)]"}`}
              >
                {v}
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
        {split2 ? (
          <>
            <div className="flex min-h-0 min-w-0 max-lg:flex-1" style={{ flexBasis: `${split}%` }}>
              {chat}
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat and preview"
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
            <div className={`min-h-0 min-w-0 flex-1 ${tab === "chat" ? "max-lg:hidden" : ""}`}>
              <Preview
                recipe={preview.recipe}
                revision={preview.revision}
                outdated={preview.revision !== revision}
                onRefresh={() => setPreview({ recipe, revision })}
                onClose={() => {
                  setPreview(null);
                  setTab("chat");
                }}
                onDownload={download}
              />
            </div>
          </>
        ) : (
          chat
        )}
      </div>
    </section>
  );
}
