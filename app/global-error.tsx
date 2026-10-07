"use client";

/**
 * The root boundary (`SD-038`): it catches a failure in the root layout itself, which is the one
 * case `error.tsx` cannot reach.
 *
 * It must render its own `<html>` and `<body>`, because the layout that normally provides them is
 * what failed. That also means it cannot use the font variable or the stylesheet, so it stays
 * deliberately plain rather than half-styled.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body>
        <h1>Something Went Wrong</h1>
        <p>The page could not be displayed.</p>
        {error.digest ? <p>Reference: {error.digest}</p> : null}
        <a href="/">Back to the storefront</a>
      </body>
    </html>
  );
}
