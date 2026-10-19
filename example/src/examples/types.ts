import type { IconName } from '../icons';

export type DemoItem = {
  title: string;
  description: string;
  icon: IconName;
  tint: string;
  onPress: () => void;
};

export type DemoSection = {
  title: string;
  footer?: string;
  /** GIF of this section in example/gifs */
  gif?: string;
  items: DemoItem[];
};

export const wait = (ms: number, shouldReject = false) =>
  new Promise<{ id: string }>((resolve, reject) =>
    setTimeout(() => (shouldReject ? reject(new Error('Network error')) : resolve({ id: 'tx_8821' })), ms),
  );
