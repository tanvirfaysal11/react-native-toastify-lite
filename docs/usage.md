# Usage

Everything you can do with `toast` — setup, the full API, and recipes for every feature.

[← README](../README.md) · [Installation](./installation.md) · **Usage** · [Styling](./styling.md) · [Animations](./animations.md) · [API reference](./api-reference.md)

---

## Set up the provider

Wrap your app once. The provider draws toasts on top of everything inside it, so place it inside a
`flex: 1` root view.

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

## Fire a toast

Call it from anywhere, including outside React components:

```tsx
import { toast } from 'react-native-toastify-lite';

toast.success('Saved', { description: 'Your changes are ready.' });
```

## The `toast` API

`toast` is a callable function with methods attached. Every method that creates a toast returns its
`id`, so you can update or dismiss it later.

| Call | Returns | Notes |
| --- | --- | --- |
| `toast(title, options?)` | `id` | default tone |
| `toast.success(title, options?)` | `id` | success tone |
| `toast.error(title, options?)` | `id` | error tone (shakes on arrival) |
| `toast.warning(title, options?)` | `id` | warning tone |
| `toast.info(title, options?)` | `id` | info tone |
| `toast.promise(promise, data)` | `id` | shows loading, then success/error |
| `toast.custom(content, options?)` | `id` | fully custom body |
| `toast.update(id, options)` | `boolean` | `true` if the toast exists |
| `toast.isActive(id)` | `boolean` | `true` while the toast is showing |
| `toast.dismiss(id)` | — | remove one toast |
| `toast.dismissAll()` | — | remove all toasts |

```tsx
const id = toast.success('Copied');
toast.isActive(id);   // true
toast.update(id, { title: 'Copied to clipboard' });
toast.dismiss(id);
```

## Tones

```tsx
toast.success('Copied');                       // title only: stays a pill
toast.error("Couldn't sync", { description: 'Check your connection.' });
toast.warning('Storage almost full');
toast.info('New update', { description: 'Version 1.2 is ready.' });
toast('3 new notifications');                  // default tone
```

<img src="https://cdn.jsdelivr.net/gh/tanvirfaysal11/react-native-toastify-lite@main/example/gifs/variants.gif" width="280" alt="Toast tone variants" />

## Action buttons

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

## Promise toasts

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
morphs into the success or error toast. The `success` / `error` values can be strings or functions
that receive the resolved value / error.

## Updating a toast in place

```tsx
const id = toast.info('Saving draft…');
// later
toast.update(id, { title: 'Draft saved', type: 'success' });
```

The same toast changes: the title crossfades and the shape resizes.

## Custom content

```tsx
toast.custom(<NowPlaying track={track} />, {
  headerContent: <AlbumHeader track={track} />,
  fill: '#111214',
  stroke: 'rgba(255,255,255,0.12)',
  showProgress: false,
});

toast.info('Deployment started', { icon: <RocketIcon size={14} /> });
```

<img src="https://cdn.jsdelivr.net/gh/tanvirfaysal11/react-native-toastify-lite@main/example/gifs/custom.gif" width="280" alt="Custom header and body" />

## Positions

```tsx
toast.info('Hello', { position: 'top-left' });
// 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
// or just 'top' / 'bottom' to keep the provider's horizontal alignment
```

<img src="https://cdn.jsdelivr.net/gh/tanvirfaysal11/react-native-toastify-lite@main/example/gifs/positions.gif" width="280" alt="Toast positions" />

## Stack mode vs morph mode

```tsx
<ToastProvider mode="stack" visibleToasts={3} gap={12}>   // default
<ToastProvider mode="morph">
```

| `mode="stack"` (default) | `mode="morph"` |
| --- | --- |
| Toasts pile up, newest in front. Tap the pile to fan it out, tap again to collapse. The front card opens once it settles. | One toast per position. A new toast morphs the current one into itself. |

<img src="https://cdn.jsdelivr.net/gh/tanvirfaysal11/react-native-toastify-lite@main/example/gifs/stack.gif" width="280" alt="Stack mode" />

## Duplicate grouping

Repeated simple toasts (same title + type, no action or custom content) collapse into one with a
count badge instead of piling up:

```tsx
toast.info('Message from Alex');
toast.info('Message from Alex');   // becomes "Message from Alex" with a (2) badge
```

Disable it with `<ToastProvider groupDuplicates={false} />`.

## Custom ids

Pass a stable `id` to deduplicate across renders and navigation, and check whether a toast is
showing before you fire a new one:

```tsx
if (!toast.isActive('sync')) {
  toast.info('Syncing…', { id: 'sync' });
}

// later, wherever you are
toast.update('sync', { title: 'Synced', type: 'success' });
toast.dismiss('sync');
```

Calling with the same `id` again replaces that toast instead of stacking a duplicate.

## Per-side offset

`offset` accepts a number (all sides) or an object:

```tsx
<ToastProvider offset={{ top: 60, right: 16, bottom: 24 }} />
```

## Pause on interaction

Long-press a toast, or fan out a stack, to pause its auto-dismiss timer. Release (or collapse) to
resume. Swiping and tapping still dismiss as usual.

## Dismissing

```tsx
const id = toast.success('Done');
toast.dismiss(id);
toast.dismissAll();
```

Users can also tap a toast, or swipe it up, down or sideways.

## Accessibility

Toasts are announced to screen readers (`accessibilityRole="alert"`,
`accessibilityLiveRegion="polite"`, plus `announceForAccessibility` on iOS), so transient updates
are not silently missed.

**← Previous:** [Installation](./installation.md) · **Next:** [Styling →](./styling.md)
