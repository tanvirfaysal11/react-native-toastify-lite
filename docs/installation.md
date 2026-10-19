# Installation

A step-by-step guide to install `react-native-toastify-lite` and its dependencies.

[← README](../README.md) · **Installation** · [Usage](./usage.md) · [Styling](./styling.md) · [Animations](./animations.md) · [API reference](./api-reference.md)

---

## Install the package

```bash
npm install react-native-toastify-lite react-native-reanimated react-native-svg
# Reanimated 4 also needs:
npm install react-native-worklets
```

Or with Yarn:

```bash
yarn add react-native-toastify-lite react-native-reanimated react-native-svg react-native-worklets
```

Only `react-native-reanimated` and `react-native-svg` are required at runtime.
`react-native-worklets` is required only for Reanimated 4.

## Babel plugin

Add the Reanimated Babel plugin as the **last** plugin in `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'], // Reanimated 3: 'react-native-reanimated/plugin'
};
```

Then restart Metro with a clean cache:

```bash
npx react-native start --reset-cache
```

## iOS pods

```bash
cd ios && pod install && cd ..
```

## Safe area

`react-native-safe-area-context` is **optional**, but recommended. If your app has it
(React Navigation apps do), toasts sit below the notch automatically.

```bash
npm install react-native-safe-area-context
```

Without it, pass `insets={{ top, bottom }}` to the provider:

```tsx
<ToastProvider insets={{ top: 48, bottom: 24 }}>
  {/* ... */}
</ToastProvider>
```

## Expo

Expo works too — no Expo packages are required:

```bash
npx expo install react-native-reanimated react-native-svg react-native-safe-area-context
```

Expo's Babel preset already includes the Reanimated plugin, so there is no manual Babel config to
add. Nothing from Expo is a dependency of this library.

## Peer dependencies

| Package | Version |
| --- | --- |
| react | >=18 |
| react-native | >=0.72 (0.74+ recommended) |
| react-native-reanimated | >=3.6.0 <5 |
| react-native-svg | >=13 |
| react-native-safe-area-context | >=4 (optional) |

## Troubleshooting

**Nothing animates, or "Reanimated plugin not found".** The Babel plugin is missing or not last.
Fix `babel.config.js`, then `npx react-native start --reset-cache`.

**Toasts are hidden by the status bar or notch.** Install `react-native-safe-area-context` and wrap
your app in `SafeAreaProvider`, or pass `insets={{ top, bottom }}` to the provider.

**Toasts don't show over a React Native `<Modal>`.** Modals render in a separate native window.
Put a second `<ToastProvider>` inside the modal; it takes over while open.

**Text in a light toast is invisible.** Body text is themed to contrast with the surface. With a
light `fill`, also pass `textColor: '#000000b3'` (or `styles: { description: { color: '#000000b3' } }`).

**Next:** [Usage →](./usage.md)
