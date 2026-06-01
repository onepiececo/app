# Alert

Source: [`src/components/ui/alert.tsx`](../../src/components/ui/alert.tsx).

Five semantic tones on a shared button-language surface: box-shadow ring +
inset top bezel + dark-mode gradient fill. The icon, ring, and tinted fill
are all colored per variant.

## Variants

| Variant | Use for |
| --- | --- |
| `default` | Generic info that doesn't map to a semantic color. Neutral tone. |
| `info` | Announcements, new-feature hints, neutral-positive news. Blue. |
| `success` | Post-success confirmations — saved, published, deployed. Green. |
| `warning` | Non-blocking caution — nearing a limit, soft deprecation. Amber. |
| `error` | Failed actions, blocking problems. Red. |

## Parts

- `Alert` — root container. Takes `variant`.
- `AlertTitle` — bold lead line.
- `AlertDescription` — muted body text; sits below the title (or beside the icon via CSS grid).
- `AlertAction` — optional trailing action slot; right-aligned on desktop, wraps below on mobile.

## Scenarios

### 1. Default (generic info)

```tsx
<Alert>
  <Info />
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>
    You can change this setting any time from your account preferences.
  </AlertDescription>
</Alert>
```

### 2. Success — post-action confirmation

```tsx
<Alert variant="success">
  <CheckCircle2 />
  <AlertTitle>Deploy finished</AlertTitle>
  <AlertDescription>
    Production is now running commit a1b2c3d. View logs for details.
  </AlertDescription>
</Alert>
```

### 3. Warning with an action

```tsx
<Alert variant="warning">
  <TriangleAlert />
  <AlertTitle>Usage approaching limit</AlertTitle>
  <AlertDescription>
    You&apos;ve used 82% of your monthly API quota. Consider upgrading your plan.
  </AlertDescription>
  <AlertAction>
    <Button size="sm" variant="outline">Upgrade</Button>
  </AlertAction>
</Alert>
```

### 4. Error — blocking problem

```tsx
<Alert variant="error">
  <CircleAlert />
  <AlertTitle>Could not save changes</AlertTitle>
  <AlertDescription>
    Your session expired. Sign in again and retry.
  </AlertDescription>
</Alert>
```

## Rules of thumb

- Pick the variant by the *outcome* the user needs to react to, not by the color you want. If nothing is on fire, prefer `info` or `default`.
- Always pair the Alert with an icon that matches the variant — `Info` / `CheckCircle2` / `TriangleAlert` / `CircleAlert`. The icon carries half the signal.
- For destructive confirmations, use [`AlertDialog`](./alert-dialog.md) — the Alert component is for messages, not modals.
- Keep `AlertTitle` to one line. Long titles hurt scanability; split detail into the description.
