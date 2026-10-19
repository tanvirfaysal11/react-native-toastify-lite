# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org).

## 1.0.0 (2026-10-19)

First public release.

- Morphing toast: a pill that springs open into a card, with squircle corners and joined fillets.
- `toast.success / error / warning / info / promise / update / custom / dismiss / dismissAll`.
- `ToastProvider` with stack mode (pile, tap to fan out) and morph mode (one toast per position).
- Six positions, swipe and tap to dismiss, progress bar, timestamps, action button.
- Four motion presets (smooth, snappy, gentle, minimal) and per-spring tuning.
- Full theming and per-part style overrides.
- Only `react-native-reanimated` and `react-native-svg` are required. `react-native-safe-area-context`
  is picked up automatically when installed. No Expo packages.
- TypeScript types, CommonJS and ES module builds.
