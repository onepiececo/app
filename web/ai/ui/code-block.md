# CodeBlock

Source: [`src/components/ui/code-block.tsx`](../../src/components/ui/code-block.tsx)
(server) + [`src/components/ui/code-block-chrome.tsx`](../../src/components/ui/code-block-chrome.tsx)
(client chrome).

A syntax-highlighted code surface. Highlighting runs at request time on the
server via [Shiki](https://shiki.style); the chrome (tabs / select picker /
copy button) hydrates on the client. Three display modes are supported via a
single `CodeBlock` component — pick the one that matches your data shape.

The client chrome exports `codeBlockChromeVariants`, a slot-based
`tailwind-variants` recipe for the header, tabs, select rows, code area, copy
button, and icon slots (`iconLanguage`, `iconFallback`, `iconTab`,
`iconSelect`, `iconCopy`).

The chrome keeps a module-level `codeBlockChromeStyles` instance for static
slots so helpers like language icons and copy icons do not recreate the slot
map on every render.

## Why a server component?

Shiki ships TextMate grammars + VSCode themes and tokenizes code into HTML.
Doing that in the browser would mean shipping ~MB of grammars and themes to
every visitor and paying tokenization cost on every navigation. By marking
`CodeBlock` `async` and calling `codeToHtml` on the server, the visitor only
receives the final HTML string — no Shiki bundle, no client-side
tokenization.

The trade-off is that the highlighter can't react to client state (you can't
swap themes per-user without a re-fetch). For our use cases — docs, examples,
README-style snippets — that's the right trade.

## Theme

We use Shiki's **dual-theme** mode with the Catppuccin pair:

```ts
const THEMES = {
  light: "catppuccin-latte",
  dark:  "catppuccin-mocha",
};
```

Shiki emits `style="--shiki: …; --shiki-dark: …"` on every token. A rule in
`src/styles/globals.css` switches to the dark variant when the `<html>`
element carries the `.dark` class:

```css
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
```

This lets a single rendered HTML string serve both light and dark mode
without re-running the highlighter.

The Shiki-emitted background is stripped via a `pre()` transformer
(`!bg-transparent`) so our own `BODY_BG` (`bg-neutral-100 dark:bg-neutral-900`)
shows through. Header chrome uses a `bg-popover`-derived gradient so it
reads as a separate surface from the code area.

## Props

`CodeBlock`'s prop type is a discriminated union — `code`/`lang`/`filename`
for single-snippet mode, or `tabs[]` for multi-snippet mode.

### Single snippet

```tsx
type SingleProps = {
  code: string;
  lang: string;     // any Shiki language id — "tsx", "py", "rust", "bash", …
  filename: string; // shown in the header
  className?: string;
};
```

Renders the **filename-only** chrome (header shows the filename, no tabs).

### Multi snippet

```tsx
type MultiProps = {
  tabs: Array<{ label: string; code: string; lang: string }>;
  filename?: string;            // optional — moves tabs to the right
  picker?: "tabs" | "select";   // default "tabs"
  className?: string;
};
```

- `picker="tabs"` (default): inline tab buttons with a motion `layoutId`
  active-pill indicator. Best for **2–4 snippets**.
- `picker="select"`: the active tab opens a Select popup of all snippets.
  Best when there are many snippets, or when one filename per snippet would
  overwhelm the header.
- Pass `filename` alongside `picker="tabs"` to get the **filename-on-the-left,
  tabs-on-the-right** layout.

## Scenarios

### 1. Single file with filename header

```tsx
<CodeBlock
  filename="components/ui/counter.tsx"
  lang="tsx"
  code={`export const Counter = () => …`}
/>
```

### 2. Tabs, no filename (e.g. "TS / JS / Bash" example)

```tsx
<CodeBlock
  tabs={[
    { label: "TypeScript", lang: "tsx",  code: tsSample },
    { label: "JavaScript", lang: "js",   code: jsSample },
    { label: "Shell",      lang: "bash", code: shSample },
  ]}
/>
```

### 3. Tabs with leading filename

```tsx
<CodeBlock
  filename="components/ui/counter.tsx"
  tabs={[
    { label: "Source", lang: "tsx", code: src },
    { label: "Test",   lang: "tsx", code: test },
  ]}
/>
```

### 4. Many snippets — Select picker

```tsx
<CodeBlock
  picker="select"
  tabs={files.map((f) => ({ label: f.name, lang: f.lang, code: f.body }))}
/>
```

The trigger shows the active filename + its language icon; the popup lists
all snippets with their icons.

## Language icons

The chrome maps `lang` to a small brand-colored SVG badge (TS, JS, Py, Rs, Go,
HTML, CSS, JSON, MD, SQL) plus a terminal glyph for shell variants
(`sh` / `bash` / `zsh`). Unknown languages fall back to a neutral
`FileCode` glyph. To add a language, update the `languageBadge()` switch in
`code-block-chrome.tsx`.

## Shiki transformer hooks

Two transformers ship by default:

```ts
pre(node)  → adds "!bg-transparent" so our card bg shows through, and tags
             the <pre> with data-line-numbers="" (for opt-in numbering CSS).
line(node) → tags every line with data-line="" so the counter rule in
             globals.css can address it.
```

Line numbers themselves are **disabled** in the chrome via
`[&_.shiki[data-line-numbers]_[data-line]::before]:hidden`. To re-enable
them, drop that selector from `CodeArea` and the counter rule in
`globals.css` will take over. (We disable by default because they fight with
the narrow code surface in sidebars / cards.)

## Pitfalls

- **`lang` must be a Shiki-recognized id.** "typescript" works, "TypeScript"
  doesn't. Use lowercase. Unknown languages throw at render time — wrap in a
  try/catch on the call site if you accept user-supplied input.
- **Don't put `<CodeBlock>` inside a Client Component.** It's `async` —
  Client Components can't render server `async` components directly. Render
  it from a Server Component (page / layout) and pass the result down via
  `children` if you need to embed it in client UI.
- **The `tabs` array is keyed by `label`.** Two tabs with the same label
  collide — give them unique labels (filenames usually are unique enough).
- **Snippets are highlighted once at request time.** If you need a streamed
  / real-time editing surface, this is the wrong primitive — reach for a
  client-side highlighter (e.g. a Shiki worker) instead.

## Rules of thumb

- **One snippet, no header needed** → use `<pre>` with the `font-mono` body
  styles directly; `CodeBlock` is overkill for inline snippets.
- **One snippet with filename context** → single-prop form.
- **2–4 related snippets** (TS/JS, npm/yarn/pnpm/bun) → `picker="tabs"`.
- **5+ snippets** or **per-file in a generated example** →
  `picker="select"`.
- **Mixing a "this file" header with tab-switchable variants of it** →
  `filename` + `tabs` (tabs land on the right).
