"use client";

import { useSyncExternalStore } from "react";

/**
 * The website domain the home page's chips have selected (CRM, SaaS…), or `null` for all
 * (2026-10-08). The chips live in `Search` and the wall they filter in `Gallery`; both are siblings
 * the server lays out, so, as with `drawer-store.ts`, a small module store lets them share one value
 * without making the page a client component.
 */
let domain: string | null = null;
const listeners = new Set<() => void>();

export function setDomain(next: string | null) {
  if (next === domain) return;
  domain = next;
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useDomain(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => domain,
    () => null,
  );
}
