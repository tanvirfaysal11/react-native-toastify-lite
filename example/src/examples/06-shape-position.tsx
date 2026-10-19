/**
 * 06 · Shape and position
 *
 *   toast.info("…", { bodyRadius: 26, cornerSmoothing: 1 })   // squircle
 *   toast.info("…", { expandedWidth: 280 })
 *   toast.info("…", { position: "top-left" | "bottom-center" | ... })
 *
 * Each position morphs from its own edge.
 */
import { type IToastOptions, toast, ToastPosition } from 'react-native-toastify-lite';
import type { DemoSection } from './types';

const card: Omit<IToastOptions, 'title' | 'type'> = {
  description: 'Your changes are synced across every device.',
  action: { label: 'View', onPress: () => toast.success('Opened') },
  showProgress: false,
};

export const shape: DemoSection = {
  title: 'Shape',
  footer: 'Corner radius, squircle smoothing, and card width.',
  gif: 'shape.gif',
  items: [
    { title: 'Squircle', description: 'Larger radius with full corner smoothing.', icon: 'squircle', tint: '#0A84FF', onPress: () => toast.info('Squircle card', { ...card, bodyRadius: 26, cornerSmoothing: 1 }) },
    { title: 'Tight corners', description: 'Small radius, plain circular corners.', icon: 'square', tint: '#636366', onPress: () => toast.info('Tight corners', { ...card, bodyRadius: 8, cornerSmoothing: 0 }) },
    { title: 'Narrow card', description: 'Constrain the expanded width.', icon: 'narrow', tint: '#FF6482', onPress: () => toast.info('Narrow card', { ...card, expandedWidth: 280 }) },
    { title: 'Centered body', description: 'bodyLayout "center".', icon: 'justify', tint: '#30B0C7', onPress: () => toast.success('Centered', { ...card, bodyLayout: 'center' }) },
  ],
};

export const positions: DemoSection = {
  title: 'Positions',
  footer: 'Each position morphs from its own edge.',
  gif: 'positions.gif',
  items: [
    { title: 'Top left', description: 'Pill hugs the left edge.', icon: 'upLeft', tint: '#5856D6', onPress: () => toast.info('Top left', { ...card, position: ToastPosition.TopLeft }) },
    { title: 'Top right', description: 'Pill hugs the right edge.', icon: 'upRight', tint: '#5856D6', onPress: () => toast.info('Top right', { ...card, position: ToastPosition.TopRight, bodyRadius: 30 }) },
    { title: 'Bottom center', description: 'Rises from the bottom edge.', icon: 'downArrow', tint: '#5856D6', onPress: () => toast.success('Bottom center', { ...card, position: ToastPosition.BottomCenter }) },
  ],
};
