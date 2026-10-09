"use client";

import { useSyncExternalStore } from "react";

/**
 * Which auth modal is open, if any (2026-10-09): `"signin"`, `"signup"`, `"forgot"` (password reset,
 * from sign-in's "Forgot Password?"), or `null`.
 *
 * The rail's "Sign in" opens sign-in, the top bar's "Sign up" opens sign-up, and the modal switches
 * between the two from its own footer links. The modal is drawn once by `app/layout.tsx`; all three
 * are siblings the server lays out, so, as with `drawer-store.ts`, a small module store lets them
 * share one value without making the layout a client component.
 */
export type AuthMode = "signin" | "signup" | "forgot";

let mode: AuthMode | null = null;
const listeners = new Set<() => void>();

export function setAuth(next: AuthMode | null) {
  if (next === mode) return;
  mode = next;
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useAuth(): AuthMode | null {
  return useSyncExternalStore(
    subscribe,
    () => mode,
    () => null,
  );
}

/*
 * ┌─ DEMO-ONLY(auth) ───────────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE WITH THE AUTH SERVICE'S SESSION. Find every piece with:                                 │
 * │   grep -rn "DEMO-ONLY(auth)" app                                                                │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 * **Who is signed in, for the full-flow demo** (2026-10-09, by request): any email and password sign
 * in, sign up, Google, GitHub and a reset all "succeed". The user is kept in this browser's
 * `localStorage` so a refresh keeps them signed in. **Only a name and an email are kept, never a
 * password**, and nothing leaves the browser.
 */
export type User = { name: string; email: string };

const KEY = "voilet-demo-user";

function read(): User | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<User>) : null;
    return parsed && typeof parsed.name === "string" && typeof parsed.email === "string"
      ? { name: parsed.name, email: parsed.email }
      : null;
  } catch {
    return null;
  }
}

/* Read once in the browser. The server, and hydration, see `null` (`useUser`'s server snapshot), so
   the signed-in look arrives on the render after hydration rather than mismatching it. */
let user: User | null = typeof window === "undefined" ? null : read();
const userListeners = new Set<() => void>();

function setUser(next: User | null) {
  user = next;
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* Private mode or storage blocked: the demo still signs in for this visit. */
  }
  for (const l of userListeners) l();
}

/** "jordan.lee@example.com" → "Jordan Lee", for a sign-in that asks for no name. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._\-+]+/).filter(Boolean);
  return words.length
    ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : "Voilet user";
}

/** One or two letters for the avatar: "Jordan Lee" → "JL". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}` : (parts[0]?.slice(0, 1) ?? "");
  return letters.toUpperCase() || "?";
}

export function signIn(next: User) {
  setUser(next);
}

export function signOut() {
  setUser(null);
}

const subscribeUser = (l: () => void) => {
  userListeners.add(l);
  return () => userListeners.delete(l);
};

export function useUser(): User | null {
  return useSyncExternalStore(
    subscribeUser,
    () => user,
    () => null,
  );
}
