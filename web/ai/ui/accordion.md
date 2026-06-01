# Accordion

Source: [`src/components/ui/accordion.tsx`](../../src/components/ui/accordion.tsx).
Base UI primitive: [`@base-ui/react/accordion`](https://base-ui.com/react/components/accordion).

Two variants. The icon and the panel-height animation share the same
**260ms `cubic-bezier(.22, .61, .36, 1)`** curve, so the indicator finishes
its motion at the same moment the panel finishes expanding.

## Anatomy

| Base UI part | Project wrapper | Element | Notes |
| --- | --- | --- | --- |
| `Accordion.Root` | `Accordion` | `<div>` | Adds `variant` context (`default` / `plus`). |
| `Accordion.Item` | `AccordionItem` | `<div>` | Adds `border-b last:border-b-0`. |
| `Accordion.Header` | (rendered inside `AccordionTrigger`) | `<h3>` | Wrapped automatically. |
| `Accordion.Trigger` | `AccordionTrigger` | `<button>` | Renders the variant-aware indicator on the right. |
| `Accordion.Panel` | `AccordionPanel` (also exported as `AccordionContent`) | `<div>` | Animates `height` via `--accordion-panel-height`; inner content uses `contentClassName`. |

## API reference

### `Accordion` (Root)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"default" \| "plus"` | `"default"` | Project addition. Picks the indicator. |
| `value` / `defaultValue` | `Value[]` | — | Controlled / uncontrolled expanded items. |
| `onValueChange` | `(value, details) => void` | — | Fires on expand/collapse. |
| `multiple` | `boolean` | `false` | Allow multiple panels open. |
| `disabled` | `boolean` | `false` | Disable the whole group. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Affects keyboard nav. |
| `loopFocus` | `boolean` | `true` | Wrap focus from last to first. |
| `hiddenUntilFound` | `boolean` | `false` | Enable browser find-in-page expansion. |
| `keepMounted` | `boolean` | `false` | Keep closed panels in the DOM. |

Data attrs: `data-orientation`, `data-disabled`.

### `AccordionItem`

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `any` | Unique id for this item; auto-generated if omitted. |
| `disabled` | `boolean` | Disable just this item. |
| `onOpenChange` | `(open, details) => void` | Per-item open callback. |

Data attrs: `data-open`, `data-disabled`, `data-index`.

### `AccordionTrigger`

| Prop | Type | Notes |
| --- | --- | --- |
| `nativeButton` | `boolean` (default `true`) | Toggle native `<button>` semantics. |
| `render` | `ReactElement \| (props, state) => ReactElement` | Replace the rendered element (Base UI's `asChild`). |

Data attrs: `data-panel-open`, `data-disabled`. The project's wrapper exposes a
`group/accordion-trigger` so child indicators can react via
`group-data-panel-open/accordion-trigger:…`.

### `AccordionPanel` / `AccordionContent`

| Prop | Type | Notes |
| --- | --- | --- |
| `hiddenUntilFound` | `boolean` | Per-panel override for find-in-page. |
| `keepMounted` | `boolean` | Per-panel override for DOM retention. |
| `className` | Base UI className | Styles the panel root. |
| `contentClassName` | `string` | Styles the inner padding wrapper. |

Data attrs: `data-open`, `data-orientation`, `data-disabled`, `data-index`,
`data-starting-style`, `data-ending-style`.

CSS vars: `--accordion-panel-height`, `--accordion-panel-width`. The wrapper
already drives `height: var(--accordion-panel-height)` and animates from `0`
on enter/exit — you only need to touch these if you replace the panel chrome.

## Variants

| Variant | Indicator | Use for |
| --- | --- | --- |
| `default` | Chevron rotates 180° on open | Everywhere by default. Clean, familiar, works inside any content block. |
| `plus` | Plus icon rotates 90° and fades out while a minus icon fades in | FAQ sections / marketing pages where the cue should read as "add detail" / "collapse detail". |

Both variants use the same `Accordion` / `AccordionItem` / `AccordionTrigger`
/ `AccordionContent` parts. You pass the variant once on the root.

## Parts

- `Accordion` — root. Accepts `variant`, plus the full Base UI root props (`defaultValue`, `multiple`, etc).
- `AccordionItem` — one row. Accepts `value`.
- `AccordionTrigger` — the clickable header row. Renders the label on the left and the indicator on the right. The indicator is chosen automatically based on `variant`.
- `AccordionContent` (aliased from `AccordionPanel`) — the collapsible body.

## Scenarios

### 1. Default (chevron)

The everyday case — FAQ lists inside a card, settings disclosures, etc.

```tsx
<Accordion defaultValue={["billing"]}>
  <AccordionItem value="billing">
    <AccordionTrigger>How does billing work?</AccordionTrigger>
    <AccordionContent>
      We bill monthly, and you can cancel any time. Annual plans get two months free.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="seats">
    <AccordionTrigger>Can I add more seats later?</AccordionTrigger>
    <AccordionContent>
      Yes. Invite teammates from Settings → Members and we&apos;ll prorate the charge on the current cycle.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 2. Plus / minus

Same markup, different variant. Use when the trigger is communicating
"expand to see more" rather than "navigate a list".

```tsx
<Accordion defaultValue={["billing"]} variant="plus">
  <AccordionItem value="billing">
    <AccordionTrigger>How does billing work?</AccordionTrigger>
    <AccordionContent>
      We bill monthly, and you can cancel any time. Annual plans get two months free.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="security">
    <AccordionTrigger>Is my data encrypted?</AccordionTrigger>
    <AccordionContent>
      All data is encrypted in transit with TLS 1.3 and at rest with AES-256.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 3. Multiple open at once

Pass `multiple` on the root so more than one item can be expanded
simultaneously.

```tsx
<Accordion multiple defaultValue={["billing", "seats"]}>
  {/* items */}
</Accordion>
```

## Rules of thumb

- Default to `variant="default"` unless the content reads as "expand for detail" (FAQs, marketing pages), where `variant="plus"` pairs better with the copy.
- Keep the trigger label short (one line). Long labels fight with the indicator and wrap awkwardly.
- Leave the default timing alone — the 260ms cubic-bezier is shared with panel height so they stay in sync. Changing one without the other breaks the feel.
- Use `className` for the animated panel root and `contentClassName` for the inner content wrapper.
