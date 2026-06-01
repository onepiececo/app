# Toggle

Source: [`src/components/ui/toggle.tsx`](../../src/components/ui/toggle.tsx).
Base UI primitives: [Toggle](https://base-ui.com/react/components/toggle)
(`@base-ui/react/toggle`) +
[Toggle Group](https://base-ui.com/react/components/toggle-group)
(`@base-ui/react/toggle-group`).

## Anatomy

Both base-ui primitives are single-part — they render a `<button>` (Toggle)
and a focus-managing wrapper (ToggleGroup) respectively.

```
ToggleGroup        // optional — wraps related toggles, manages value[]
└── Toggle / ToggleGroupItem   // press-and-hold button with data-pressed
```

## API reference

### `Toggle`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `pressed` | `boolean` | — | Controlled state. |
| `defaultPressed` | `boolean` | `false` | Uncontrolled initial. |
| `onPressedChange` | `(pressed, eventDetails) => void` | — | Fires on toggle. |
| `disabled` | `boolean` | `false` | |
| `value` | `string` | — | Identity inside a `ToggleGroup`. |
| `render` | `ReactElement \| (props, state) => ReactElement` | — | Replace the underlying element. |
| `nativeButton` | `boolean` | `true` | Set `false` if `render` is a non-button. |

**Data attributes:** `data-pressed` (when on), `data-disabled`.

### `ToggleGroup`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | — | Controlled. **Always an array, even single-select.** |
| `defaultValue` | `readonly string[]` | — | Uncontrolled initial. |
| `onValueChange` | `(value: string[], eventDetails) => void` | — | |
| `multiple` | `boolean` | `false` | **Replaces Radix's `type="multiple"`.** When `true`, any subset can be on. |
| `disabled` | `boolean` | `false` | Disables every item. |
| `loopFocus` | `boolean` | `true` | Wraps arrow-key focus at the edges. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | |
| `render` | `ReactElement \| function` | — | |

**Data attributes:** `data-orientation`, `data-disabled`, `data-multiple`.

A press-and-hold button with a persistent on/off state. Mirrors
`Button`'s variant API (`default` / `secondary` / `ghost`) and adds
an inset depression on the pressed state — so the button visibly
"sinks in" when on. Use Toggle for editor toolbars (Bold / Italic /
Underline), inline filter chips, and any other "this control is
in the on state" affordance.

When you have a related set of toggles where 0 / 1 / many can be on
simultaneously, group them with `ToggleGroup` (which lives in the
same file).

## Parts

- `Toggle` — single press-and-hold button. Pass `pressed` /
  `onPressedChange` for controlled state, or `defaultPressed` for
  uncontrolled.
- `ToggleGroup` — wrapper for grouped toggles. Accepts `value` /
  `onValueChange` / `defaultValue` (always arrays — even for
  single-select use `defaultValue={["day"]}`). Auto-applies its
  `variant` / `size` to all `ToggleGroupItem` children via context.
- `ToggleGroupItem` — a toggle inside a `ToggleGroup`. Inherits the
  group's `variant` / `size` unless overridden. Pass `value` to
  identify the item.
- `toggleVariants` — exported `cva` for composing the toggle chrome
  onto a non-toggle element (rare).
- `TogglePrimitive` / `ToggleGroupPrimitive` — re-exports of the
  base-ui primitives.

## Variants

| Variant | Use for |
| --- | --- |
| `ghost` (default) | Editor toolbars, inline icon toggles. Transparent at idle, `bg-accent` hover, `foreground/8` + inset depression when pressed. |
| `secondary` | Segmented controls, settings panels. Always shows the secondary-button chrome (tinted gradient + ring + bezel). Pressed state adds inset depression so the button looks pushed in. |
| `default` | High-emphasis on/off — recording, on-air, dangerous mode. Always primary-fill. Pressed darkens via `brightness-90` + inset depression. |

## Sizes

`sm` (28/32px) / `default` (32/36px) / `lg` (36/40px) — matches Button's
size scale at the small end.

## Scenarios

### 1. Editor toolbar (ghost, controlled)

```tsx
const [pressed, setPressed] = useState({ b: false, i: true, u: false });

<div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
  <Toggle aria-label="Bold" pressed={pressed.b} onPressedChange={(v) => setPressed((p) => ({ ...p, b: v }))}>
    <BoldIcon />
  </Toggle>
  <Toggle aria-label="Italic" pressed={pressed.i} onPressedChange={(v) => setPressed((p) => ({ ...p, i: v }))}>
    <ItalicIcon />
  </Toggle>
  <Toggle aria-label="Underline" pressed={pressed.u} onPressedChange={(v) => setPressed((p) => ({ ...p, u: v }))}>
    <UnderlineIcon />
  </Toggle>
</div>
```

### 2. Single-select segmented control (ToggleGroup, secondary)

```tsx
<ToggleGroup defaultValue={["week"]} variant="secondary">
  <ToggleGroupItem value="day">Day</ToggleGroupItem>
  <ToggleGroupItem value="week">Week</ToggleGroupItem>
  <ToggleGroupItem value="month">Month</ToggleGroupItem>
</ToggleGroup>
```

`defaultValue` is **always an array**, even when only one item can
be selected at a time. base-ui ensures only one is on for
`type="single"` (which is the default behavior when each item value
is unique).

### 3. Multi-select group (any subset on)

```tsx
const [tags, setTags] = useState<string[]>(["news"]);

<ToggleGroup value={tags} onValueChange={setTags}>
  <ToggleGroupItem value="news">News</ToggleGroupItem>
  <ToggleGroupItem value="updates">Updates</ToggleGroupItem>
  <ToggleGroupItem value="tips">Tips</ToggleGroupItem>
</ToggleGroup>
```

### 4. High-emphasis toggle (primary)

```tsx
const [recording, setRecording] = useState(false);

<Toggle
  variant="default"
  pressed={recording}
  onPressedChange={setRecording}
  aria-label={recording ? "Stop recording" : "Start recording"}
>
  <CircleIcon />
  {recording ? "Recording" : "Record"}
</Toggle>
```

### 5. Sized variants

```tsx
<Toggle size="sm">Sm</Toggle>
<Toggle>Default</Toggle>
<Toggle size="lg">Lg</Toggle>
```

### 6. Vertical group

```tsx
<ToggleGroup orientation="vertical" defaultValue={["asc"]} variant="secondary">
  <ToggleGroupItem value="asc">Ascending</ToggleGroupItem>
  <ToggleGroupItem value="desc">Descending</ToggleGroupItem>
</ToggleGroup>
```

### 7. Inside a Field

```tsx
<Field>
  <FieldLabel>Visibility</FieldLabel>
  <ToggleGroup defaultValue={["public"]} variant="secondary">
    <ToggleGroupItem value="public">Public</ToggleGroupItem>
    <ToggleGroupItem value="unlisted">Unlisted</ToggleGroupItem>
    <ToggleGroupItem value="private">Private</ToggleGroupItem>
  </ToggleGroup>
</Field>
```

## Pitfalls

- **`pressed` (boolean) for `Toggle`, `value` (array) for
  `ToggleGroup`.** Don't mix them — Toggle's controlled state is a
  boolean, ToggleGroup's is always an array (even for single-select).
- **`defaultValue={["day"]}` not `defaultValue="day"`.** ToggleGroup's
  value prop is `readonly string[]`. Bare strings type-error.
- **The press-state animation does not scale on `:active` while
  pressed.** Idle state scales to `0.96` on press; pressed state stays
  at `1.0` so the button doesn't bounce when you click an already-on
  toggle. The inset depression is the visual feedback instead.
- **`ghost` is the default variant** because it's the most common —
  editor toolbars are ghost. If you want a segmented control, set
  `variant="secondary"` explicitly.
- **Don't reach for Toggle for one-off settings.** A single
  always-on/always-off setting belongs to `Switch`. Toggle is for
  buttons whose **on state is part of the surface composition**
  (toolbars, filter chips, segmented selects).

## Rules of thumb

- **Editor toolbars** → `ghost` Toggle.
- **Segmented controls** (one of N) → `ToggleGroup variant="secondary"`.
- **High-signal binary toggles** (recording, broadcasting, danger
  mode) → `default` (primary-filled) Toggle.
- **Switch vs Toggle**: Switch for inline settings rows where the
  on/off state is the *only* thing the row does. Toggle for buttons
  that do an action AND have an on/off state (editor commands,
  filter chips).
- **Always pair icon-only Toggles with `aria-label`**, or wrap with
  a Tooltip — the icon alone doesn't announce.
