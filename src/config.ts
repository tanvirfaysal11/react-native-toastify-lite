/**
 * Pure helpers: animation presets, springs, timing, layout math, positions.
 */
import {
  BADGE_SIZE,
  type SpringConfig,
  BODY_PADDING_BOTTOM,
  BODY_PADDING_H,
  BODY_PADDING_TOP,
  BODY_REVEAL_SPRING,
  DEFAULT_COLLAPSE_DURATION,
  DEFAULT_EXPAND_DURATION,
  DEFAULT_SETTLED_DURATION,
  DESC_SIZE,
  EXPANDED_TOAST_MAX_WIDTH,
  ICON_GAP,
  MORPH_COLLAPSE_SPRING,
  MORPH_OVERSHOOT,
  MORPH_SPRING,
  MOUNT_SPRING,
  PH,
  PILL_PADDING_H,
  PILL_RESIZE_SPRING,
  SQUISH_SPRING,
  STACK_SPRING,
  TITLE_SIZE,
  TOAST_MAX_WIDTH,
} from "./constants";
import type {
  IHeightEntry,
  IToastAnimationConfig,
  IToastData,
  IToastTiming,
  TToastAnimationAxis,
  TToastAnimationPreset,
  TToastBodyLayout,
  TToastHorizontalAlign,
  TToastPosition,
  TToastPositionInput,
  TToastSpringConfig,
  TToastVerticalPosition,
} from "./types";

/* --------------------------------- Springs -------------------------------- */

export function mergeSpringConfig(
  base: SpringConfig,
  ...configs: (TToastSpringConfig | undefined)[]
): SpringConfig {
  let out: SpringConfig = { ...base };
  for (const next of configs) if (next) out = { ...out, ...next } as SpringConfig;
  return out;
}

/* --------------------------------- Presets -------------------------------- */

const smoothAnimation: IToastAnimationConfig = {
  mount: { axis: "y", duration: 420, offset: 50 },
  morph: {
    actionDelay: 80,
    collapseDuration: 280,
    squishDuration: 90,
    squishScaleX: 1,
    squishScaleY: 1,
  },
  stack: {
    collapseDelay: 220,
    duration: 420,
    minOpacity: 0.68,
    minScale: 0.9,
    opacityStep: 0.1,
    scaleStep: 0.05,
  },
  compact: { squishDuration: 55, squishScaleX: 1.03, squishScaleY: 0.95 },
  springs: { morph: { damping: 23, stiffness: 235, mass: 1 } },
};

export const toastAnimationPresets: Record<TToastAnimationPreset, IToastAnimationConfig> = {
  smooth: smoothAnimation,
  snappy: {
    ...smoothAnimation,
    mount: { axis: "y", duration: 260, offset: 30 },
    morph: {
      ...smoothAnimation.morph,
      collapseDuration: 190,
      squishDuration: 44,
      squishScaleX: 1.04,
      squishScaleY: 0.92,
    },
    stack: { ...smoothAnimation.stack, collapseDelay: 120, duration: 280 },
    compact: { squishDuration: 40, squishScaleX: 1.02, squishScaleY: 0.97 },
    springs: {
      bodyReveal: { damping: 20, stiffness: 360, mass: 0.7 },
      morph: { damping: 20, stiffness: 360, mass: 0.8 },
      morphCollapse: { damping: 34, stiffness: 360, mass: 0.8 },
      pillResize: { damping: 20, stiffness: 360, mass: 0.8 },
      squish: { damping: 15, stiffness: 460, mass: 0.6 },
    },
  },
  gentle: {
    ...smoothAnimation,
    mount: { axis: "y", duration: 560, offset: 36 },
    morph: {
      ...smoothAnimation.morph,
      collapseDuration: 360,
      squishDuration: 80,
      squishScaleX: 1.035,
      squishScaleY: 0.94,
    },
    stack: {
      ...smoothAnimation.stack,
      collapseDelay: 260,
      duration: 560,
      opacityStep: 0.08,
      scaleStep: 0.04,
    },
    springs: {
      bodyReveal: { damping: 28, stiffness: 170, mass: 1.1 },
      morph: { damping: 30, stiffness: 170, mass: 1.1 },
      morphCollapse: { damping: 28, stiffness: 170, mass: 1.1 },
      pillResize: { damping: 30, stiffness: 170, mass: 1.1 },
      squish: { damping: 22, stiffness: 240, mass: 0.9 },
    },
  },
  minimal: {
    ...smoothAnimation,
    mount: { axis: "none", duration: 180, offset: 0 },
    morph: {
      ...smoothAnimation.morph,
      collapseDuration: 180,
      squishDuration: 1,
      squishScaleX: 1,
      squishScaleY: 1,
    },
    stack: {
      ...smoothAnimation.stack,
      collapseDelay: 80,
      duration: 220,
      minOpacity: 0.78,
      minScale: 0.96,
      opacityStep: 0.06,
      scaleStep: 0.02,
    },
    compact: { squishDuration: 1, squishScaleX: 1, squishScaleY: 1 },
    springs: {
      bodyReveal: { damping: 40, stiffness: 420, mass: 1 },
      morph: { damping: 40, stiffness: 420, mass: 1 },
      morphCollapse: { damping: 41, stiffness: 420, mass: 1 },
      pillResize: { damping: 40, stiffness: 420, mass: 1 },
      squish: { damping: 40, stiffness: 420, mass: 1 },
    },
  },
};

