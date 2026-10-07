/**
 * The code samples the style pages display, and nothing else (`SD-115`).
 *
 * **This file exists so that `token-contract.test.ts` can exempt it without exempting anything that
 * matters.** That guard forbids a colour literal in any source file, because a component that styles
 * itself with `#266df0` has bypassed the token layer this product is sold on. It already treats a
 * hex inside a comment as prose rather than a bypass, on the reasoning that documentation explaining
 * why a token has a value is not a second source of truth.
 *
 * A code sample shown to a buyer is that same thing one step further: `--button-primary: #7c3aed` on
 * `/styles/tailwind/` is the whole point of the example, because an override with no concrete value
 * teaches nobody anything. Allowlisting `styles.ts` would have worked and would have exempted a file
 * that also carries real content, so the next real literal added to it would pass unnoticed. A file
 * that holds only strings for display cannot hide one.
 *
 * **Nothing here is applied.** These are `<pre>` contents. If a value below is ever read by styling
 * code, this file has stopped being what its name says and the exemption should go with it.
 */

/** The purple is arbitrary and deliberately not a brand colour: it has to look like the reader's. */
export const TAILWIND_OVERRIDE = `@import "tailwindcss";
@import "@viliha/vui-react/theme.css";

/* Every component reads these. Change one and the whole product moves. */
:root {
  --button-primary: #7c3aed;
  --radius: 0.5rem;
}`;

export const BOOTSTRAP_OVERRIDE = `@import "bootstrap/dist/css/bootstrap.min.css";
@import "@viliha/vui-css/theme.css";

:root {
  --button-primary: #7c3aed;
  --radius: 0.5rem;
}`;

export const BULMA_OVERRIDE = `@import "bulma/css/bulma.min.css";
@import "@viliha/vui-css/theme.css";

:root {
  --button-primary: #7c3aed;
  --radius: 0.5rem;
}`;
