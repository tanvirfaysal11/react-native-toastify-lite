/**
 * 02 · Patterns
 *
 *   toast.success("Archived", { description, action: { label, onPress } })
 *   const id = toast.info("Working…");  toast.update(id, { title, type })
 *
 * `update` keeps the same toast, so it morphs in place: the title crossfades
 * and the card resizes.
 */
import { toast } from 'react-native-toastify-lite';
import type { DemoSection } from './types';

export const patterns: DemoSection = {
  title: 'Patterns',
  footer: 'Common compositions you can build on top of the core API.',
  gif: 'action.gif',
  items: [
    {
      title: 'With action',
      description: 'Pair a toast with a primary action.',
      icon: 'undo',
      tint: '#5E5CE6',
      onPress: () =>
        toast.success('Message archived', {
          description: "It's tucked away in Archive.",
          action: { label: 'Undo', onPress: () => toast.info('Restored to Inbox') },
        }),
    },
    {
      title: 'Title only',
      description: 'Short, glanceable confirmation.',
      icon: 'text',
      tint: '#8E8E93',
      onPress: () => toast.success('Copied'),
    },
    {
      title: 'Long copy',
      description: 'Multiline body that morphs gracefully.',
      icon: 'justify',
      tint: '#30B0C7',
      onPress: () =>
        toast.info('Heads up', {
          description:
            'Toasts morph between sizes when content changes. Descriptions, actions, even type can update mid-flight without remounting the toast.',
        }),
    },
    {
      title: 'Update in place',
      description: 'Same toast, new title and type.',
      icon: 'refresh',
      tint: '#FF9500',
      onPress: () => {
        const id = toast.info('Saving draft…', { duration: 4000 });
        setTimeout(() => toast.update(id, { title: 'Draft saved', type: 'success' }), 1200);
      },
    },
  ],
};
