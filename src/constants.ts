export type SpringConfig = { damping: number; stiffness: number; mass: number; overshootClamping?: boolean; velocity?: number };

export const MORPH_SWAP_COLLAPSE_MS = 350;

/** pill height */
export const PH = 40;
export const TOAST_MAX_WIDTH = 350;
export const PILL_PADDING_H = 12;
export const BODY_PADDING_H = 16;
export const BODY_PADDING_TOP = 16;
export const BODY_PADDING_BOTTOM = 16;
export const ICON_SIZE = 16;
export const ICON_GAP = 8;
export const BADGE_SIZE = 24;
export const TITLE_SIZE = 13.2;
export const DESC_SIZE = 14;
export const ACTION_SIZE = 12;
export const DEFAULT_VISIBLE_TOASTS = 3;
export const DEFAULT_GAP = 12;
export const DEFAULT_OFFSET = 12;
export const DEFAULT_DURATION = 6000;
export const DEFAULT_BODY_RADIUS = 16;
export const DEFAULT_CORNER_SMOOTHING = 0;
export const DEFAULT_SWIPE_THRESHOLD = 45;
export const DEFAULT_HORIZONTAL_INSET = 12;
export const EXPANDED_TOAST_MAX_WIDTH = 350;
export const SHOW_BODY_DELAY = 330;

export const MORPH_OVERSHOOT = 0.14;

export const MOUNT_SPRING: SpringConfig = { damping: 16, stiffness: 200, mass: 0.7 };
export const STACK_SPRING: SpringConfig = { damping: 20, stiffness: 220, mass: 0.7 };
export const MORPH_SPRING: SpringConfig = { damping: 23, stiffness: 235, mass: 1 };
export const MORPH_COLLAPSE_SPRING: SpringConfig = { damping: 31, stiffness: 235, mass: 1 };
export const PILL_RESIZE_SPRING: SpringConfig = MORPH_SPRING;
export const BODY_REVEAL_SPRING: SpringConfig = MORPH_SPRING;
export const SQUISH_SPRING: SpringConfig = { damping: 16, stiffness: 375, mass: 0.5 };

/* ------------------------------ Card internals ----------------------------- */

export const COLLAPSE_BODY_UNMOUNT_DELAY = 320;
export const MORPH_BODY_DELAY = 200;
export const STACKED_FRONT_REVEAL_DELAY = SHOW_BODY_DELAY + 220;
export const DISMISS_COLLAPSE_LEAD = 170;
export const PROMISE_PENDING_DURATION = 60 * 60 * 1000;

export const EXIT_TRAVEL = 0.35;
export const EXIT_SCALE = 0.94;
export const MOUNT_SCALE = 0.95;

/* ------------------------------ Header morph ------------------------------ */

export const HEADER_LAYER_CLEAR_MS = 380;
export const HEADER_TITLE_EXIT_MS = 300;
export const HEADER_TITLE_MORPH_MS = 520;
export const HEADER_LAYER_MAX_BLUR_PX = 2.5;

/* --------------------------------- Timing --------------------------------- */

export const DEFAULT_COLLAPSE_DURATION = 900;
export const DEFAULT_EXPAND_DURATION = 900;
export const DEFAULT_SETTLED_DURATION = 5000;
