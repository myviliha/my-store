"use client";

import {
  ChevronDown,
  Camera,
  Dashboard,
  Input,
  Layout,
  Palette,
  Picture,
  Desktop,
  FileText,
  Globe,
  Reader,
  Table,
  Upload,
} from "@/app/_vendor/icons";
import { type ReactNode, type Ref, useEffect, useState } from "react";

import { Choice, Divider, Panel, useFilePicker } from "./menu";
import { ModelPicker } from "./model-picker";
import type { ModelRow } from "./models";

import { BUTTON_PRIMARY, FONT } from "./type";

/**
 * The prompt card, which both the opening screen and the conversation render (`SD-216`).
 *
 * **One component, two places, because the reference does the same.** Its card sits under the
 * headline on the way in and pinned to the foot of the thread afterwards, with the same six
 * controls in the same order; two copies of a six-control row is two rows that drift.
 *
 * The caller owns the text. That is what lets the opening screen hand its value to the thread as the
 * first message instead of the thread starting empty and the reader retyping.
 *
 * **The four menus are real** (`SD-219`). `+` opens the file picker and the chosen names appear as
 * chips that can be removed; Tools picks what to generate and seeds an empty box with the opening
 * of that sentence; Brand takes a name and a logo and puts the name on its own button; the model
 * list names the one generator there is.
 *
 * **What they do not do is pretend.** The reference's Tools menu offers video, whiteboards and
 * presentations, and its model list offers fourteen models behind a padlock. Ours offers what this
 * product makes and the one generator it has, because a menu of things we do not generate is a
 * refund rather than a sale, and a search field over a single row is theatre.
 */

/**
 * What a buyer can ask this product to generate.
 *
 * **Each row carries its own icon.** The first cut gave all six the same generic frame, which is the
 * difference between a menu and a list of indistinguishable rows: the reference's reason for drawing
 * an icon at all is that a reader finds the row by its shape before they read it. They are
 * `@viliha/vui-react/icons` rather than drawn here, which is where an icon belongs.
 */
const TOOLS = [
  {
    id: "app",
    title: "Admin application",
    note: "The screens, the shell and the design system",
    opens: "An admin for ",
    Icon: Layout,
  },
  {
    id: "dashboard",
    title: "Dashboard",
    note: "Cards, charts and the numbers behind them",
    opens: "A dashboard showing ",
    Icon: Dashboard,
  },
  {
    id: "table",
    title: "Data table",
    note: "A list screen with filters, sort and export",
    opens: "A table of ",
    Icon: Table,
  },
  {
    id: "form",
    title: "Form",
    note: "Create and edit, laid out by the form rules",
    opens: "A form to ",
    Icon: Input,
  },
  {
    id: "page",
    title: "Marketing page",
    note: "Built from the blocks the storefront uses",
    opens: "A landing page for ",
    Icon: Reader,
  },
  {
    id: "theme",
    title: "Theme",
    note: "Colour, type and spacing as tokens",
    opens: "A theme that feels ",
    Icon: Palette,
  },
] as const;

const ROW_BUTTON = `${FONT} flex shrink-0 cursor-pointer items-center gap-[10px] rounded-[8px] text-[length:var(--store-body-3)] font-medium capitalize leading-[1.5] text-[var(--store-neutral-100)] transition-colors duration-200 hover:text-[var(--store-primary-40)]`;

export function Glyph({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

/**
 * **The animated placeholder**: types an example prompt, holds it, deletes it, types the next.
 *
 * It shows what a good prompt looks like better than one static line can, because the reader sees
 * several in the time it takes to look at the card. The speeds are a person's, not a ticker's:
 * 45ms a character in, 20ms out, a 1.8s hold to read it.
 *
 * **Reduced motion gets the first example, still.** The global CSS clamp cannot reach this, because
 * it is a timer rather than an animation, so it reads the media query itself and stops.
 */
const TYPE_MS = 45;
const DELETE_MS = 20;
const HOLD_MS = 1800;

function useTypewriter(examples: readonly string[] | undefined, running: boolean): string {
  const [text, setText] = useState(examples?.[0] ?? "");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!examples?.length || !running) return;
    if (still) {
      setText(examples[0] ?? "");
      return;
    }
    const target = examples[index % examples.length] ?? "";
    const done = !deleting && text === target;
    const gone = deleting && text === "";
    const timer = window.setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (gone) {
          setDeleting(false);
          setIndex((i) => i + 1);
        } else setText(deleting ? text.slice(0, -1) : target.slice(0, text.length + 1));
      },
      done ? HOLD_MS : deleting ? DELETE_MS : TYPE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [examples, running, still, text, index, deleting]);

  return text;
}

