/**
 * Read a `NEXT_PUBLIC_*` value, treating **empty as unset** (`SD-187`).
 *
 * **`??` does not do this, and that is the whole reason this exists.** It falls back on `undefined`
 * and `null` only, so `NEXT_PUBLIC_SITE_URL=` with nothing after the `=` is a defined empty string:
 * the fallback beside it never runs and the setting silently becomes `""`.
 *
 * **Which crashed the store.** `lib/site.ts` had `process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_ORIGIN`
 * and `app/layout.tsx` has `metadataBase: new URL(SITE.url)`; `new URL("")` throws at module
 * evaluation, so every route 500s before rendering anything.
 *
 * **And `.env.example` ships every key with an empty value on purpose.** Its own header says so:
 * *"Keys only, every value empty: this is the contract, and a default left here silently becomes
 * production config for whoever copies it."* That reasoning is right and the file should stay as it
 * is. What was wrong is the reading: the app told people to copy a file of empty keys and then
 * treated an empty key as a configured value. Eighteen settings did this; `SITE.url` was the only
 * one that said so, because it was the only one passed to something that validates its input.
 *
 * **It takes the value, never the name.** `process.env[name]` cannot be statically analysed, and
 * Next.js inlines `NEXT_PUBLIC_*` by literal substitution of `process.env.NAME`, so a dynamic read
 * returns `undefined` in the browser. Every call site therefore writes the literal and passes it
 * here, which looks redundant and is the only form that works.
 *
 * **Whitespace counts as empty**, because a trailing space after the `=` is invisible in the editor
 * that produced it.
 */
export function envOr<T>(value: string | undefined, fallback: T): string | T {
  return value === undefined || value.trim() === "" ? fallback : value;
}
