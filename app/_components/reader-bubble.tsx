"use client";

import { Edit } from "@/app/_vendor/icons";
import { useEffect, useId, useRef, useState } from "react";

import { Actions, useCopyAction } from "./message-actions";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FONT } from "./type";

/**
 * A message the reader sent, **editable where it stands** (2026-10-08). Edit used to copy the text
 * down into the composer, which left the original in place and the reader unsure which one counted.
 * Now the bubble becomes a text box with Cancel and Send: Enter sends, Shift+Enter breaks the line,
 * Escape cancels, and focus returns to the Edit button on the way out. Send is disabled while the
 * text is empty or unchanged, because neither is an edit. What Send does to the conversation is
 * `editAt` in `Thread`.
 */
export function ReaderBubble({
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
      {/* Hidden rather than removed while editing, so the gap down to the reply stays the height of
          this row instead of closing up under the edit box. `inert` keeps it out of reach. */}
      <div className={editing ? "invisible" : undefined} inert={editing}>
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
      </div>
    </div>
  );
}
