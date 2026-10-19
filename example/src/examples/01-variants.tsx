/**
 * 01 · Variants
 *
 *   toast.success("Title")
 *   toast.error("Title", { description })
 *   toast.info(...) / toast.warning(...) / toast("Title")  // default
 *
 * A title-only toast stays a pill. Adding a description (or an action) makes
 * the pill morph open into a card.
 */
import { toast } from 'react-native-toastify-lite';
import type { DemoSection } from './types';

export const variants: DemoSection = {
  title: 'Variants',
  footer: 'The built-in tones. Tap any row to preview.',
  gif: 'variants.gif',
  items: [
    {
      title: 'Success',
      description: 'Confirms a completed action.',
      icon: 'check',
      tint: '#34C759',
      onPress: () => toast.success('Success'),
    },
    {
      title: 'Error',
      description: 'Surfaces a failure that needs attention.',
      icon: 'x',
      tint: '#FF3B30',
      onPress: () => toast.error("Couldn't sync", { description: 'Check your connection and try again.' }),
    },
    {
      title: 'Info',
      description: 'Shares a neutral status update.',
      icon: 'info',
      tint: '#0A84FF',
      onPress: () => toast.info('New update available', { description: 'Version 1.2 is ready to install.' }),
    },
    {
      title: 'Warning',
      description: 'Flags something to double-check.',
      icon: 'alert',
      tint: '#FF9F0A',
      onPress: () => toast.warning('Storage almost full', { description: 'Free up space to keep syncing.' }),
    },
    {
      title: 'Default',
      description: 'Neutral grey with a bell icon.',
      icon: 'bell',
      tint: '#8E8E93',
      onPress: () => toast('3 new notifications'),
    },
  ],
};