export interface IResolvedToastAnimationConfig {
  compact: { squishDuration: number; squishScaleX: number; squishScaleY: number };
  morph: {
    actionDelay: number;
    bodyFadeDelay?: number;
    bodyFadeDuration?: number;
    collapseDuration: number;
    descriptionDelay?: number;
    squishDelay?: number;
    squishDuration: number;
    squishScaleX: number;
    squishScaleY: number;
  };
  mount: { axis: TToastAnimationAxis; duration: number; offset: number };
  springs: Record<
    "bodyReveal" | "morph" | "morphCollapse" | "mount" | "pillResize" | "squish" | "stack",
    SpringConfig
  >;
  stack: {
    collapseDelay: number;
    duration: number;
    minOpacity: number;
    minScale: number;
    opacityStep: number;
    scaleStep: number;
  };
}

export function mergeAnimationConfig(
  base: IToastAnimationConfig,
  override?: IToastAnimationConfig,
): IToastAnimationConfig {
  return {
    compact: { ...base.compact, ...override?.compact },
    morph: { ...base.morph, ...override?.morph },
    mount: { ...base.mount, ...override?.mount },
    preset: override?.preset ?? base.preset,
    springs: { ...base.springs, ...override?.springs },
    stack: { ...base.stack, ...override?.stack },
  };
}

const INSTANT_SPRING: SpringConfig = { stiffness: 1000, damping: 20, mass: 0.1, overshootClamping: true };

export function resolveToastAnimationConfig({
  animation,
  animationPreset,
  springConfig,
  reduceMotion,
}: {
  animation?: IToastAnimationConfig;
  animationPreset?: TToastAnimationPreset;
  springConfig?: TToastSpringConfig;
  reduceMotion?: boolean;
}): IResolvedToastAnimationConfig {
  const preset = animation?.preset ?? animationPreset ?? "smooth";
  const presetConfig = toastAnimationPresets[preset] ?? toastAnimationPresets.smooth;
  const config = mergeAnimationConfig(presetConfig, animation);
  const springs = config.springs ?? {};

  if (reduceMotion) {
    return {
      compact: { squishDuration: 0, squishScaleX: 1, squishScaleY: 1 },
      morph: {
        actionDelay: 0,
        bodyFadeDelay: 0,
        bodyFadeDuration: 0,
        collapseDuration: 0,
        descriptionDelay: 0,
        squishDelay: 0,
        squishDuration: 0,
        squishScaleX: 1,
        squishScaleY: 1,
      },
      mount: { axis: "none", duration: 0, offset: 0 },
      springs: {
        bodyReveal: INSTANT_SPRING,
        morph: INSTANT_SPRING,
        morphCollapse: INSTANT_SPRING,
        mount: INSTANT_SPRING,
        pillResize: INSTANT_SPRING,
        squish: INSTANT_SPRING,
        stack: INSTANT_SPRING,
      },
      stack: { collapseDelay: 0, duration: 0, minOpacity: 1, minScale: 1, opacityStep: 0, scaleStep: 0 },
    };
  }

  return {
    compact: {
      squishDuration: config.compact?.squishDuration ?? 55,
      squishScaleX: config.compact?.squishScaleX ?? 1.03,
      squishScaleY: config.compact?.squishScaleY ?? 0.95,
    },
    morph: {
      actionDelay: config.morph?.actionDelay ?? 80,
      bodyFadeDelay: config.morph?.bodyFadeDelay,
      bodyFadeDuration: config.morph?.bodyFadeDuration,
      collapseDuration: config.morph?.collapseDuration ?? 280,
      descriptionDelay: config.morph?.descriptionDelay,
      squishDelay: config.morph?.squishDelay,
      squishDuration: config.morph?.squishDuration ?? 90,
      squishScaleX: config.morph?.squishScaleX ?? 1.015,
      squishScaleY: config.morph?.squishScaleY ?? 0.975,
    },
    mount: {
      axis: config.mount?.axis ?? "y",
      duration: config.mount?.duration ?? 420,
      offset: config.mount?.offset ?? 50,
    },
    springs: {
      bodyReveal: mergeSpringConfig(BODY_REVEAL_SPRING, springConfig, springs.bodyReveal),
      morph: mergeSpringConfig(MORPH_SPRING, springConfig, springs.morph),
      morphCollapse: mergeSpringConfig(MORPH_COLLAPSE_SPRING, springConfig, springs.morphCollapse),
      mount: mergeSpringConfig(MOUNT_SPRING, springConfig, springs.mount),
      pillResize: mergeSpringConfig(PILL_RESIZE_SPRING, springConfig, springs.pillResize),
      squish: mergeSpringConfig(SQUISH_SPRING, springConfig, springs.squish),
      stack: mergeSpringConfig(STACK_SPRING, springConfig, springs.stack),
    },
    stack: {
      collapseDelay: config.stack?.collapseDelay ?? 220,
      duration: config.stack?.duration ?? 420,
      minOpacity: config.stack?.minOpacity ?? 0.68,
      minScale: config.stack?.minScale ?? 0.9,
      opacityStep: config.stack?.opacityStep ?? 0.1,
      scaleStep: config.stack?.scaleStep ?? 0.05,
    },
  };
}

