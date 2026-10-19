# Animations

Every frame of the shape is computed on the UI thread with Reanimated worklets. Motion is driven by
physics springs, with four presets and full per-spring tuning.

[← README](../README.md) · [Installation](./installation.md) · [Usage](./usage.md) · [Styling](./styling.md) · **Animations** · [API reference](./api-reference.md)

---

## Presets

```tsx
<ToastProvider animationPreset="gentle" />           // app-wide
toast.info('Bouncy', { animationPreset: 'snappy' }); // per toast
```

| Preset | Feel | Best for |
| --- | --- | --- |
| `smooth` (default) | Balanced | General use. |
| `snappy` | Crisp, quick, a little overshoot | Confirmation toasts. |
| `gentle` | Soft and heavy | Calm, editorial UIs. |
| `minimal` | Barely moves, fades | Dense or fast UIs. |

<img src="https://cdn.jsdelivr.net/gh/tanvirfaysal11/react-native-toastify-lite@main/example/gifs/presets.gif" width="280" alt="Motion presets" />

## Custom springs

Override individual springs via the `animation` option. Each spring accepts
`{ damping, stiffness, mass, overshootClamping, velocity }`:

```tsx
toast.info('Bouncy', {
  description: 'Low damping overshoots a little.',
  animation: {
    springs: {
      morph: { damping: 16, stiffness: 200, mass: 1 },
    },
  },
});
```

Spring names:

| Spring | Drives |
| --- | --- |
| `mount` | Drop-in on arrival. |
| `morph` | Pill ↔ card shape. |
| `morphCollapse` | Card → pill collapse. |
| `pillResize` | Pill width change. |
| `bodyReveal` | Description / action reveal. |
| `squish` | The little squash-and-stretch. |
| `stack` | Stack fan-out / collapse. |

To apply the same spring to **every** animation, use `springConfig`:

```tsx
toast.info('One spring', {
  springConfig: { damping: 18, stiffness: 220, mass: 0.9 },
});
```

## Timing

Control the non-spring durations with `timing`:

```tsx
toast.info('Slow open', {
  description: 'Stays open a beat longer.',
  timing: {
    displayDuration: 6000,   // how long it stays up
    expandDuration: 1200,    // pill → card
    collapseDuration: 800,   // card → pill
  },
});
```

## Mount animation

```tsx
toast.info('Slide in', {
  animation: { mount: { axis: 'x', duration: 320, offset: 60 } },
});
```

- `axis` — `'y'` (slide up/down), `'x'` (slide sideways), or `'none'` (fade only).
- `offset` — how far it travels.
- `duration` — how long the mount takes.

## Fine-grained config

```tsx
toast.success('Tuned', {
  animation: {
    morph: {
      collapseDuration: 220,
      squishDuration: 60,
      squishScaleX: 1.04,
      squishScaleY: 0.92,
      actionDelay: 80,
    },
    stack: {
      duration: 300,
      minScale: 0.9,
      minOpacity: 0.68,
      opacityStep: 0.1,
      scaleStep: 0.05,
    },
  },
});
```

The `animation` object accepts `preset`, `mount`, `morph`, `stack`, `compact`, and `springs`. See the
[API reference](./api-reference.md) for every field.

## Reduced motion

The system **reduce motion** setting is honored automatically — springs become instant and shape
changes snap instead of animating. Force it on or off:

```tsx
<ToastProvider reduceMotion />       // always reduced
<ToastProvider reduceMotion={false} /> // never reduced
```

**← Previous:** [Styling](./styling.md) · **Next:** [API reference →](./api-reference.md)
