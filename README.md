# Voilet storefront

The home page of the Voilet store: the prompt card, the conversation it opens, and the marketing
sections under it. Next.js 16, React 19, Tailwind 4, TypeScript.

## Run it

```bash
npm install          # or pnpm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start
npm run check-types
```

Node 20 or newer.

## What is in here

```
app/
  page.tsx            the home page: <Conversation> wrapping nine sections
  layout.tsx          the shell: rail, top bar, footer
  globals.css         the whole stylesheet, tokens first then base rules
  _components/        every section and control, one file each
  _vendor/            three files copied in from our internal packages (see below)
```

**`app/_components` is the work.** Each file opens with a docblock saying what it is, which
measurements it is built from and why anything surprising is the way it is. Read that before
changing a value: most numbers here were measured off a reference rather than chosen, and the
comment says which.

The pieces, roughly in the order a reader meets them:

| File | What it is |
| --- | --- |
| `rail.tsx` | The left navigation. 192px open, 60px collapsed, and the 60 is arithmetic so the icons do not move |
| `topbar.tsx` | Search, sign in, Pricing |
| `hero.tsx` | The opening screen: eyebrow, headline, two lines, the prompt card |
| `composer.tsx` | The prompt card and its four menus. Shared by the hero and the thread |
| `menu.tsx` | The panel those menus are drawn in, plus its rows, groups and search field |
| `model-picker.tsx`, `models.ts` | The model and agent list. **`models.ts` is mock data** and says so |
| `conversation.tsx` | Swaps the hero for the thread when a prompt is sent |
| `thread.tsx` | The conversation. The reply is written in this file; there is no backend yet |
| `search.tsx`, `gallery.tsx`, `how.tsx`, `outputs.tsx`, `proof.tsx`, `capabilities.tsx`, `faq.tsx`, `closing.tsx` | The marketing sections, top to bottom |
| `type.ts` | The class strings every section shares, so a size changes in one place |

## Two things to know before you change anything

**1. Nothing here talks to a server.** No API, no upload, no auth. `thread.tsx` writes its own
reply, `models.ts` is a mock catalogue, and attached files are previewed from a local `blob:` URL
and go nowhere. Where a control would normally promise a round trip, the code says in a comment
that it does not. Please keep that: a button that looks like it works and does not is the thing
this screen has been built to avoid.

**2. Colour, type and spacing come from tokens, not from values.** They are declared in
`app/_vendor/store.css` as `--store-*` and used as `var(--store-primary-40)`,
`text-[length:var(--store-body-2)]` and so on. Use the token. A raw hex or a stray `14px` is the
one thing we will send back in review.

## `app/_vendor`

Three files copied out of our internal packages so this project stands alone:

| File | Came from |
| --- | --- |
| `icons.tsx` | `@viliha/vui-react/icons`, a named re-export of `@radix-ui/react-icons` |
| `voilet-wordmark.tsx` | `@repo/web-chrome`. The V is drawn, so the wordmark is a component |
| `store.css` | `@viliha/vui-tokens/store.css`, the token contract |

**Treat these as read-only.** They are maintained upstream; a change made here is lost on the next
hand-off. If one of them is wrong or missing something, say so and we will change it at the source.

## Sending work back

A patch or a branch against this folder is fine. Keep the docblocks current: if you change a number
that a comment explains, change the comment in the same edit.
