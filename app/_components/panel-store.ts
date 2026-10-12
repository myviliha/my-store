"use client";

import { useRouter } from "next/navigation";

/**
 * **Opening one of the conversation's side panels from anywhere** (2026-10-09).
 *
 * **Pricing has no route** (the owner, 2026-10-09): it is a panel of the home screen's conversation,
 * nothing else, so every Pricing control (the rail, Upgrade, the top bar, a reply's "See Plans &
 * pricing", the footer) is a button that asks for the panel through this store:
 *  - **a conversation is open**: `Thread` opens the panel beside it, and the chat stays as it was;
 *  - **the home page is showing, no conversation yet**: `Conversation` opens one, empty with the
 *    welcome, and the panel beside it;
 *  - **anywhere else** (a page that is not home): nothing is listening, so the request is kept and the button
 *    goes home, where `Conversation` takes it on mount (`takePendingPanel`).
 * A button never says anything in the conversation (only what the reader types does).
 *
 * The same module-store pattern as `drawer-store.ts`: the callers are siblings the server lays out.
 */
/** "preview" is a shared design's link opening on the home page (`share-link.ts`). */
export type Panel = "pricing" | "preview";

const listeners = new Set<(panel: Panel) => void>();
let pending: Panel | null = null;

/** Called by `Thread` and `Conversation` while mounted; returns the unsubscribe. */
export function onPanelRequest(listener: (panel: Panel) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Delivered at once when something is listening; otherwise kept for the home page. */
export function requestPanel(panel: Panel): boolean {
  if (listeners.size > 0) {
    for (const l of listeners) l(panel);
    return true;
  }
  pending = panel;
  return false;
}

/** The home page's `Conversation` takes a request made on another page, once. */
export function takePendingPanel(): Panel | null {
  const p = pending;
  pending = null;
  return p;
}

/** What every Pricing button calls: open the panel here, or go home and open it there. */
export function useOpenPricing() {
  const router = useRouter();
  return () => {
    if (!requestPanel("pricing")) router.push("/");
  };
}
