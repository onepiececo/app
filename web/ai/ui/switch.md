# Switch

Source: [`src/components/ui/switch.tsx`](../../src/components/ui/switch.tsx).
Base UI primitive: [Switch](https://base-ui.com/react/components/switch).

A 34×20px pill toggle for binary on/off settings that **apply
immediately** (no submit step). Off track is a flat tinted gray
(`foreground/18`). On track is the primary fill with the same Button
gradient + ring + bevel as `Radio` checked / `Checkbox` checked.
The thumb stretches horizontally on hover (16 → 18px) and squashes
vertically on press (16 → 12×20px) for a tactile feel.

## Anatomy

```
SwitchPrimitive.Root      (the track + interactive button)
└── SwitchPrimitive.Thumb (the sliding knob)
```

Our `Switch` is a single component that renders both parts inline.

## Parts

- `Switch` — the entire control. Renders the track, thumb, all states.
- `SwitchPrimitive` — re-export of `@base-ui/react/switch`.

## API reference (Base UI)

### `SwitchPrimitive.Root` props

| Prop | Type | Default |
| --- | --- | --- |
| `checked` / `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked, eventDetails) => void` | — |
| `name` | `string` | — |
| `value` / `uncheckedValue` | `string` | — |
| `form` | `string` | — |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `nativeButton` | `boolean` | `false` |
| `inputRef` | `Ref<HTMLInputElement>` | — |

### Data attributes (Root + Thumb)

`data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`,
`data-required`, `data-valid`, `data-invalid`, `data-dirty`,
`data-touched`, `data-filled`, `data-focused`. We key the on/off track
styling off `data-checked` / `data-unchecked` and the thumb translate
off the parent's checked state via `group-data-checked/switch:`.

## Scenarios

### 1. Standalone

```tsx
<div className="flex items-center gap-2">
  <Switch id="telemetry" defaultChecked />
  <Label htmlFor="telemetry" className="font-normal">Send anonymous usage data</Label>
</div>
```

### 2. Controlled

```tsx
const [enabled, setEnabled] = useState(true);

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### 3. Settings row (label + description on the left, switch on the right)

```tsx
<label className="flex items-center justify-between gap-3 py-2">
  <span className="flex flex-col">
    <span className="text-sm">Notifications</span>
    <span className="text-xs text-muted-foreground">Push, email, in-app.</span>
  </span>
  <Switch defaultChecked />
</label>
```

### 4. Inside a Drawer / Popover settings panel

```tsx
<DrawerPopup showBar>
  <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
    <DrawerContent>
      <DrawerTitle>Settings</DrawerTitle>
    </DrawerContent>
  </DrawerHeader>
  <div className="flex flex-col gap-1 px-6 pb-6">
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>Dark mode</span>
      <Switch />
    </label>
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>Marketing</span>
      <Switch defaultChecked />
    </label>
  </div>
</DrawerPopup>
```

### 5. Disabled

```tsx
<Switch disabled />
<Switch defaultChecked disabled />
```

50% opacity, `cursor-not-allowed`, no press scale.

## Pitfalls

- **Switch is for "applies immediately" booleans.** Any toggle that
  needs a Save button should be a `Checkbox` — the affordance is
  different.
- **Don't put a Switch inside a Form that requires submit.** If the
  user has to press a button for the change to take effect, the
  Switch's "instant" affordance is a lie. Use Checkbox.
- **The thumb's hover / press shape changes are intentional** —
  removing them flattens the tactile feel. Override with care.

## Rules of thumb

- **Single setting in a panel?** Switch.
- **Many independent toggles in a list (filters, permissions, tag
  selection)?** Checkbox.
- **One choice from a small set?** RadioGroup or `ToggleGroup`.
- **Always pair with a `Label`** that describes the *positive* state
  ("Enable telemetry", not "Telemetry on/off").
- **Switch + a "save" button is a code smell.** Either the toggle is
  instant (Switch alone) or it's part of a form (Checkbox).
