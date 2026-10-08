"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the rail is open as a drawer, on a phone (2026-10-08, responsive pass).
 *
 * **Shared state between two siblings the server lays out.** The top bar's menu button opens the
 * drawer and the rail is the drawer; both are rendered by `app/layout.tsx`, a server component, so
 * there is no client parent to hold a `useState` for them. A module-level store read through
 * `useSyncExternalStore` is the smallest thing that lets both see one value without turning the
 * layout into a client component. Below `md` only: on a tablet or desktop the rail is always on the
 * page and this stays `false`.
 */
let open = false;
const listeners = new Set<() => void>();

export function setDrawer(next: boolean) {
  if (next === open) return;
  open = next;
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useDrawer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
