"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useUser } from "./auth-store";

/**
 * **Saved designs** (2026-10-12, by request): Save in the preview keeps the reader's configured
 * admin so they can come back to it.
 *
 * **Signed out, it is kept in this browser** (`localStorage`), so a guest can save without an
 * account, in keeping with "sign-in waits for Download". **Signed in, it goes to the account** through
 * `accountApi` below, which is the one place the backend call will go. A guest's saves are moved to
 * the account the first time they sign in, so nothing saved is lost.
 *
 * A design is saved as its recipe (what the reader chose), keyed by the recipe itself, so saving the
 * same configuration twice is one entry. A module store read with `useSyncExternalStore` (`SD-196`);
 * `localStorage` is read after hydration (`SD-177`).
 */

const GUEST_KEY = "voilet-saved:guest";
const accountKey = (email: string) => `voilet-saved:${email}`;

/*
 * ┌─ DEMO-ONLY(save-api) ───────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE WITH THE ACCOUNT SERVICE: GET/PUT the account's saved designs. Until it exists, an       │
 * │ account's list is kept in this browser under its email, so the flow can be shown.               │
 * │   grep -rn "DEMO-ONLY(save-api)" app src                                                        │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 */
const accountApi = {
  async list(email: string): Promise<string[]> {
    return readLocal(accountKey(email));
  },
  async put(email: string, keys: readonly string[]): Promise<void> {
    writeLocal(accountKey(email), keys);
  },
};

function readLocal(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}
function writeLocal(key: string, keys: readonly string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(keys));
  } catch {
    /* Private mode or storage blocked: kept for this visit only. */
  }
}

const EMPTY: readonly string[] = [];
let saved: readonly string[] = EMPTY;
/** Whose list `saved` is: an email, "guest", or null before the first load. */
let owner: string | null = null;
const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

/** Load the list for whoever is reading: a guest's from this browser, an account's from the API. */
async function load(email: string | null) {
  const who = email ?? "guest";
  if (owner === who) return;
  owner = who;
  if (!email) {
    saved = readLocal(GUEST_KEY);
  } else {
    /* First sign-in on this browser: the guest's saves join the account's. */
    const guest = readLocal(GUEST_KEY);
    const mine = await accountApi.list(email);
    const merged = [...new Set([...mine, ...guest])];
    if (guest.length > 0) {
      await accountApi.put(email, merged);
      writeLocal(GUEST_KEY, []);
    }
    if (owner !== who) return;
    saved = merged;
  }
  emit();
}

async function persist(email: string | null, next: readonly string[]) {
  saved = next;
  emit();
  if (email) await accountApi.put(email, next);
  else writeLocal(GUEST_KEY, next);
}

/** A recipe's key: the same configuration is the same saved design. */
export const designKey = (recipe: unknown): string => JSON.stringify(recipe);

/** Whether this design is saved, and a toggle that saves or removes it. */
export function useSaved(key: string): { saved: boolean; toggle: () => Promise<boolean> } {
  const account = useUser();
  const email = account?.email ?? null;
  useEffect(() => {
    void load(email);
  }, [email]);
  const list = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => saved,
    () => EMPTY,
  );
  const isSaved = list.includes(key);
  return {
    saved: isSaved,
    /** Resolves to the new state: `true` when it is now saved. */
    toggle: async () => {
      const next = isSaved ? saved.filter((k) => k !== key) : [...saved, key];
      await persist(email, next);
      return !isSaved;
    },
  };
}
