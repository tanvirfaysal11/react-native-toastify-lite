/**
 * 03 · Promise
 *
 *   toast.promise(upload(), {
 *     loading: "Uploading…",
 *     success: (r) => `Uploaded · ${r.id}`,
 *     error: (e) => `Failed · ${e.message}`,
 *     description: { loading, success },
 *   })
 *
 * Shows a spinner while pending (not dismissible), then morphs into the
 * success or error toast.
 */
import { toast } from 'react-native-toastify-lite';
import { type DemoSection, wait } from './types';

export const promise: DemoSection = {
  title: 'Promise',
  footer: 'Tracks a promise from loading to settled state.',
  gif: 'promise.gif',
  items: [
    {
      title: 'Resolves',
      description: 'Loading → success after 1.4s.',
      icon: 'seal',
      tint: '#34C759',
      onPress: () =>
        toast.promise(wait(1400), {
          loading: 'Uploading…',
          success: r => `Uploaded · ${r.id}`,
          error: 'Upload failed',
          description: { loading: "Hang tight, this won't take long.", success: 'Available in your library.' },
        }),
    },
    {
      title: 'Rejects',
      description: 'Loading → error after 1.4s.',
      icon: 'sealX',
      tint: '#FF3B30',
      onPress: () =>
        toast.promise<{ id: string }, Error>(wait(1400, true), {
          loading: 'Submitting…',
          success: 'Submitted',
          error: err => `Failed · ${err.message}`,
        }),
    },
  ],
};
