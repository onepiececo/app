# Textarea

Source: [`src/components/ui/textarea.tsx`](../../src/components/ui/textarea.tsx).

Multi-line text control. Shares the [`Input`](./input.md) surface
chrome via `inputSurfaceVariants`, so it reads as one family with every
other secondary-surface control (Input, Select trigger, Combobox).

Uses `field-sizing: content` so the textarea auto-grows with its value
(no manual resize handle in the lower-right corner).

## Parts

- `Textarea` — renders a `<span>` wrapper (owns the chrome) containing
  a `<textarea>` via `FieldPrimitive.Control` (for Field integration).
- Accepts standard `<textarea>` props — `value`, `defaultValue`,
  `disabled`, `required`, `maxLength`, `rows`, etc.
- Takes `size` (`sm` / `default` / `lg` / `number`) and `unstyled`
  (strip wrapper chrome for use inside `InputGroup`).

## Scenarios

### 1. Basic

```tsx
<Field>
  <FieldLabel>Bio</FieldLabel>
  <Textarea placeholder="Tell us about yourself…" />
</Field>
```

### 2. With help text + counter

```tsx
<Field>
  <FieldLabel>Bio</FieldLabel>
  <Textarea maxLength={240} />
  <FieldDescription>Up to 240 characters.</FieldDescription>
</Field>
```

### 3. Auto-growing (default)

Because the textarea uses `field-sizing: content`, the element grows
from its `min-h` as the user types — no JS, no `rows` management.

```tsx
<Textarea placeholder="Start typing…" />
```

Override the minimum height via `size` — `sm`, `default`, `lg`.

### 4. Inside an `InputGroup` with a block-aligned toolbar

```tsx
<InputGroup>
  <Textarea unstyled placeholder="Comment…" />
  <InputGroupAddon align="block-end" className="border-t">
    <Button size="xs" variant="ghost">B</Button>
    <Button size="xs" variant="ghost">I</Button>
    <Button size="xs" variant="ghost">U</Button>
  </InputGroupAddon>
</InputGroup>
```

`block-end` stacks the addon below the textarea; `block-start` puts it
above. Both turn the `InputGroup`'s flex into `flex-col` automatically.

## Rules of thumb

- **Always inside Field** for labeled usage.
- **Don't set explicit `rows`** — let `field-sizing: content` drive the
  height unless you specifically need a fixed initial size.
- **`unstyled` only inside `InputGroup`** — otherwise you lose the
  focus / invalid / disabled chrome.
