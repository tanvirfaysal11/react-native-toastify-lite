// Small line icons for the demo list (Lucide paths, ISC license).
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from "react-native-svg";

type P = { color?: string; size?: number };

const I = ({ color = "#fff", size = 18, children }: P & { children: ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const icons = {
  check: (p: P) => <I {...p}><Path d="M20 6 9 17l-5-5" /></I>,
  x: (p: P) => <I {...p}><Path d="M18 6 6 18M6 6l12 12" /></I>,
  info: (p: P) => <I {...p}><Circle cx="12" cy="12" r="10" /><Path d="M12 16v-4M12 8h.01" /></I>,
  alert: (p: P) => <I {...p}><Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><Path d="M12 9v4M12 17h.01" /></I>,
  undo: (p: P) => <I {...p}><Path d="M9 14 4 9l5-5" /><Path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></I>,
  text: (p: P) => <I {...p}><Path d="M15 12H3M17 18H3M21 6H3" /></I>,
  justify: (p: P) => <I {...p}><Path d="M3 12h18M3 18h18M3 6h18" /></I>,
  seal: (p: P) => <I {...p}><Circle cx="12" cy="12" r="9" /><Path d="m9 12 2 2 4-4" /></I>,
  sealX: (p: P) => <I {...p}><Circle cx="12" cy="12" r="9" /><Path d="m15 9-6 6M9 9l6 6" /></I>,
  trash: (p: P) => <I {...p}><Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></I>,
  sparkles: (p: P) => <I {...p}><Path d="M12 3 9.9 9.9 3 12l6.9 2.1L12 21l2.1-6.9L21 12l-6.9-2.1Z" /></I>,
  bolt: (p: P) => <I {...p}><Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></I>,
  leaf: (p: P) => <I {...p}><Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><Path d="M2 21c0-3 1.85-5.36 5.08-6" /></I>,
  minus: (p: P) => <I {...p}><Circle cx="12" cy="12" r="10" /><Path d="M8 12h8" /></I>,
  wave: (p: P) => <I {...p}><Path d="M2 12h3l3-8 4 16 3-8h7" /></I>,
  cloud: (p: P) => <I {...p}><Path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></I>,
  drop: (p: P) => <I {...p}><Path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" /></I>,
  down: (p: P) => <I {...p}><Circle cx="12" cy="12" r="10" /><Path d="M12 8v8M8 12l4 4 4-4" /></I>,
  squircle: (p: P) => <I {...p}><Path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9" /></I>,
  square: (p: P) => <I {...p}><Rect x="4" y="4" width="16" height="16" rx="2" /></I>,
  narrow: (p: P) => <I {...p}><Path d="m7 20 5-5 5 5M7 4l5 5 5-5" /></I>,
  sun: (p: P) => <I {...p}><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></I>,
  upLeft: (p: P) => <I {...p}><Path d="M17 17 7 7M7 17V7h10" /></I>,
  upRight: (p: P) => <I {...p}><Path d="M7 17 17 7M7 7h10v10" /></I>,
  downArrow: (p: P) => <I {...p}><Path d="M12 5v14M19 12l-7 7-7-7" /></I>,
  layers: (p: P) => <I {...p}><Path d="m12 2 10 5-10 5L2 7l10-5Z" /><Path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></I>,
  plus: (p: P) => <I {...p}><Circle cx="12" cy="12" r="10" /><Path d="M12 8v8M8 12h8" /></I>,
  cards: (p: P) => <I {...p}><Rect x="3" y="3" width="18" height="7" rx="2" /><Rect x="3" y="14" width="18" height="7" rx="2" /></I>,
  palette: (p: P) => <I {...p}><Circle cx="13.5" cy="6.5" r=".5" /><Circle cx="17.5" cy="10.5" r=".5" /><Circle cx="8.5" cy="7.5" r=".5" /><Circle cx="6.5" cy="12.5" r=".5" /><Path d="M12 2a10 10 0 0 0 0 20c.93 0 1.5-.75 1.5-1.66 0-.43-.17-.82-.44-1.11-.28-.29-.44-.68-.44-1.11a1.64 1.64 0 0 1 1.67-1.66h2a5.55 5.55 0 0 0 5.5-5.56C21.78 6 17.4 2 12 2" /></I>,
  refresh: (p: P) => <I {...p}><Path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7l3-2.7M21 21v-5h-5" /></I>,
  headphones: (p: P) => <I {...p}><Path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></I>,
  bell: (p: P) => <I {...p}><Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></I>,
  rocket: (p: P) => <I {...p}><Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><Path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></I>,
  chevron: (p: P) => <I {...p}><Path d="m9 18 6-6-6-6" /></I>,
  search: (p: P) => <I {...p}><Circle cx="11" cy="11" r="8" /><Path d="m21 21-4.3-4.3" /></I>,
};

export type IconName = keyof typeof icons;
