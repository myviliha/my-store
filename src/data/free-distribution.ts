/**
 * Where the free editions actually live, and how to change that without a deploy (`SD-108`).
 *
 * **These are real and were verified.** Both npm packages and all eight repositories answered 200 on
 * 2026-09-06. That matters because this storefront spent months telling buyers to
 * `pnpm add @viliha/vui-react`, which has never been published (`SD-099`): the free half **is**
 * published, under different names, from repositories outside this monorepo. `pnpm check:products`
 * reports zero published packages and is not wrong, it is looking for `@viliha/vui-*`.
 *
 * **Every URL is env-overridable with the real one as its default**, which is the pattern `SOCIALS`
 * already uses. A URL that moves is then one variable rather than a code change, and a clone with no
 * `.env.local` still renders the truth rather than an empty link.
 */

import { envOr } from "@/lib/env";

/** One published thing a visitor can reach today. */
export interface FreeArtifact {
  /** Matches a `Combination.framework`, or `cli` for the scaffolder. */
  readonly id: string;
  readonly label: string;
  readonly repo: string;
  /** Only the two packages that are on npm carry this. */
  readonly npm?: string;
}

/*
 * **Every read below is static, and it has to be.** Next inlines `NEXT_PUBLIC_*` by substituting the
 * literal `process.env.NAME` in the source at build time; a computed `process.env[key]` is never
 * substituted, so it is `undefined` in the browser and every link falls back silently. A helper
 * taking the name as a string would have looked tidier and shipped ten dead overrides.
 *
 * It is also the form `pnpm check:env` can verify. That guard reports "11 dynamic process.env reads"
 * as uncovered, and ten more would have been ten keys nothing compares against the templates.
 */

/** The scaffolder and the package a buyer installs, both on npm. */
export const FREE_NPM = {
  package: envOr(
    process.env.NEXT_PUBLIC_FREE_NPM_URL,
    "https://www.npmjs.com/package/@viliha/free-admin-dashboard",
  ),
  cli: envOr(
    process.env.NEXT_PUBLIC_FREE_CLI_NPM_URL,
    "https://www.npmjs.com/package/@viliha/create-free-admin-dashboard",
  ),
} as const;

/**
 * One repository per edition, plus the CLI and the documentation.
 *
 * Listed rather than derived from a template, because the naming is not regular: `reactjs` and
 * `nextjs` carry the `js`, `laravel` and `html` do not, and the CLI and docs repositories are named
 * for what they are rather than for a framework. A generated URL that is wrong for two of eight is
 * worse than eight written down.
 */
export const FREE_REPOS: readonly FreeArtifact[] = [
  {
    id: "react",
    label: "React",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_REACT,
      "https://github.com/myviliha/free-reactjs-admin-dashboard",
    ),
  },
  {
    id: "nextjs",
    label: "Next.js",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_NEXTJS,
      "https://github.com/myviliha/free-nextjs-admin-dashboard",
    ),
  },
  {
    id: "vue",
    label: "Vue",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_VUE,
      "https://github.com/myviliha/free-vuejs-admin-dashboard",
    ),
  },
  {
    id: "angular",
    label: "Angular",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_ANGULAR,
      "https://github.com/myviliha/free-angularjs-admin-dashboard",
    ),
  },
  {
    id: "html",
    label: "HTML",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_HTML,
      "https://github.com/myviliha/free-html-admin-dashboard",
    ),
  },
  {
    id: "laravel",
    label: "Laravel",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_LARAVEL,
      "https://github.com/myviliha/free-laravel-admin-dashboard",
    ),
  },
  {
    id: "cli",
    label: "The scaffolder",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_CLI,
      "https://github.com/myviliha/free-admin-dashboard-cli",
    ),
    npm: FREE_NPM.cli,
  },
  {
    id: "docs",
    label: "The free documentation",
    repo: envOr(
      process.env.NEXT_PUBLIC_FREE_REPO_DOCS,
      "https://github.com/myviliha/free-docs-admin-dashboard",
    ),
  },
];

export const freeRepo = (id: string): FreeArtifact | undefined =>
  FREE_REPOS.find((artifact) => artifact.id === id);
