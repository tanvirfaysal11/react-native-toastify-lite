# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-19

First public release of `react-native-toastify-lite` — morphing, physics-based toast notifications
for React Native. A pill that springs open into a card, with stack and morph modes, promise toasts,
swipe to dismiss and full theming. iOS and Android, no Expo needed, only Reanimated and react-native-svg.

### Added

**Core**

- Morphing toast surface: a short message stays a pill, a description or action grows a card
  underneath it with smooth joined corners, on a physics spring.
- Squircle corner smoothing (`cornerSmoothing` 0–1) and per-toast `bodyRadius`.
- Every frame of the shape computed on the UI thread with Reanimated worklets.

**API**

- `toast`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`.
- `toast.promise` with `loading` / `success` / `error` states, per-state description, action and icon.
- `toast.update(id, options)` to mutate a toast in place.
- `toast.custom(content, options)` for fully custom body and header.
- `toast.dismiss(id)` and `toast.dismissAll()`.
- Custom `id` option — re-using an id replaces that toast instead of stacking.
- `toast.isActive(id)` to query whether a toast is showing.

**Provider & layout**

- `ToastProvider` with `stack` mode (pile, tap to fan out) and `morph` mode (one toast per position).
- Six positions: top/bottom × left/center/right.
- Per-toast `position` override, per-side `offset`, `horizontalInset`, and `visibleToasts` / `gap` tuning.
- Nested `ToastProvider` support — a modal's provider takes over while mounted.

**Interaction**

- Tap and swipe (up, down or sideways) to dismiss, with a configurable `swipeThreshold`.
- Primary and secondary action buttons.
- Duplicate grouping with a count badge (`groupDuplicates`).
- Long-press / stack fan-out pauses the auto-dismiss timer.
- Progress bar and timestamp / `meta`.

**Motion**

- Four presets — `smooth`, `snappy`, `gentle`, `minimal` — plus per-spring `springConfig` tuning.
- Fine-grained `animation` config (`mount`, `morph`, `stack`, `compact`, `springs`) and `timing` overrides.
- Automatic reduced-motion support, honoring the system setting.

**Theming**

- `light`, `dark`, and automatic (follows `useColorScheme()`) themes that contrast with the app.
- Full theme object: `colors`, `surfaceColors`, `surfaceStrokeColors`, `badgeBgColors`,
  `actionColors`, `actionTextColors`, `textColors`, `metaTextColors`.
- Per-part `styles` overrides (`container`, `content`, `header`, `title`, `body`, `action`, and more).

**Accessibility**

- Screen-reader announcements (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`,
  plus `announceForAccessibility` on iOS).

**Engineering**

- TypeScript types for every option and prop.
- CommonJS and ES module builds.
- Only `react-native-reanimated` and `react-native-svg` are required; `react-native-safe-area-context`
  is picked up automatically when installed. No Expo packages.
