# API reference

Every option, prop, and export, in one place.

[← README](../README.md) · [Installation](./installation.md) · [Usage](./usage.md) · [Styling](./styling.md) · [Animations](./animations.md) · **API reference**

---

## `toast`

| Call | Returns | Notes |
| --- | --- | --- |
| `toast(title, options?)` | `id` | default tone |
| `toast.success(title, options?)` | `id` | success tone |
| `toast.error(title, options?)` | `id` | error tone (shakes on arrival) |
| `toast.warning(title, options?)` | `id` | warning tone |
| `toast.info(title, options?)` | `id` | info tone |
| `toast.promise(promise, data)` | `id` | loading → success/error |
| `toast.custom(content, options?)` | `id` | fully custom body |
| `toast.update(id, options)` | `boolean` | `true` if the toast exists |
| `toast.isActive(id)` | `boolean` | `true` while the toast is showing |
| `toast.dismiss(id)` | — | remove one toast |
| `toast.dismissAll()` | — | remove all toasts |

## Toast options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | auto | Stable id. Re-using it replaces that toast. |
| `title` | `string` | — | The pill title. |
| `description` | `string` | — | Body text; grows the pill into a card. |
| `type` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Tone (color + icon). |
| `action` | `{ label; onPress }` | — | Primary button; fires `onPress` then dismisses. |
| `secondaryAction` | `{ label; onPress }` | — | Ghost button beside `action`. |
| `duration` | `number` (ms) | `6000` | Auto-dismiss delay. |
| `dismissible` | `boolean` | `true` | Allow tap / swipe dismissal. |
| `position` | `'top-left' … 'bottom-right'` or `'top' \| 'bottom'` | provider | Override for this toast. |
| `icon` | `ReactNode` | tone icon | Replace the leading icon. |
| `showIcon` | `boolean` | `true` | Hide the icon. |
| `showIconBadge` | `boolean` | `true` | Hide the tinted badge behind the icon. |
| `showProgress` | `boolean` | provider (`true`) | Progress bar. |
| `showTimestamp` | `boolean` | provider (`true`) | Timestamp / meta. |
| `meta` | `string` | — | Replaces the timestamp with custom text. |
| `fill` | `string` | theme surface | Card fill color. |
| `stroke` | `string` | theme stroke | Card outline color. |
| `textColor` | `string` | theme text | Body text color. |
| `bodyLayout` | `'spread' \| 'left' \| 'center' \| 'right'` | `'spread'` | Alignment of the body block. |
| `bodyRadius` | `number` | `16` | Corner radius of the expanded card. |
| `cornerSmoothing` | `number` (0–1) | `0` | `0` = circular corners, `1` = squircle. |
| `expandedWidth` | `number` | automatic | Fixed card width. |
| `expandedHeight` | `number` | automatic | Fixed card height. |
| `animationPreset` | `'smooth' \| 'snappy' \| 'gentle' \| 'minimal'` | `'smooth'` | Motion preset. |
| `animation` | `object` | from preset | Fine-grained animation overrides. |
| `springConfig` | `{ damping; stiffness; mass }` | — | Applied to every spring. |
| `timing` | `{ displayDuration; expandDuration; collapseDuration }` | — | Timing overrides. |
| `styles` | style map | — | Per-part style overrides. |
| `content` | `ReactNode` | — | Custom body (via `toast.custom`). |
| `headerContent` | `ReactNode` | — | Custom header content. |
| `showHeader` | `boolean` | `true` | Hide the header entirely. |
| `isLoading` | `boolean` | `false` | Pending state (used by `promise`). |
| `onDismiss` | `() => void` | — | Called when the toast starts dismissing. |
| `onAutoClose` | `() => void` | — | Called when the auto-dismiss timer fires. |

### `styles` keys

`container`, `content`, `header`, `badge`, `title`, `body`, `description`, `meta`, `action`,
`actionText`, `progressTrack`, `progressFill`.

## `toast.promise` data

```tsx
toast.promise(promise, {
  loading: string,
  success: string | ((result) => string),
  error: string | ((error) => string),
  description?: {
    loading?: string,
    success?: string | ((result) => string),
    error?: string | ((error) => string),
  },
  action?: {
    success?: { label; onPress },
    error?: { label; onPress },
  },
  icon?: {
    loading?: ReactNode,
    success?: ReactNode,
    error?: ReactNode,
  },
  // …plus any toast option
});
```

## `<ToastProvider>` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'stack' \| 'morph'` | `'stack'` | Pile & fan out, or one toast per position. |
| `position` | `'top-left' … 'bottom-right'` | `'top-center'` | Where toasts appear. |
| `duration` | `number` (ms) | `6000` | Default auto-dismiss delay. |
| `visibleToasts` | `number` | `3` | How many stacked toasts are rendered. |
| `gap` | `number` | `12` | Space between stacked toasts. |
| `offset` | `number` or `{ top; right; bottom; left }` | `12` | Distance from the safe-area edge. |
| `horizontalInset` | `number` | `12` | Distance from the horizontal edges. |
| `expand` | `boolean` | `false` | Start stacks fanned out. |
| `groupDuplicates` | `boolean` | `true` | Collapse identical simple toasts into one. |
| `reduceMotion` | `boolean` | auto | Force reduced motion on/off (default: follow system). |
| `swipeToDismiss` | `boolean` | `true` | Enable swipe to dismiss. |
| `swipeThreshold` | `number` | `45` | Pixels before a swipe counts as a dismiss. |
| `showProgress` | `boolean` | `true` | Show progress bars by default. |
| `showTimestamp` | `boolean` | `true` | Show timestamps by default. |
| `theme` | `'light' \| 'dark' \| theme object` | auto | App scheme or color overrides. |
| `insets` | `{ top; bottom }` | — | Only needed without `safe-area-context`. |

The provider also accepts **any toast option** as a default for every toast.

## Exports

**Runtime:** `toast`, `ToastProvider`.

**Enums:** `ToastType`, `ToastPosition`, `ToastMode`, `ToastAnimationPreset`, `ToastBodyLayout`,
`ToastVerticalPosition`.

**Icons:** `SuccessIcon`, `ErrorIcon`, `WarningIcon`, `InfoIcon`, `DefaultIcon`, `SpinnerIcon`.

**Themes & presets:** `DEFAULT_THEME`, `LIGHT_THEME`, `DARK_THEME`, `toastAnimationPresets`.

**Types:** `IToastOptions`, `IToastProviderProps`, `IToastPromiseData`, `IToastOffset`,
`IToastAction`, `IToastTheme`, `IToastStyleOverrides`, `IToastAnimationConfig`, and more.

## Compatibility

| | Supported |
| --- | --- |
| React Native | 0.74+ recommended (0.72+ works) |
| Architecture | New Architecture (Reanimated 4), or old architecture with Reanimated 3 |
| Reanimated | 3.6+ and 4.x |
| react-native-svg | 13+ |
| Expo | optional, works in Expo Go and dev builds |
| Web | not a target |

---

**← Previous:** [Animations](./animations.md)
