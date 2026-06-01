# Base UI Providers

Sources:

- <https://base-ui.com/react/utils/csp-provider.md>
- <https://base-ui.com/react/utils/direction-provider.md>

## CSPProvider

`CSPProvider` configures nonce behavior for inline `<style>` and `<script>` tags rendered by Base UI components.

Use it when the app enforces a strict Content Security Policy that blocks inline tags by default.

```tsx
import { CSPProvider } from "@base-ui/react/csp-provider";

<CSPProvider nonce={nonce}>{children}</CSPProvider>
```

### Notes

- Generate a new nonce per request.
- Include it in the CSP header, e.g. `script-src 'self' 'nonce-...'` and `style-src-elem 'self' 'nonce-...'`.
- Pass the same nonce to `CSPProvider` during render.
- `disableStyleElements` removes Base UI inline style elements, but then required styles must be provided externally.
- This does not cover inline `style="..."` attributes. Those are controlled by CSP `style-src-attr`.

## DirectionProvider

`DirectionProvider` enables RTL behavior inside Base UI components.

```tsx
import { DirectionProvider } from "@base-ui/react/direction-provider";

<div dir="rtl">
  <DirectionProvider direction="rtl">{children}</DirectionProvider>
</div>
```

### Notes

- `DirectionProvider` affects Base UI component behavior only.
- It does not set HTML direction or CSS direction by itself.
- Also set `dir="rtl"` or CSS `direction: rtl` in app markup.
- `useDirection()` reads the current Base UI direction and is useful for portaled UI.
