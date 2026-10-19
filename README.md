<div align="center">

<img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/cover.png" width="100%" alt="Toastify Lite: morphing toasts for React Native" />

# react-native-toastify-lite

**Morphing toast notifications for React Native.**<br />
A pill that springs open into a card. iOS and Android. No Expo needed.

[![npm version](https://img.shields.io/npm/v/react-native-toastify-lite?style=flat-square&color=111)](https://www.npmjs.com/package/react-native-toastify-lite)
[![npm downloads](https://img.shields.io/npm/dm/react-native-toastify-lite?style=flat-square&color=111)](https://www.npmjs.com/package/react-native-toastify-lite)
![platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-111?style=flat-square)
![types](https://img.shields.io/badge/types-TypeScript-111?style=flat-square)
[![license](https://img.shields.io/npm/l/react-native-toastify-lite?style=flat-square&color=111)](./LICENSE)

<img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/hero.gif" width="340" alt="Pill morphing into a card, then into the next toast" />

</div>

## Why this one

- **It morphs.** A short message stays a small pill. Add a description or a button and the pill
  grows a card underneath it, with smooth joined corners, on a physics spring. A new toast morphs
  out of the old one instead of popping in.
- **Light.** Two dependencies you probably already have: `react-native-reanimated` and
  `react-native-svg`. No Expo, no gesture library, no blur library.
- **Complete.** Success, error, warning, info and default tones, primary and secondary actions,
  promise toasts, live updates, custom header and body, six positions, stack and morph modes,
  swipe to dismiss, duplicate grouping, progress bar, timestamps, four motion presets, light/dark
  + automatic theming, reduced-motion support, TypeScript types.
- **Smooth.** Every frame of the shape is computed on the UI thread with Reanimated worklets.

## Install

```bash
npm install react-native-toastify-lite react-native-reanimated react-native-svg
# Reanimated 4 also needs:
npm install react-native-worklets

cd ios && pod install && cd ..
```

Add the Reanimated Babel plugin as the **last** plugin in `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'], // Reanimated 3: 'react-native-reanimated/plugin'
};
```

Then restart Metro with a clean cache: `npx react-native start --reset-cache`.

> Using Expo? It works there too: `npx expo install react-native-reanimated react-native-svg`
> and you're done (Expo's Babel preset already includes the plugin). Nothing from Expo is required.

## Quick start

Wrap your app once. The provider draws toasts on top of everything inside it, so place it inside
a `flex: 1` root view.

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toastify-lite';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider position="top-center" mode="morph">
        <RootNavigator />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
```

Then call it from anywhere, including outside React components:

```tsx
import { toast } from 'react-native-toastify-lite';

toast.success('Saved', { description: 'Your changes are ready.' });
```

`react-native-safe-area-context` is optional. If your app has it (React Navigation apps do),
toasts sit below the notch automatically. Otherwise pass `insets={{ top, bottom }}` to the provider.

## What it looks like

<img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/states.png" width="100%" alt="Toast states: pills, cards, action, error, stack, light fill" />

| Promise | Stack mode | Swipe to dismiss |
| :---: | :---: | :---: |
| <img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/promise.gif" width="250" alt="Promise toast" /> | <img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/stack.gif" width="250" alt="Stack mode" /> | <img src="https://cdn.jsdelivr.net/npm/react-native-toastify-lite@1/assets/swipe.gif" width="250" alt="Swipe to dismiss" /> |

More GIFs (variants, actions, custom content, presets, shapes, positions) are in the
[example app](./example).

## Recipes

### Tones

```tsx
toast.success('Copied');                     // title only: stays a pill
toast.error("Couldn't sync", { description: 'Check your connection.' });
toast.warning('Storage almost full');
toast.info('New update', { description: 'Version 1.2 is ready.' });
toast('3 new notifications');                // default tone
```

### Action button

```tsx
toast.success('Message archived', {
  description: "It's tucked away in Archive.",
  action: { label: 'Undo', onPress: () => restore() },
});

// a secondary, ghost-styled button next to the primary
toast.error('Delete this photo?', {
  description: 'This cannot be undone.',
  action: { label: 'Delete', onPress: () => remove() },
  secondaryAction: { label: 'Keep', onPress: () => {} },
});
```

Pressing either action runs its `onPress` and then dismisses the toast.

### Promise

```tsx
toast.promise(uploadPhoto(), {
  loading: 'Uploading…',
  success: (result) => `Uploaded · ${result.id}`,
  error: (err) => `Failed · ${err.message}`,
  description: {
    loading: "Hang tight, this won't take long.",
    success: 'Available in your library.',
  },
});
```

While pending, the toast shows a spinner and can't be dismissed. When the promise settles it
morphs into the success or error toast.

### Update a toast in place

```tsx
const id = toast.info('Saving draft…');
// later
toast.update(id, { title: 'Draft saved', type: 'success' });
```

The same toast changes: the title crossfades and the shape resizes.

### Custom content

```tsx
toast.custom(<NowPlaying track={track} />, {
  headerContent: <AlbumHeader track={track} />,
  fill: '#111214',
  stroke: 'rgba(255,255,255,0.12)',
  showProgress: false,
});

toast.info('Deployment started', { icon: <RocketIcon size={14} /> });
```

### Positions

```tsx
toast.info('Hello', { position: 'top-left' });
// 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
// or just 'top' / 'bottom' to keep the provider's horizontal alignment
```

### Stack mode vs morph mode

```tsx
<ToastProvider mode="stack" visibleToasts={3} gap={14}>   // default
<ToastProvider mode="morph">
```

| `mode="stack"` (default) | `mode="morph"` |
| --- | --- |
| Toasts pile up, newest in front. Tap the pile to fan it out, tap again to collapse. The front card opens once it settles. | One toast per position. A new toast morphs the current one into itself. |

### Look and motion

```tsx
// per toast
toast.success('Saved', {
  fill: '#FFFFFF',
  stroke: 'rgba(0,0,0,0.08)',
  styles: { description: { color: 'rgba(0,0,0,0.7)' } },
  bodyRadius: 26,
  cornerSmoothing: 1,          // 0 = circular corners, 1 = squircle
  animationPreset: 'snappy',   // 'smooth' | 'snappy' | 'gentle' | 'minimal'
});

// custom spring
toast.info('Bouncy', {
  description: 'Low damping overshoots a little.',
  animation: { springs: { morph: { stiffness: 200, damping: 16, mass: 1 } } },
});

// app-wide
<ToastProvider
  animationPreset="gentle"
  theme={{ colors: { success: '#22c55e' }, surfaceColors: { success: '#0f1a12' } }}
/>
```

### Theme: light, dark, or auto

The toast **contrasts** with the app theme, so it always stands out:

```tsx
<ToastProvider theme="dark" />    // dark app → white toast
<ToastProvider theme="light" />   // light app → dark toast
<ToastProvider />                 // auto: follows useColorScheme()
<ToastProvider theme={{ surfaceColors: { success: '#0f1a12' } }} />  // partial override
```

`theme` describes your app's scheme (omit it to auto-detect). The built-in presets are exported
as `LIGHT_THEME` (white toast) and `DARK_THEME` (dark toast). `textColors` and `metaTextColors`
set the body and timestamp color, so the text always contrasts with the surface — no manual
`textColor` needed.

### Duplicate grouping

Repeated simple toasts (same title + type, no action or custom content) collapse into one with a
count badge instead of piling up:

```tsx
toast.info('Message from Alex');
toast.info('Message from Alex');   // becomes "Message from Alex" with a (2) badge
```

Disable it with `<ToastProvider groupDuplicates={false} />`.

### Reduced motion

The system "reduce motion" setting is honored automatically. Force it on or off with
`<ToastProvider reduceMotion />` / `reduceMotion={false}`.

### Per-side offset

`offset` accepts a number (all sides) or an object:

```tsx
<ToastProvider offset={{ top: 60, right: 16, bottom: 24 }} />
```

### Pause on interaction

Long-press a toast, or fan out a stack, to pause its auto-dismiss timer. Release (or collapse) to
resume. Swiping and tapping still dismiss as usual.

### Dismiss

```tsx
const id = toast.success('Done');
toast.dismiss(id);
toast.dismissAll();
```

Users can also tap a toast, or swipe it up, down or sideways.

## API

### `toast`

| Call | Returns |
| --- | --- |
| `toast(title, options?)` | toast id (default tone) |
| `toast.success / error / warning / info(title, options?)` | toast id |
| `toast.promise(promise, { loading, success, error, description?, action?, icon?, ...options })` | toast id |
| `toast.update(id, options)` | `true` if the toast exists |
| `toast.isActive(id)` | `true` if the toast is showing |
| `toast.custom(content, options?)` | toast id |
| `toast.dismiss(id)` | |
| `toast.dismissAll()` | |

The main exports are `toast` and `ToastProvider`.

### Toast options

| Option | Type | Default |
| --- | --- | --- |
| `id` | `string` | auto-generated |
| `description` | `string` | |
| `action` | `{ label: string; onPress: () => void }` | |
| `secondaryAction` | `{ label: string; onPress: () => void }`, a ghost button beside `action` | |
| `type` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` |
| `position` | `'top-left' … 'bottom-right'` or `'top' \| 'bottom'` | provider |
| `duration` | `number` (ms) | `5000` |
| `dismissible` | `boolean` | `true` |
| `icon` | `ReactNode` | tone icon |
| `showIcon` / `showIconBadge` | `boolean` | `true` |
| `showProgress` / `showTimestamp` | `boolean` | provider (`true`) |
| `meta` | `string`, replaces the timestamp | |
| `fill` / `stroke` | `string` | `#1c1c1e` / `rgba(255,255,255,0.08)` |
| `textColor` | `string` | `rgba(255,255,255,0.82)` |
| `bodyRadius` | `number` | `16` |
| `cornerSmoothing` | `number`, 0 to 1 | `0.6` |
| `bodyLayout` | `'spread' \| 'left' \| 'center' \| 'right'` | `'spread'` |
| `expandedWidth` / `expandedHeight` | `number` | automatic |
| `animationPreset` | `'smooth' \| 'snappy' \| 'gentle' \| 'minimal'` | `'smooth'` |
| `animation` | `{ mount, morph, stack, compact, springs }` | from preset |
| `springConfig` | `{ damping, stiffness, mass }`, applied to every spring | |
| `timing` | `{ displayDuration, expandDuration, collapseDuration }` | |
| `styles` | style overrides: `container`, `content`, `header`, `badge`, `title`, `body`, `description`, `meta`, `action`, `actionText`, `progressTrack`, `progressFill` | |
| `content` / `headerContent` / `showHeader` | custom body, custom header, hide header | |
| `onDismiss` / `onAutoClose` | `() => void` | |

### `<ToastProvider>` props

| Prop | Default |
| --- | --- |
| `mode` | `'stack'` (or `'morph'`) |
| `position` | `'top-center'` |
| `duration` | `5000` |
| `visibleToasts` | `3` |
| `gap` | `14` |
| `offset` | `8` (number) or `{ top, right, bottom, left }`, distance from the safe-area edge |
| `horizontalInset` | `16` |
| `expand` | `false`, start stacks fanned out |
| `groupDuplicates` | `true`, collapse identical simple toasts into one with a count |
| `reduceMotion` | auto — follows the system setting; force with `true` / `false` |
| `swipeToDismiss` / `swipeThreshold` | `true` / `45` |
| `showProgress` / `showTimestamp` | `true` / `true` |
| `theme` | `'light' \| 'dark' \| theme object`. Keys: `colors`, `surfaceColors`, `surfaceStrokeColors`, `badgeBgColors`, `actionColors`, `actionTextColors`, `textColors`, `metaTextColors` |
| `insets` | `{ top, bottom }`, only needed without safe-area-context |
| any toast option | used as the default for every toast (`fill`, `stroke`, `textColor`, `styles`, `animationPreset`, `bodyLayout`, …) |

A nested `ToastProvider` (for example inside a modal screen) takes over while it is mounted,
so toasts are never drawn twice.

### Exports

`toast`, `ToastProvider`, the enums `ToastType`,
`ToastPosition`, `ToastMode`, `ToastAnimationPreset`, `ToastBodyLayout`,
`ToastVerticalPosition`, the built-in icons (`SuccessIcon`, `ErrorIcon`, `WarningIcon`,
`InfoIcon`, `DefaultIcon`, `SpinnerIcon`), `DEFAULT_THEME`, `LIGHT_THEME`, `DARK_THEME`,
`toastAnimationPresets`, and all option types (`IToastOptions`, `IToastProviderProps`,
`IToastPromiseData`, `IToastOffset`, …).

## Compatibility

| | Supported |
| --- | --- |
| React Native | 0.74+ recommended (0.72+ works) |
| Architecture | New Architecture (Reanimated 4), or old architecture with Reanimated 3 |
| Reanimated | 3.6+ and 4.x |
| react-native-svg | 13+ |
| Expo | optional, works in Expo Go and dev builds |
| Web | not a target (it renders through react-native-web, but isn't tested there) |

On Android with React Native 0.76+, the New Architecture and Reanimated 4, the title also blurs
while it changes. Everywhere else it crossfades.

## Troubleshooting

**Nothing animates, or "Reanimated plugin not found".** The Babel plugin is missing or not last.
Fix `babel.config.js`, then `npx react-native start --reset-cache`.

**Toasts are hidden by the status bar or notch.** Install `react-native-safe-area-context` and wrap
your app in `SafeAreaProvider`, or pass `insets={{ top, bottom }}` to the provider.

**Toasts don't show over a React Native `<Modal>`.** Modals render in a separate native window.
Put a second `<ToastProvider>` inside the modal; it takes over while open.

**Text in a white toast is invisible.** Body text is white by default. With a light `fill`, also pass
`textColor: '#000000b3'` (or `styles: { description: { color: '#000000b3' } }`).

## Example app

The [`example`](./example) folder is a bare React Native CLI app with one file per topic and a GIF
for each. Run it with `cd example && npm install && npm run android` (or `npm run ios`).

## Credits

Inspired by [Sileo](https://sileo.aaryan.design).

## License

[MIT](./LICENSE)
