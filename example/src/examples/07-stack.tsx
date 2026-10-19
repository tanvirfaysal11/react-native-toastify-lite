/**
 * 07 · Stack mode
 *
 *   <ToastProvider mode="stack" visibleToasts={3} gap={14}>
 *
 * Toasts pile up; tap the pile to fan it out, tap again to collapse. The
 * front card expands once it settles. Swipe any card away.
 */
import { toast, ToastAnimationPreset } from 'react-native-toastify-lite';
import { type DemoSection, wait } from './types';

export const stackPush: DemoSection = {
  title: 'Push',
  footer: 'Tap the stack itself to fan it out or collapse it.',
  gif: 'stack.gif',
  items: [
    { title: 'Single toast', description: 'One title-only toast.', icon: 'plus', tint: '#34C759', onPress: () => toast.success('Added to stack') },
    {
      title: 'Burst of three',
      description: 'Three toasts in quick succession.',
      icon: 'layers',
      tint: '#FF9500',
      onPress: () => {
        toast.info('Uploading photos');
        setTimeout(() => toast.warning('Storage almost full'), 250);
        setTimeout(() => toast.success('Backup complete'), 500);
      },
    },
    {
      title: 'Cards with bodies',
      description: 'Front card expands once it settles.',
      icon: 'cards',
      tint: '#0A84FF',
      onPress: () => {
        toast.info('New comment', { description: 'Maya replied to your design review.' });
        setTimeout(
          () =>
            toast.success('Payment received', {
              description: '$48.00 from Jordan for dinner.',
              action: { label: 'View', onPress: () => toast.success('Opened') },
              showProgress: false,
            }),
          300,
        );
      },
    },
    {
      title: 'Mixed tones',
      description: 'Success, error, warning, info.',
      icon: 'palette',
      tint: '#AF52DE',
      onPress: () => {
        toast.success('Saved');
        setTimeout(() => toast.error("Couldn't sync"), 200);
        setTimeout(() => toast.warning('Low battery'), 400);
        setTimeout(() => toast.info('Update ready'), 600);
      },
    },
  ],
};

export const stackMotion: DemoSection = {
  title: 'Motion',
  items: [
    {
      title: 'Gentle stack',
      description: 'Gentle preset for stacked cards.',
      icon: 'leaf',
      tint: '#30B0C7',
      onPress: () => {
        toast.info('Gentle one', { animationPreset: ToastAnimationPreset.Gentle });
        setTimeout(() => toast.info('Gentle two', { animationPreset: ToastAnimationPreset.Gentle }), 300);
      },
    },
    {
      title: 'Promise in stack',
      description: 'Loading → success on top of the pile.',
      icon: 'refresh',
      tint: '#34C759',
      onPress: () =>
        toast.promise(wait(1400), {
          loading: 'Uploading…',
          success: 'Uploaded',
          error: 'Upload failed',
          description: { success: 'Available in your library.' },
        }),
    },
    { title: 'Dismiss all', description: 'Clear the stack.', icon: 'trash', tint: '#8E8E93', onPress: () => toast.dismissAll() },
  ],
};