/* --------------------------------- Timing --------------------------------- */

type TTimingSource = { timing?: IToastTiming; duration?: number };

export const getExpandDuration = (s: TTimingSource) => s.timing?.expandDuration ?? DEFAULT_EXPAND_DURATION;
export const getCollapseDuration = (s: TTimingSource) =>
  s.timing?.collapseDuration ?? DEFAULT_COLLAPSE_DURATION;
export const getBodyFadeDelay = (s: TTimingSource) => Math.max(70, Math.round(getExpandDuration(s) * 0.22));
export const getBodyFadeDuration = (s: TTimingSource) =>
  Math.max(170, Math.round(getExpandDuration(s) * 0.42));
export const getDisplayDuration = (s: TTimingSource) =>
  s.timing?.displayDuration ?? s.duration ?? DEFAULT_SETTLED_DURATION;
export const getProgressDuration = (t: IToastData, hasBody: boolean, shouldAutoExpand: boolean) =>
  getDisplayDuration(t) + (hasBody && shouldAutoExpand ? getExpandDuration(t) : 0);

/* --------------------------------- Layout --------------------------------- */

const ACTION_BUTTON_MIN_HEIGHT = 28;
const CENTER_ACTION_BOTTOM_GAP = 10;
const DESCRIPTION_ACTION_GAP = 12;
const DESCRIPTION_CHAR_WIDTH = DESC_SIZE * 0.52;
const DESCRIPTION_META_WIDTH = 82;
const DESCRIPTION_ROW_GAP = 14;
const INLINE_PROGRESS_GAP_HEIGHT = 15;

export function getToastWidths(p: {
  title: string;
  screenWidth: number;
  measuredPillWidth: number;
  expandedWidth?: number;
  horizontalInset: number;
}) {
  const availableWidth = Math.max(PH, p.screenWidth - p.horizontalInset * 2);
  const maxWidth = Math.min(availableWidth, TOAST_MAX_WIDTH);
  const textWidth = (p.title?.length ?? 0) * (TITLE_SIZE * 0.72);
  const estimated = Math.min(textWidth + PILL_PADDING_H * 2 + BADGE_SIZE + ICON_GAP + 8, maxWidth);
  const pillWidth = p.measuredPillWidth > 0 ? Math.min(p.measuredPillWidth, maxWidth) : estimated;
  const expandedWidth = Math.min(p.expandedWidth ?? EXPANDED_TOAST_MAX_WIDTH, availableWidth);
  return { bodyWidth: Math.max(pillWidth, expandedWidth), maxWidth: availableWidth, pillWidth };
}

interface IToastHeightParams {
  actionLabel?: string;
  bodyLayout: TToastBodyLayout;
  bodyWidth: number;
  description?: string;
  expandedHeightOverride?: number;
  frontHeight: number;
  hasCustomContent: boolean;
  isFront: boolean;
  measuredHeight: number;
  measuredCurrent: boolean;
  meta?: string;
  showProgress: boolean;
}

export function getToastHeights(p: IToastHeightParams) {
  const calculated = getCalculatedExpandedHeight(p);
  // Toast estimates text height from character counts. Lite keeps that
  // estimate but never lets it be shorter than the real measured layout, so a
  // wider font cannot clip the last line.
  const best =
    calculated !== undefined && p.measuredCurrent ? Math.max(calculated, p.measuredHeight) : calculated;
  const expandedHeight = Math.max(p.expandedHeightOverride ?? best ?? p.measuredHeight, PH);
  const collapsedCardHeight = p.isFront ? PH : Math.max(p.frontHeight, PH);
  const overshootHeadroom = (expandedHeight - PH) * MORPH_OVERSHOOT;
  return {
    collapsedCardHeight,
    expandedHeight,
    renderHeight: Math.max(expandedHeight + overshootHeadroom, p.frontHeight, PH),
  };
}