export interface ComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /**
   * Example prompts to type out in place of `placeholder` while the box is empty. The static
   * `placeholder` is still what a screen reader hears, through the label and `aria-placeholder`.
   */
  examples?: readonly string[];
  /** The opening card is taller; the one under a thread only needs its two rows. */
  tall?: boolean;
  /** Voilet is writing. The card says so and will not take another prompt until it stops. */
  busy?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** The card itself, for a caller that measures or animates it: the hand-off reads the home card's
      rectangle through this, and the thread slides its own card from there. */
  formRef?: Ref<HTMLFormElement>;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  examples,
  tall = false,
  busy = false,
  className,
  style,
  formRef,
}: ComposerProps) {
  const empty = value.trim() === "";
  /* Only while the box is truly empty: a space typed is the reader starting, so the example gets
     out of the way rather than drawing over their cursor. */
  const typing = useTypewriter(examples, value === "");
  const animated = Boolean(examples?.length) && value === "";
  const [menu, setMenu] = useState<"add" | "tools" | "brand" | "model" | null>(null);
  const [tool, setTool] = useState<(typeof TOOLS)[number]["id"] | null>(null);
  const [brand, setBrand] = useState("");
  /** The row the model list has selected. Mock data; see `models.ts`. */
  const [model, setModel] = useState<ModelRow | null>(null);
  /** What was attached: the name, and a preview URL when the file is an image. */
  const [files, setFiles] = useState<{ name: string; url?: string }[]>([]);
  const close = () => setMenu(null);
  const take = (list: FileList) =>
    setFiles((f) => [
      ...f,
      ...[...list].map((x) => ({
        name: x.name,
        /* A local preview, which is all there is: nothing leaves the browser. Revoked when the
           tile goes, or the page holds the bytes until it is reloaded. */
        url: x.type.startsWith("image/") ? URL.createObjectURL(x) : undefined,
      })),
    ]);
  const drop = (at: number) =>
    setFiles((f) => {
      const gone = f[at];
      if (gone?.url) URL.revokeObjectURL(gone.url);
      return f.filter((_, k) => k !== at);
    });
  /** Opens a menu, or closes it when it is the one open. Each panel places itself against its own
      trigger's wrapper (`Panel` in `menu.tsx`). */
  const toggle = (which: "add" | "tools" | "brand" | "model") => {
    setMenu((m) => (m === which ? null : which));
  };
  const pickAny = useFilePicker(take);
  const pickLogo = useFilePicker(take, "image/*");
  const pickPhoto = useFilePicker(take, "image/*");

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (!empty && !busy) onSubmit();
      }}
      /* **A border, not a glow** (`SD-220`). The reference's focused card is a 1px brand border and
         nothing else; the 3px ring was mine, and on a card this wide it reads as a halo. */
      /* **720 x 150 on the opening screen**, smaller than the reference's 850 x 182 (`#chat-island-root`,
   `SD-222`) by request: the card was the heaviest thing above the fold. Still a fixed height rather
   than a `min-h`. `min-h` left the
   height to whatever the rows added up to, which is how it kept coming back taller. `isolate` and
   `z-20` because the menus hang out of this card over the sections below it, and a panel losing to
   a later sibling is `SD-212` happening a second time. */
      className={`relative isolate z-20 flex w-full flex-col rounded-[var(--tn-radius-lg)] border border-[var(--store-card-border)] bg-white text-left transition-colors duration-200 focus-within:border-[var(--store-primary-40)] ${tall ? "h-[150px]" : ""} ${className ?? ""}`}
      style={style}
    >
      {/* **A tile each, as the reference draws them**: the image itself at 88px with its name on a
          dark strip across the foot, and a file glyph where there is no preview to show. No progress
          ring, although the reference has one: nothing is uploaded anywhere, and a ring that fills
          against no transfer is the one lie this card keeps not telling. */}
      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-[8px] px-[var(--tn-space-sm)] pt-[var(--tn-space-sm)]">
          {files.map((file, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: two files may share a name
              key={`${file.name}-${i}`}
              className="group relative size-[88px] shrink-0 overflow-hidden rounded-[12px] border border-[var(--store-card-border)] bg-[var(--store-neutral-30)]"
            >
              {file.url ? (
                // biome-ignore lint/performance/noImgElement: a blob URL has no loader and no known size
                <img src={file.url} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-[var(--store-neutral-80)]">
                  <FileText width={28} height={28} aria-hidden="true" />
                </span>
              )}
              <span
                className={`${FONT} absolute inset-x-0 bottom-0 truncate bg-[#0c0c0c99] px-[6px] py-[4px] text-[length:var(--store-body-3)] font-medium text-white`}
              >
                {file.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => drop(i)}
                className="absolute right-[4px] top-[4px] flex size-[22px] cursor-pointer items-center justify-center rounded-full bg-[#0c0c0c99] text-white opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <Glyph size={14}>
                  <path d="M6 6l12 12M18 6L6 18" />
                </Glyph>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <label htmlFor="prompt" className="sr-only">
        Describe the admin theme you want to generate
      </label>
      {/* The wrapper is what the animated placeholder is positioned against; it takes the
          textarea's old place in the column, so the card's height maths is unchanged. */}
      <div className={`relative flex min-h-0 flex-1 ${tall ? "" : "min-h-[56px]"}`}>
        <textarea
          id="prompt"
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          /* Enter sends and Shift+Enter breaks the line, which is what a composer that looks like a
             chat box is expected to do. Without it the only way to send is the button, and a reader
             who presses Enter gets a newline and no answer.
             **Not while an input method is composing** (2026-10-08): with Vietnamese Telex, Japanese
             and the like, the first Enter only commits the composed word, and sending on it sent
             the message twice. `isComposing` is the standard flag; keyCode 229 is Safari's. */
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!empty && !busy) onSubmit();
            }
          }}
          placeholder={animated ? "" : placeholder}
          aria-placeholder={animated ? placeholder : undefined}
          readOnly={busy}
          className={`${FONT} min-h-0 w-full flex-1 resize-none bg-transparent p-[var(--tn-space-sm)] text-[length:var(--store-body-2)] leading-[1.5] text-[var(--store-neutral-100)] outline-none placeholder:text-[var(--store-neutral-70)]`}
        />
        {animated ? (
          <span
            aria-hidden="true"
            className={`${FONT} pointer-events-none absolute inset-0 p-[var(--tn-space-sm)] text-[length:var(--store-body-2)] leading-[1.5] text-[var(--store-neutral-70)]`}
          >
            {typing}
            <span className="tn-caret ml-[1px] inline-block h-[1.1em] w-[2px] translate-y-[3px] rounded-full bg-[var(--tn-accent-violet-solid)]" />
          </span>
        ) : null}
      </div>
      {/* `prompt-actions`: the reference's row is space-between with a 10px gap, pushed to the
          card's foot by `margin-top: auto`; here the textarea's `flex-1` does the pushing.
          **Below `md` it has 8px above and below** (2026-10-08): with no height there, the row
          shrank to its tallest button and the buttons pressed against the rule and the card's foot.
          From `md` it is the fixed 60px it always was. */}
      <div className="mt-auto flex shrink-0 items-center justify-between gap-[10px] border-t border-[var(--store-neutral-40)] px-[var(--tn-space-sm)] py-[var(--tn-space-2xs)] md:h-[60px] md:py-0">
        <div className="flex flex-wrap items-center gap-x-[var(--tn-space-2xs)] gap-y-[var(--tn-space-2xs)] md:gap-x-[20px]">
          <div className="relative">
            <button
              type="button"
              aria-label={menu === "add" ? "Close" : "Add"}
              aria-expanded={menu === "add"}
              onClick={() => toggle("add")}
              className={`${ROW_BUTTON} ${menu === "add" ? "text-[var(--store-primary-40)]" : ""}`}
            >
              {/* The plus turns into a close mark while its menu is open, which is the reference's
                  own behaviour and the reason that menu needs no heading row to close from.
                  **It turns, it is not swapped** (2026-10-08): a plus rotated 45° is the close mark,
                  so one glyph rotates on the composer's own easing instead of two drawings
                  replacing each other, which jumped. Reduced motion gets the turn without the
                  motion. */}
              <span
                className={`flex transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${menu === "add" ? "rotate-45" : "rotate-0"}`}
              >
                <Glyph size={24}>
                  <path d="M12 5v14M5 12h14" />
                </Glyph>
              </span>
            </button>
            <Panel
              open={menu === "add"}
              onClose={close}
              label="Add to this prompt"
              heading={false}
              width={360}
             
            >
              {/* The reference's three bands: what is on this machine, what is on the web, and the
                  services an account can be connected to. The last two are mock, like the model
                  list (`SD-221`), and nothing is uploaded anywhere. */}
              <Choice
                icon={<Upload width={20} height={20} aria-hidden="true" />}
                title="Upload files"
                note="Png, jpg, pdf and more"
                onClick={() => {
                  close();
                  pickAny();
                }}
              />
              <Choice
                icon={<Camera width={20} height={20} aria-hidden="true" />}
                title="Take a photo"
                note="Use your camera to capture an image"
                onClick={() => {
                  close();
                  pickPhoto();
                }}
              />
              <Choice
                icon={<Desktop width={20} height={20} aria-hidden="true" />}
                title="Take a screenshot"
                note="Capture your screen, window or tab"
                onClick={() => {
                  close();
                  pickAny();
                }}
              />
              <Divider />
              <Choice
                icon={<Globe width={20} height={20} aria-hidden="true" />}
                title="Add a website"
                note="Read a site and take its brand from it"
                onClick={close}
              />
              <Choice
                icon={<Picture width={20} height={20} aria-hidden="true" />}
                title="Add logo"
                note="Upload a logo to personalise your design"
                onClick={() => {
                  close();
                  pickLogo();
                }}
              />
            </Panel>
          </div>
          <div className="relative">
            <button
              type="button"
              aria-expanded={menu === "tools"}
              onClick={() => toggle("tools")}
              className={`${ROW_BUTTON} ${tool ? "text-[var(--store-primary-40)]" : ""}`}
            >
              {/* Two rails; the top knob sits right of centre, the bottom knob left of it. */}
              <Glyph size={20}>
                <path d="M3 8h18M3 16h18" />
                <circle cx="15" cy="8" r="2.5" fill="white" />
                <circle cx="9" cy="16" r="2.5" fill="white" />
              </Glyph>
              {/* Below `sm` the label is read, not shown, so the row fits a phone (2026-10-08). */}
              <span className="max-sm:sr-only">
                {tool ? TOOLS.find((t) => t.id === tool)?.title : "Tools"}
              </span>
            </button>
            <Panel open={menu === "tools"} onClose={close} label="What should Voilet generate?" width={392}>
              {TOOLS.map((t) => (
                <Choice
                  key={t.id}
                  icon={<t.Icon width={20} height={20} aria-hidden="true" />}
                  title={t.title}
                  note={t.note}
                  selected={tool === t.id}
                  onClick={() => {
                    const next = tool === t.id ? null : t.id;
                    setTool(next);
                    /* Seeds an empty box with the opening of that sentence, so choosing a tool
                       leaves the reader somewhere rather than only colouring a button. */
                    if (next && value.trim() === "") onChange(t.opens);
                    close();
                  }}
                />
              ))}
            </Panel>
          </div>
          <div className="relative">
            <button
              type="button"
              aria-expanded={menu === "brand"}
              onClick={() => toggle("brand")}
              className={`${ROW_BUTTON} ${brand ? "text-[var(--store-primary-40)]" : ""}`}
            >
              <Glyph size={20}>
                <circle cx="12" cy="12" r="9.25" />
                <path d="M9.5 7.5h3.2a2.2 2.2 0 0 1 0 4.4H9.5zM9.5 11.9h3.6a2.3 2.3 0 0 1 0 4.6H9.5z" />
              </Glyph>
              <span className="max-sm:sr-only">{brand || "Brand"}</span>
            </button>
            <Panel open={menu === "brand"} onClose={close} label="Apply your brand" width={336}>
              <div className="border-t border-[var(--store-neutral-40)] px-[8px] py-[10px]">
                <label htmlFor="brand-name" className="sr-only">
                  Your brand name
                </label>
                <input
                  id="brand-name"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="No brand yet"
                  className={`${FONT} w-full rounded-[8px] border border-[var(--store-card-border)] px-[10px] py-[8px] text-[length:var(--store-body-2)] text-[var(--store-neutral-100)] outline-none placeholder:text-[var(--store-neutral-70)] focus:border-[var(--store-primary-40)]`}
                />
              </div>
              <Choice
                icon={<Picture width={20} height={20} aria-hidden="true" />}
                title="Add your logo"
                note="Used as the mark in every generated screen"
                onClick={() => {
                  close();
                  pickLogo();
                }}
              />
            </Panel>
          </div>
          <div className="relative">
            <button
              type="button"
              aria-expanded={menu === "model"}
              onClick={() => toggle("model")}
              className={ROW_BUTTON}
            >
              <span className="max-w-[140px] truncate max-sm:sr-only">{model?.name ?? "Voilet"}</span>
              <ChevronDown width={16} height={16} aria-hidden="true" />
            </button>
            <ModelPicker
              open={menu === "model"}
              onClose={close}
              selected={model?.id ?? "voilet"}
              onSelect={setModel}
             
            />
          </div>
        </div>
        <div className="flex items-center gap-[var(--tn-space-xs)]">
          <button type="button" aria-label="Dictate" className={`${ROW_BUTTON} gap-0`}>
            <Glyph size={20}>
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
            </Glyph>
          </button>
          {/* **Smaller, and centred on its own content** (`SD-220`): 16 by 9 rather than 20 by 12,
              `justify-center` and `leading-none`, so the sparkle and the word sit on one line with
              equal air above and below rather than the label riding its own line height.

              **Busy is a state, not a disabled button.** While Voilet is writing the control says
              so and refuses a second prompt; a button that looks ready and does nothing is the
              worse of the two. */}
          <button
            type="submit"
            disabled={empty || busy}
            aria-busy={busy}
            className={`${BUTTON_PRIMARY} disabled:cursor-not-allowed disabled:bg-[var(--store-primary-30)]`}
          >
            {/* **The reference's own markup, not a measurement off a screenshot.** Its generate
                button is `btn btn-primary` at `border-radius: 8px` with a `width="16"` glyph, which
                is 16px of padding, 8px between the glyph and the word and the word at 14, and the
                height is **35px**, which is Pricing's on the bar: the dev set that as the standard and
                two primary buttons on one screen at two heights is the thing it prevents. The 48 by 22 before this was read off a scaled screenshot of a different button
                and came out half as big again as the thing it was copying.

                Both children are flex items of a centred row and the button has an explicit height,
                so nothing is left to the text baseline: the sparkle used to sit in a bare inline
                span, which is what made the pair read as high and left. */}
            <span className={`flex items-center ${busy ? "tn-spark" : ""}`}>
              <Glyph size={16}>
                <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9zM19 16l.7 2.1L21.8 19l-2.1.7L19 22l-.7-2.3L16.2 19l2.1-.9z" />
              </Glyph>
            </span>
            <span className="leading-none max-sm:sr-only">{busy ? "Voilet is working" : "Generate"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
