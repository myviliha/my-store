"use client";

import Link from "next/link";
import { ERROR_PAGES } from "@/src/data/content";

/**
 * Per-segment error boundary (`SD-038`), and the store's `/500` (`ST-015`). Client, because it takes
 * `reset`.
 *
 * Named `SegmentError` rather than `Error`: the file's default export is what Next uses, and
 * shadowing the global `Error` inside a module that also handles one is how a `new Error()` in here
 * silently constructs a React component.
 *
 * It deliberately does not render `error.message`: that string can carry internals, and a buyer is
 * owed a way forward rather than a stack trace. `digest` is the server-side correlation id and is
 * safe to show, which is what makes a support ticket actionable.
 */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { code, title, lead } = ERROR_PAGES.server;

  return (
    <div className="page py-24 text-center">
      <p className="text-sm font-semibold text-warning">{code}</p>
      <h1 className="mx-auto mt-3 max-w-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-lead text-lg text-muted">{lead}</p>
      {error.digest ? (
        <p className="mt-4 font-mono text-sm text-muted">Reference: {error.digest}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-control border border-border px-5 py-3 text-sm font-semibold text-heading transition-colors hover:bg-surface-muted"
        >
          Go home
        </Link>
        <Link
          href="/support"
          className="rounded-control border border-border px-5 py-3 text-sm font-semibold text-heading transition-colors hover:bg-surface-muted"
        >
          Get help
        </Link>
      </div>
    </div>
  );
}
