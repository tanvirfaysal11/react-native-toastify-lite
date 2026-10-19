/**
 * 08 · Features
 *
 *   toast.info("Message from Alex") x3   → groups into one pill with a count
 *   toast.error(..., { action, secondaryAction })
 *   toast.success(..., { fill: "#fff", textColor })
 *
 * Grouping is on by default: repeated simple toasts (same title + type, no
 * action or content) collapse into a single toast with a count badge.
 * Long-press any toast to pause its timer; fan out a stack to hold it.
 */
import { toast } from 'react-native-toastify-lite';
import type { DemoSection } from './types';

export const features: DemoSection = {
  title: 'Features',
  footer: 'Grouping is on by default. Long-press a toast to pause its timer.',
  items: [
    {
      title: 'Group duplicates',
      description: 'Same title collapses into one with a count.',
      icon: 'layers',
      tint: '#5E5CE6',
      onPress: () => {
        toast.info('Message from Alex');
        toast.info('Message from Alex');
        toast.info('Message from Alex');
      },
    },
    {
      title: 'Secondary action',
      description: 'Two buttons: a primary and a ghost.',
      icon: 'cards',
      tint: '#FF3B30',
      onPress: () =>
        toast.error('Delete this photo?', {
          description: 'This cannot be undone.',
          action: { label: 'Delete', onPress: () => toast.success('Deleted') },
          secondaryAction: { label: 'Keep', onPress: () => toast.info('Kept') },
        }),
    },
    {
      title: 'Light card',
      description: 'White fill with dark text.',
      icon: 'sun',
      tint: '#FF9500',
      onPress: () =>
        toast.success('Light mode', {
          description: 'Dark text on a white card.',
          fill: '#FFFFFF',
          stroke: 'rgba(0,0,0,0.08)',
          textColor: 'rgba(0,0,0,0.72)',
          showTimestamp: false,
        }),
    },
  ],
};
