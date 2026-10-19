# Styling

Theme, color, and shape — make every toast look the way you want.

[← README](../README.md) · [Installation](./installation.md) · [Usage](./usage.md) · **Styling** · [Animations](./animations.md) · [API reference](./api-reference.md)

---

## Theming: light, dark, or auto

The toast **contrasts** with your app theme, so it always stands out:

```tsx
<ToastProvider theme="dark" />    // dark app → light toast
<ToastProvider theme="light" />   // light app → dark toast
<ToastProvider />                 // auto: follows useColorScheme()
```

`theme` describes your app's scheme (omit it to auto-detect). The built-in presets are exported as
`LIGHT_THEME` (light toast) and `DARK_THEME` (dark toast).

## Full theme object

For full control, pass a partial object — only the keys you set are overridden:

```tsx
<ToastProvider
  theme={{
    colors: { success: '#22c55e', error: '#ef4444' },   // icon / accent colors
    surfaceColors: { success: '#0f1a12' },              // card background per tone
    surfaceStrokeColors: { default: 'rgba(255,255,255,0.1)' },
    badgeBgColors: { info: 'rgba(0,166,244,0.2)' },
    actionColors: { success: 'rgba(58,197,48,0.15)' },
    actionTextColors: { success: '#3ac530' },
    textColors: { default: 'rgba(255,255,255,0.5)' },
    metaTextColors: { default: 'rgba(255,255,255,0.4)' },
  }}
/>
```

Every key is `Partial<Record<Tone, string>>` where `Tone` is one of `default | success | error |
warning | info`.

| Theme key | What it colors |
| --- | --- |
| `colors` | Icon and accent color. |
| `surfaceColors` | Card background. |
| `surfaceStrokeColors` | Card outline. |
| `badgeBgColors` | Tinted badge behind the icon. |
| `actionColors` | Action button background. |
| `actionTextColors` | Action button label. |
| `textColors` | Body / description text. |
| `metaTextColors` | Timestamp / meta text. |

Because `textColors` / `metaTextColors` set the body and timestamp color, the text always contrasts
with the surface — no manual `textColor` needed.

## Per-toast color overrides

```tsx
toast.success('Saved', {
  fill: '#FFFFFF',
  stroke: 'rgba(0,0,0,0.08)',
  textColor: '#000000b3',
});
```

`fill` / `stroke` / `textColor` override the active theme for a single toast. When omitted they
fall back to `theme.surfaceColors`, `theme.surfaceStrokeColors`, and `theme.textColors` for the
toast's tone.

## Shape

```tsx
toast.success('Saved', {
  bodyRadius: 26,        // corner radius of the expanded card (default 16)
  cornerSmoothing: 1,    // 0 = circular corners, 1 = squircle
  bodyLayout: 'center',  // 'spread' | 'left' | 'center' | 'right'
  expandedWidth: 320,    // fixed card width (default: automatic)
  expandedHeight: 120,   // fixed card height (default: automatic)
});
```

- `bodyRadius` — radius of the expanded card's corners.
- `cornerSmoothing` — blends the pill and card fillets. `0` is a circle, `1` is a smooth squircle.
- `bodyLayout` — alignment of the body block under the header.
- `expandedWidth` / `expandedHeight` — force a fixed card size instead of auto-sizing to content.

## Per-part style overrides

The `styles` option accepts a map of `StyleProp` overrides for every named part:

```tsx
toast.info('Deploying', {
  styles: {
    container: { marginTop: 8 },
    title: { fontWeight: '700' },
    description: { color: 'rgba(0,0,0,0.7)' },
    action: { backgroundColor: '#00000014' },
    actionText: { fontSize: 13 },
    progressFill: { backgroundColor: '#3ac530' },
  },
});
```

| Key | Part |
| --- | --- |
| `container` | The outer card shell. |
| `content` | The content column. |
| `header` | The pill header row. |
| `badge` | The tinted icon badge. |
| `title` | The title text. |
| `body` | The body block. |
| `description` | The description text. |
| `meta` | The timestamp / meta text. |
| `action` | The action button. |
| `actionText` | The action button label. |
| `progressTrack` | The progress bar track. |
| `progressFill` | The progress bar fill. |

These can be set app-wide on `<ToastProvider styles={...} />` and overridden per toast.

**← Previous:** [Usage](./usage.md) · **Next:** [Animations →](./animations.md)
