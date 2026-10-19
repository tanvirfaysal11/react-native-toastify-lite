/**
 * 05 · Animation
 *
 *   toast.info("…", { animationPreset: "snappy" })            // smooth | snappy | gentle | minimal
 *   toast.info("…", { animation: { springs: { morph: { stiffness, damping, mass } } } })
 *   toast.info("…", { animation: { mount: { axis: "y", offset: 80 } } })
 *
 * Presets and springs can also be set once on <ToastProvider>.
 */
import { type IToastOptions, toast, ToastAnimationPreset } from 'react-native-toastify-lite';
import type { DemoSection } from './types';

const card: Omit<IToastOptions, 'title' | 'type'> = {
  description: 'Your changes are synced across every device.',
  action: { label: 'View', onPress: () => toast.success('Opened') },
  showProgress: false,
};

const preset = (title: string, p: ToastAnimationPreset) => () => toast.info(title, { ...card, animationPreset: p });

export const presets: DemoSection = {
  title: 'Animation presets',
  footer: 'Built-in motion presets. Pass animationPreset per toast or on the provider.',
  gif: 'presets.gif',
  items: [
    { title: 'Smooth', description: 'Default. Soft spring with a gentle bounce.', icon: 'sparkles', tint: '#5E5CE6', onPress: preset('Smooth preset', ToastAnimationPreset.Smooth) },
    { title: 'Snappy', description: 'Quick and tight for frequent feedback.', icon: 'bolt', tint: '#FF9F0A', onPress: preset('Snappy preset', ToastAnimationPreset.Snappy) },
    { title: 'Gentle', description: 'Slower, heavier and calm.', icon: 'leaf', tint: '#30B0C7', onPress: preset('Gentle preset', ToastAnimationPreset.Gentle) },
    { title: 'Minimal', description: 'No drop-in, critically damped morph.', icon: 'minus', tint: '#8E8E93', onPress: preset('Minimal preset', ToastAnimationPreset.Minimal) },
  ],
};

export const springs: DemoSection = {
  title: 'Springs',
  footer: 'Tune any spring through animation.springs on a toast or the provider.',
  items: [
    {
      title: 'Bouncy',
      description: 'Low damping for a playful overshoot.',
      icon: 'wave',
      tint: '#FF2D55',
      onPress: () => toast.success('Bouncy morph', { ...card, animation: { springs: { morph: { stiffness: 200, damping: 16, mass: 1 } } } }),
    },
    {
      title: 'Soft & slow',
      description: 'Low stiffness, unhurried settle.',
      icon: 'cloud',
      tint: '#64D2FF',
      onPress: () =>
        toast.info('Soft morph', {
          ...card,
          animation: { springs: { morph: { stiffness: 110, damping: 15, mass: 1 }, morphCollapse: { stiffness: 110, damping: 21, mass: 1 } } },
        }),
    },
    {
      title: 'Crisp',
      description: 'Critically damped, no bounce at all.',
      icon: 'bolt',
      tint: '#FFD60A',
      onPress: () => toast.warning('Crisp morph', { ...card, animation: { springs: { morph: { stiffness: 320, damping: 36, mass: 1 } } } }),
    },
    {
      title: 'Jelly squish',
      description: 'Re-enable the card squish on expand.',
      icon: 'drop',
      tint: '#34C759',
      onPress: () => toast.success('Jelly squish', { ...card, animation: { morph: { squishDuration: 90, squishScaleX: 1.04, squishScaleY: 0.93 } } }),
    },
    {
      title: 'Heavy drop',
      description: 'Longer, weightier entrance spring.',
      icon: 'down',
      tint: '#AF52DE',
      onPress: () =>
        toast.info('Heavy drop', { animation: { mount: { axis: 'y', offset: 80 }, springs: { mount: { stiffness: 140, damping: 13, mass: 1.3 } } } }),
    },
  ],
};