function getCalculatedExpandedHeight(p: IToastHeightParams) {
  if (p.hasCustomContent) return undefined;
  if (!p.description && !p.actionLabel) return PH;

  const bodyWidth = Math.max(PH, p.bodyWidth - BODY_PADDING_H * 2);
  const descriptionHeight = p.description
    ? getDescriptionHeight(p.bodyLayout, bodyWidth, p.description, Boolean(p.meta))
    : 0;
  const actionHeight = p.actionLabel ? ACTION_BUTTON_MIN_HEIGHT : 0;
  const gap = p.description && p.actionLabel ? DESCRIPTION_ACTION_GAP : 0;
  const centerGap = p.bodyLayout === "center" && p.actionLabel ? CENTER_ACTION_BOTTOM_GAP : 0;
  const progressHeight = p.showProgress ? INLINE_PROGRESS_GAP_HEIGHT : 0;
  return (
    PH +
    BODY_PADDING_TOP +
    descriptionHeight +
    gap +
    actionHeight +
    centerGap +
    progressHeight +
    BODY_PADDING_BOTTOM
  );
}

function getDescriptionHeight(
  bodyLayout: TToastBodyLayout,
  bodyWidth: number,
  description: string,
  hasMeta: boolean,
) {
  const textWidth =
    bodyLayout === "spread" || bodyLayout === "right"
      ? bodyWidth - (hasMeta ? DESCRIPTION_META_WIDTH + DESCRIPTION_ROW_GAP : 0)
      : bodyWidth;
  const available = Math.max(DESC_SIZE, textWidth);
  const lineHeight = 20;
  const lines = description
    .split("\n")
    .reduce(
      (count, line) => count + Math.max(1, Math.ceil((line.length * DESCRIPTION_CHAR_WIDTH) / available)),
      0,
    );
  return lines * lineHeight;
}

/* ------------------------------ Positions / meta --------------------------- */

export const TOAST_POSITIONS: TToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export const getDefaultVertical = (p: TToastPositionInput): TToastVerticalPosition =>
  p.startsWith("top") ? "top" : "bottom";

export function getHorizontalPosition(p: TToastPosition): TToastHorizontalAlign {
  if (p.endsWith("right")) return "right";
  if (p.includes("center")) return "center";
  return "left";
}

export function resolveToastStackPosition(
  base: TToastPosition,
  position?: TToastPositionInput,
): TToastPosition {
  if (position && TOAST_POSITIONS.includes(position as TToastPosition)) {
    return position as TToastPosition;
  }
  const vertical = position ?? getDefaultVertical(base);
  return `${vertical}-${getHorizontalPosition(base)}` as TToastPosition;
}

export const filterToastsForPosition = (
  toasts: IToastData[],
  base: TToastPosition,
  position: TToastPosition,
) => toasts.filter((t) => resolveToastStackPosition(base, t.position) === position);

export const getBodyLayout = (l?: TToastBodyLayout): TToastBodyLayout => l ?? "spread";

export function getBodyTextAlign(l: TToastBodyLayout): TToastHorizontalAlign {
  if (l === "center") return "center";
  if (l === "right") return "right";
  return "left";
}

export function getMorphAlign(
  bodyLayout: TToastBodyLayout,
  stackAlign: TToastHorizontalAlign,
): TToastHorizontalAlign {
  if (bodyLayout === "left") return "left";
  if (bodyLayout === "center") return "center";
  if (bodyLayout === "right") return "right";
  return stackAlign;
}

export function getToastMeta(toast: IToastData, showTimestamp: boolean) {
  if (toast.meta) return toast.meta;
  if (!showTimestamp) return undefined;
  return new Date(toast.createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ---------------------------------- Stack --------------------------------- */

export const buildHeightMap = (heights: IHeightEntry[]) =>
  heights.reduce((m, e) => m.set(e.toastId, e.height), new Map<string, number>());

export function getExpandedOffsets(toasts: IToastData[], heights: Map<string, number>, gap: number) {
  const offsets = new Map<string, number>();
  let running = 0;
  toasts.forEach((t, i) => {
    offsets.set(t.id, running);
    running += (heights.get(t.id) ?? PH) + (i < toasts.length - 1 ? gap : 0);
  });
  return offsets;
}

export const getCollapsedOffsets = (toasts: IToastData[], visible: number, gap: number) =>
  toasts.reduce((m, t, i) => m.set(t.id, Math.min(i, visible - 1) * gap), new Map<string, number>());

export function getFrontHeight(toasts: IToastData[], heights: Map<string, number>) {
  const front = toasts[0];
  return front ? Math.max(heights.get(front.id) ?? PH, PH) : PH;
}
