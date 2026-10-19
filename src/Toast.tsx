/**
 * One toast card: use-toast-card, use-toast-effects, use-toast-dismiss,
 * use-toast-gesture, use-toast-measurements, the animated style hooks, the
 * card and surface, with springs, delays and formulas. Swipe uses React
 * Native's PanResponder instead of react-native-gesture-handler, with the
 * same thresholds and fling physics.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, PanResponder, Platform, Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import {
  getBodyFadeDelay,
  getBodyFadeDuration,
  getBodyLayout,
  getCollapseDuration,
  getDisplayDuration,
  getExpandDuration,
  getHorizontalPosition,
  getMorphAlign,
  getProgressDuration,
  getToastHeights,
  getToastMeta,
  getToastWidths,
  resolveToastAnimationConfig,
} from "./config";
import {
  BODY_PADDING_BOTTOM,
  BODY_PADDING_TOP,
  COLLAPSE_BODY_UNMOUNT_DELAY,
  DEFAULT_BODY_RADIUS,
  DEFAULT_CORNER_SMOOTHING,
  DISMISS_COLLAPSE_LEAD,
  EXIT_SCALE,
  EXIT_TRAVEL,
  MORPH_BODY_DELAY,
  MORPH_OVERSHOOT,
  MOUNT_SCALE,
  PH,
  SHOW_BODY_DELAY,
  STACKED_FRONT_REVEAL_DELAY,
} from "./constants";
import { iconMap } from "./icons";
import { getMorphExtents, morphPanelPath, morphShapePath } from "./morph";
import { styles } from "./styles";
import { useToastTheme } from "./theme";
import { ToastBody, ToastMeasure, ToastProgress } from "./ToastBody";
import { ToastHeader } from "./ToastHeader";
import type {
  IToastAnimationConfig,
  IToastData,
  IToastStyleOverrides,
  TToastBodyLayout,
  TToastPosition,
  TToastSpringConfig,
} from "./types";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface IToastProps {
  toast: IToastData;
  index: number;
  totalCount: number;
  visibleCount: number;
  expanded: boolean;
  expandedOffset: number;
  collapsedOffset: number;
  frontHeight: number;
  position: TToastPosition;
  gap: number;
  morphMode?: boolean;
  dismissPaused?: boolean;
  forceCollapsed?: boolean;
  swipeToDismiss: boolean;
  swipeThreshold: number;
  defaultAnimation?: IToastAnimationConfig;
  defaultAnimationPreset?: IToastData["animationPreset"];
  defaultBodyLayout: TToastBodyLayout;
  defaultBodyRadius?: number;
  defaultCornerSmoothing?: number;
  defaultExpandedHeight?: number;
  defaultExpandedWidth?: number;
  defaultFill?: string;
  defaultHorizontalInset: number;
  defaultShowProgress: boolean;
  defaultShowTimestamp: boolean;
  defaultSpringConfig?: TToastSpringConfig;
  defaultStroke?: string;
  defaultTextColor?: string;
  defaultReduceMotion?: boolean;
  defaultStyles?: IToastStyleOverrides;
  onRemove: (id: string) => void;
  onHeightChange: (id: string, height: number) => void;
  onStackPress?: () => void;
}

/* ------------------------------ Shared values ------------------------------ */

function useToastValues() {
  const v = {
    actionProgress: useSharedValue(0),
    bodyWidth: useSharedValue(PH),
    bodyOpacity: useSharedValue(0),
    bodyRadius: useSharedValue(DEFAULT_BODY_RADIUS),
    cornerSmoothing: useSharedValue(DEFAULT_CORNER_SMOOTHING),
    collapsedHeight: useSharedValue(PH),
    descriptionProgress: useSharedValue(0),
    expandedHeight: useSharedValue(PH),
    morphProgress: useSharedValue(0),
    mountProgress: useSharedValue(0),
    pillWidth: useSharedValue(PH),
    progress: useSharedValue(0),
    removeProgress: useSharedValue(0),
    shakeX: useSharedValue(0),
    squishX: useSharedValue(1),
    squishY: useSharedValue(1),
    stackOpacity: useSharedValue(1),
    stackScale: useSharedValue(1),
    stackY: useSharedValue(0),
    swipeX: useSharedValue(0),
    swipeY: useSharedValue(0),
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable
  return useMemo(() => v, []);
}
type ToastValues = ReturnType<typeof useToastValues>;

/* ------------------------------- Measurements ------------------------------ */

function useMeasurements(
  headerKey: string,
  cardKey: string,
  toastId: string,
  onHeightChange: (id: string, h: number) => void,
) {
  const [measuredHeight, setMeasuredHeight] = useState(PH);
  const [measuredPillWidth, setMeasuredPillWidth] = useState(0);
  const [measuredCardKey, setMeasuredCardKey] = useState("");
  const [measuredHeaderKey, setMeasuredHeaderKey] = useState("");

  const onMeasureCard = useCallback(
    (e: LayoutChangeEvent) => {
      const h = Math.max(e.nativeEvent.layout.height, PH);
      setMeasuredHeight((c) => (Math.abs(c - h) < 1 ? c : h));
      setMeasuredCardKey(cardKey);
      onHeightChange(toastId, h);
    },
    [cardKey, onHeightChange, toastId],
  );

  const onMeasureHeader = useCallback(
    (e: LayoutChangeEvent) => {
      const w = Math.max(e.nativeEvent.layout.width, PH);
      setMeasuredPillWidth((c) => (Math.abs(c - w) < 1 ? c : w));
      setMeasuredHeaderKey(headerKey);
    },
    [headerKey],
  );

  return {
    measuredHeight,
    measuredPillWidth,
    isCardHeightCurrent: measuredCardKey === cardKey,
    isPillWidthCurrent: measuredHeaderKey === headerKey,
    onMeasureCard,
    onMeasureHeader,
  };
}

/* --------------------------------- Dismiss -------------------------------- */

function useDismiss(p: {
  toast: IToastData;
  animationConfig: ReturnType<typeof resolveToastAnimationConfig>;
  hasBody: boolean;
  showBody: boolean;
  isExpandedCandidate: boolean;
  isFront: boolean;
  isVisible: boolean;
  expanded: boolean;
  onRemove: (id: string) => void;
  paused: boolean;
  timerPaused: boolean;
  shouldAutoExpand: boolean;
  values: ToastValues;
}) {
  const { toast, animationConfig, hasBody, showBody, onRemove, paused, timerPaused, shouldAutoExpand, values } = p;
  const springs = animationConfig.springs;
  const [isDismissing, setIsDismissing] = useState(false);
  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const bodyVisibleRef = useRef(false);
  const collapseDuration = getCollapseDuration(toast);
  const displayDuration = getDisplayDuration(toast);

  useEffect(() => {
    dismissedRef.current = false;
    remainingRef.current = null;
    startRef.current = 0;
    bodyVisibleRef.current = false;
    setIsDismissing(false);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast.id, toast.count]);

  useEffect(() => {
    bodyVisibleRef.current = hasBody && showBody && !isDismissing && p.isExpandedCandidate;
  }, [hasBody, isDismissing, p.isExpandedCandidate, showBody]);

  const handleDismiss = useCallback(() => {
    if (paused || dismissedRef.current) return;
    dismissedRef.current = true;
    const collapseBeforeExit = hasBody && bodyVisibleRef.current;
    setIsDismissing(collapseBeforeExit);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (collapseBeforeExit) {
      values.morphProgress.value = withSpring(0, springs.morphCollapse);
      values.squishY.value = withSpring(1, springs.morphCollapse);
      values.squishX.value = withSpring(1, springs.morphCollapse);
    } else {
      const anim = { duration: 100, easing: Easing.bezier(0.4, 0, 0.2, 1) };
      values.morphProgress.value = withTiming(0, anim);
      values.squishY.value = withTiming(1, anim);
      values.squishX.value = withTiming(1, anim);
    }

    const shapeDuration = collapseBeforeExit ? Math.max(260, animationConfig.morph.collapseDuration) : 100;
    const contentDuration = collapseBeforeExit ? Math.max(60, Math.round(shapeDuration * 0.08)) : 90;
    const fade = () => withTiming(0, { duration: contentDuration, easing: Easing.out(Easing.quad) });
    values.bodyOpacity.value = fade();
    values.descriptionProgress.value = fade();
    values.actionProgress.value = fade();

    const exitFade = 300;
    const exitDelay = collapseBeforeExit ? DISMISS_COLLAPSE_LEAD : 0;
    values.removeProgress.value = withDelay(
      exitDelay,
      withTiming(1, { duration: exitFade, easing: Easing.out(Easing.cubic) }),
    );
    toast.onDismiss?.();
    setTimeout(() => onRemove(toast.id), exitDelay + exitFade + 40);
  }, [animationConfig.morph.collapseDuration, hasBody, onRemove, paused, springs, toast, values]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mirrors the timer dependencies
  useEffect(() => {
    if (paused || timerPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (!p.isVisible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (hasBody && shouldAutoExpand && !showBody) return;

    const autoDelay =
      hasBody && shouldAutoExpand
        ? Math.max(0, displayDuration - SHOW_BODY_DELAY - collapseDuration)
        : displayDuration;
    const delay = remainingRef.current ?? autoDelay;
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      remainingRef.current = null;
      toast.onAutoClose?.();
      handleDismiss();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const remaining = delay - (Date.now() - startRef.current);
      remainingRef.current = remaining > 0 ? remaining : null;
    };
  }, [
    collapseDuration,
    displayDuration,
    p.expanded,
    handleDismiss,
    hasBody,
    p.isFront,
    p.isVisible,
    paused,
    timerPaused,
    showBody,
    shouldAutoExpand,
    toast,
  ]);

  return { handleDismiss, isDismissing };
}

/* --------------------------------- Gesture -------------------------------- */

function usePan(p: {
  isTop: boolean;
  enabled: boolean;
  threshold: number;
  onDismiss: () => void;
  values: ToastValues;
}) {
  const latest = useRef(p);
  latest.current = p;
  return useMemo(
    () =>
      PanResponder.create({
        // activeOffsetX/Y [-10, 10]
        onMoveShouldSetPanResponderCapture: (_, g) =>
          latest.current.enabled && (Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10),
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          const { isTop, values } = latest.current;
          const naturalDir = isTop ? -1 : 1;
          const dampening = 1 / (1.5 + Math.abs(g.dy) / 20);
          values.swipeX.value = g.dx;
          values.swipeY.value = g.dy * naturalDir > 0 ? g.dy * dampening : g.dy;
        },
        onPanResponderRelease: (_, g) => {
          const { isTop, values, threshold, onDismiss } = latest.current;
          const absDx = Math.abs(g.dx);
          const absDy = Math.abs(g.dy);
          // PanResponder velocity is already px/ms (gesture-handler's px/s / 1000)
          const velocity = Math.max(Math.abs(g.vx), Math.abs(g.vy));
          if (absDx >= threshold || absDy >= threshold || velocity > 0.5) {
            values.swipeX.value = withTiming(absDx > absDy ? (g.dx > 0 ? 420 : -420) : 0, { duration: 150 });
            values.swipeY.value = withTiming(absDy >= absDx ? (isTop ? -320 : 320) : 0, { duration: 150 });
            onDismiss();
            return;
          }
          values.swipeX.value = withSpring(0, { damping: 20, stiffness: 320 });
          values.swipeY.value = withSpring(0, { damping: 20, stiffness: 320 });
        },
        onPanResponderTerminate: () => {
          const { values } = latest.current;
          values.swipeX.value = withSpring(0, { damping: 20, stiffness: 320 });
          values.swipeY.value = withSpring(0, { damping: 20, stiffness: 320 });
        },
      }),
    [],
  );
}

/* --------------------------------- Effects -------------------------------- */

function useEffects(p: {
  animationConfig: ReturnType<typeof resolveToastAnimationConfig>;
  bodyWidth: number;
  bodyRadius: number;
  toast: IToastData;
  expanded: boolean;
  expandedOffset: number;
  collapsedOffset: number;
  expandedHeight: number;
  collapsedCardHeight: number;
  hasBody: boolean;
  isFront: boolean;
  isMeasured: boolean;
  isTop: boolean;
  isDismissing: boolean;
  morphMode: boolean;
  pillWidth: number;
  shouldAutoExpand: boolean;
  shouldShowExpandedBody: boolean;
  stackDepth: number;
  values: ToastValues;
}) {
  const {
    animationConfig: cfg,
    bodyWidth,
    bodyRadius,
    collapsedCardHeight,
    expandedHeight,
    hasBody,
    isMeasured,
    morphMode,
    pillWidth,
    shouldShowExpandedBody,
    toast,
    values,
  } = p;
  const springs = cfg.springs;
  const expandDuration = getExpandDuration(toast);
  const collapseDuration = getCollapseDuration(toast);
  const bodyFadeDelay = cfg.morph.bodyFadeDelay ?? getBodyFadeDelay(toast);
  const bodyFadeDuration = cfg.morph.bodyFadeDuration ?? getBodyFadeDuration(toast);
  const descriptionDelay = cfg.morph.descriptionDelay ?? 0;
  const actionDelay = cfg.morph.actionDelay;
  const squishDelay = cfg.morph.squishDelay ?? Math.max(24, Math.round(expandDuration * 0.08));
  const dimensionsReady = useRef(false);
  const firstRealMeasure = useRef(false);
  const compactSignature = useRef<string | null>(null);
  const prevExpandedInStack = useRef(false);

  // Dimensions
  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable
  useEffect(() => {
    if (!dimensionsReady.current || !firstRealMeasure.current) {
      values.pillWidth.value = pillWidth;
      values.bodyWidth.value = bodyWidth;
      values.bodyRadius.value = bodyRadius;
      values.collapsedHeight.value = collapsedCardHeight;
      values.expandedHeight.value = expandedHeight;
      dimensionsReady.current = true;
      if (isMeasured) firstRealMeasure.current = true;
      return;
    }
    if (!isMeasured) return;

    const animateDims = morphMode || (hasBody && shouldShowExpandedBody);
    const spring = morphMode ? springs.morph : springs.pillResize;
    const timing = { duration: expandDuration, easing: Easing.out(Easing.cubic) };
    const to = (v: number) => (morphMode ? withSpring(v, spring) : withTiming(v, timing));

    values.bodyWidth.value = animateDims ? to(bodyWidth) : bodyWidth;
    values.bodyRadius.value = animateDims ? to(bodyRadius) : bodyRadius;
    values.expandedHeight.value = animateDims ? to(expandedHeight) : expandedHeight;
    values.pillWidth.value =
      animateDims && !morphMode ? withTiming(pillWidth, timing) : withSpring(pillWidth, spring);
    values.collapsedHeight.value =
      animateDims && !morphMode ? withTiming(collapsedCardHeight, timing) : withSpring(collapsedCardHeight, spring);
  }, [
    bodyWidth,
    bodyRadius,
    collapsedCardHeight,
    expandDuration,
    expandedHeight,
    hasBody,
    isMeasured,
    morphMode,
    pillWidth,
    shouldShowExpandedBody,
    springs,
  ]);

  // Mount (drop in once measured)
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current || !isMeasured) return;
    mounted.current = true;
    values.mountProgress.value = withSpring(1, springs.mount);
  }, [isMeasured, springs, values]);

  // Error shake
  useEffect(() => {
    if (toast.type !== "error") return;
    values.shakeX.value = withSequence(
      withTiming(3, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [toast.type, values]);

  // Compact squish (title-only toast changes, stack mode)
  useEffect(() => {
    if (!dimensionsReady.current || hasBody || morphMode) return;
    const sig = `${toast.type}:${toast.title}:${pillWidth}`;
    if (compactSignature.current === null) {
      compactSignature.current = sig;
      return;
    }
    if (compactSignature.current === sig) return;
    compactSignature.current = sig;
    cancelAnimation(values.squishY);
    cancelAnimation(values.squishX);
    values.squishY.value = withSequence(
      withTiming(cfg.compact.squishScaleY, { duration: cfg.compact.squishDuration }),
      withSpring(1, springs.squish),
    );
    values.squishX.value = withSequence(
      withTiming(cfg.compact.squishScaleX, { duration: cfg.compact.squishDuration }),
      withSpring(1, springs.squish),
    );
  }, [hasBody, morphMode, pillWidth, springs, cfg.compact, toast.title, toast.type, values]);

  // Morph open / close
  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable
  useEffect(() => {
    cancelAnimation(values.morphProgress);
    cancelAnimation(values.bodyOpacity);
    cancelAnimation(values.descriptionProgress);
    cancelAnimation(values.actionProgress);
    cancelAnimation(values.squishY);
    cancelAnimation(values.squishX);

    if (shouldShowExpandedBody) {
      values.morphProgress.value = withSpring(1, springs.morph);
      values.bodyOpacity.value = withDelay(
        bodyFadeDelay,
        withTiming(1, { duration: bodyFadeDuration, easing: Easing.out(Easing.cubic) }),
      );
      values.descriptionProgress.value = withDelay(descriptionDelay, withSpring(1, springs.bodyReveal));
      values.actionProgress.value = withDelay(actionDelay, withSpring(1, springs.bodyReveal));
      values.squishY.value = withDelay(
        squishDelay,
        withSequence(
          withTiming(cfg.morph.squishScaleY, { duration: cfg.morph.squishDuration }),
          withSpring(1, springs.squish),
        ),
      );
      values.squishX.value = withDelay(
        squishDelay,
        withSequence(
          withTiming(cfg.morph.squishScaleX, { duration: cfg.morph.squishDuration }),
          withSpring(1, springs.squish),
        ),
      );
      return;
    }

    const shape = Math.max(260, cfg.morph.collapseDuration);
    const fadeDelay = Math.round(shape * 0.04);
    const fadeDuration = Math.max(60, Math.round(shape * 0.08));
    const fade = (to: number) =>
      withDelay(fadeDelay, withTiming(to, { duration: fadeDuration, easing: Easing.out(Easing.quad) }));
    values.bodyOpacity.value = fade(0);
    values.descriptionProgress.value = fade(0);
    values.actionProgress.value = fade(0);
    values.squishY.value = withSpring(1, springs.morphCollapse);
    values.squishX.value = withSpring(1, springs.morphCollapse);
    values.morphProgress.value = withSpring(0, springs.morphCollapse);
  }, [
    bodyFadeDelay,
    bodyFadeDuration,
    collapseDuration,
    expandDuration,
    actionDelay,
    cfg.morph.collapseDuration,
    cfg.morph.squishDuration,
    cfg.morph.squishScaleX,
    cfg.morph.squishScaleY,
    descriptionDelay,
    springs,
    shouldShowExpandedBody,
    squishDelay,
  ]);

  // Stack position / scale / opacity
  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable
  useEffect(() => {
    const expandedInStack = !p.isDismissing && (p.expanded || shouldShowExpandedBody);
    const collapsing = prevExpandedInStack.current && !expandedInStack;
    prevExpandedInStack.current = expandedInStack;
    const translate = (expandedInStack ? p.expandedOffset : p.collapsedOffset) * (p.isTop ? 1 : -1);
    const scale = expandedInStack ? 1 : Math.max(cfg.stack.minScale, 1 - p.stackDepth * cfg.stack.scaleStep);
    const opacity = expandedInStack
      ? 1
      : Math.max(cfg.stack.minOpacity, 0.94 - p.stackDepth * cfg.stack.opacityStep);
    const anim = { duration: cfg.stack.duration, easing: Easing.out(Easing.cubic) };
    const to = (v: number) => (collapsing ? withSpring(v, springs.morphCollapse) : withTiming(v, anim));
    values.stackY.value = to(translate);
    values.stackScale.value = to(scale);
    values.stackOpacity.value = to(opacity);
  }, [
    collapsedCardHeight,
    expandedHeight,
    p.isFront,
    cfg.morph.collapseDuration,
    p.collapsedOffset,
    p.expanded,
    p.expandedOffset,
    p.isDismissing,
    p.isTop,
    springs,
    cfg.stack,
    shouldShowExpandedBody,
    p.stackDepth,
  ]);

  // Progress bar
  // biome-ignore lint/correctness/useExhaustiveDependencies: restarts on each toast update
  useEffect(() => {
    values.progress.value = withTiming(1, {
      duration: getProgressDuration(toast, hasBody, p.shouldAutoExpand),
      easing: Easing.linear,
    });
  }, [hasBody, p.shouldAutoExpand, toast]);
}

/* ------------------------------ Animated styles ---------------------------- */

function useAnimatedToastStyles(p: {
  animationConfig: ReturnType<typeof resolveToastAnimationConfig>;
  bodyWidth: number;
  expanded: boolean;
  index: number;
  isFront: boolean;
  isTop: boolean;
  morphAlign: "left" | "center" | "right";
  noHeader: boolean;
  totalCount: number;
  values: ToastValues;
}) {
  const { values: v, morphAlign, bodyWidth, noHeader, isTop, totalCount, index, expanded, isFront } = p;
  const mountOffset = p.animationConfig.mount.offset;
  const mountAxis = p.animationConfig.mount.axis;
  const dir = isTop ? -1 : 1;
  const max = 1 + MORPH_OVERSHOOT;

  const cardStyle = useAnimatedStyle(() => {
    const mount = v.mountProgress.value;
    const remove = v.removeProgress.value;
    const base = dir * mountOffset;
    const travel = (1 - mount) * base + remove * base * EXIT_TRAVEL;
    const fade = mount > 1 ? 1 : mount;
    const opacity = fade * (1 - remove) * v.stackOpacity.value;
    const tx = mountAxis === "x" ? travel : 0;
    const ty = mountAxis === "y" ? travel : 0;
    const presence = (1 - (1 - fade) * (1 - MOUNT_SCALE)) * (1 - remove * (1 - EXIT_SCALE));
    const scale = v.stackScale.value * presence;
    return {
      opacity: opacity > 0 ? opacity : 0,
      zIndex: totalCount - index,
      transform: [
        { translateY: ty + v.stackY.value + v.swipeY.value },
        { translateX: tx + v.shakeX.value + v.swipeX.value },
        { scaleX: scale * v.squishX.value },
        { scaleY: scale * v.squishY.value },
      ],
    };
  }, [dir, mountOffset, mountAxis, totalCount, index]);

  const shellStyle = useAnimatedStyle(() => {
    const raw = v.morphProgress.value;
    const t = raw < 0 ? 0 : raw > max ? max : raw;
    const collapsed = v.collapsedHeight.value;
    const exp = v.expandedHeight.value;
    const x = getMorphExtents(bodyWidth, v.pillWidth.value, v.bodyWidth.value, (exp - PH) * t, exp - PH, morphAlign);
    const left = Math.min(x.pillLeft, x.bodyLeft);
    const right = Math.max(x.pillRight, x.bodyRight);
    return { width: right - left, height: collapsed + (exp - collapsed) * t };
  }, [bodyWidth, morphAlign]);

  const pathProps = useAnimatedProps(() => {
    const raw = v.morphProgress.value;
    const t = raw < 0 ? 0 : raw > max ? max : raw;
    const exp = v.expandedHeight.value;
    if (noHeader) {
      return {
        d: morphPanelPath(bodyWidth, v.bodyWidth.value, PH + (exp - PH) * t, t, morphAlign, v.bodyRadius.value, v.cornerSmoothing.value),
      };
    }
    return {
      d: morphShapePath(
        bodyWidth,
        v.pillWidth.value,
        v.bodyWidth.value,
        (exp - PH) * t,
        exp - PH,
        morphAlign,
        v.bodyRadius.value,
        v.cornerSmoothing.value,
      ),
    };
  }, [bodyWidth, morphAlign, noHeader]);

  const bodyStyle = useAnimatedStyle(() => {
    const raw = v.morphProgress.value;
    const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    const exp = v.expandedHeight.value;
    const bodyH = noHeader ? exp : exp > PH ? exp - PH : 0;
    return {
      opacity: v.bodyOpacity.value * t,
      height: bodyH * t,
      overflow: "hidden" as const,
      paddingTop: BODY_PADDING_TOP * t,
      paddingBottom: BODY_PADDING_BOTTOM * t,
      width: v.bodyWidth.value,
    };
  }, [noHeader]);

  const descriptionStyle = useAnimatedStyle(() => {
    const o = v.bodyOpacity.value * v.descriptionProgress.value;
    return { opacity: o < 0 ? 0 : o > 1 ? 1 : o };
  });

  const actionStyle = useAnimatedStyle(() => {
    const o = v.bodyOpacity.value * v.actionProgress.value;
    return { opacity: o < 0 ? 0 : o > 1 ? 1 : o };
  });

  const headerMaxWidthStyle = useAnimatedStyle(() => ({
    maxWidth: v.pillWidth.value,
    width: v.pillWidth.value,
  }));

  const showProgressBar = expanded || isFront;
  const progressStyle = useAnimatedStyle(() => {
    const pr = v.progress.value;
    const sx = pr < 1 ? 1 - pr : 0;
    return { opacity: showProgressBar ? 1 : 0, transform: [{ scaleX: sx < 0 ? 0 : sx }] };
  }, [showProgressBar]);

  return { cardStyle, shellStyle, pathProps, bodyStyle, descriptionStyle, actionStyle, headerMaxWidthStyle, progressStyle };
}

/* ---------------------------------- Card ---------------------------------- */

const alignItemsOf = (a: "left" | "center" | "right") =>
  a === "center" ? ("center" as const) : a === "right" ? ("flex-end" as const) : ("flex-start" as const);

const webShadow = Platform.OS === "web" ? ({ filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.22))" } as any) : null;

export const Toast = memo(function Toast(props: IToastProps) {
  const { toast } = props;
  const { width } = useWindowDimensions();
  const theme = useToastTheme();

  const hasBody = Boolean(toast.description || toast.action || toast.content);
  const bodyLayout = getBodyLayout(toast.bodyLayout ?? props.defaultBodyLayout);
  const meta = useMemo(
    () => getToastMeta(toast, toast.showTimestamp ?? props.defaultShowTimestamp),
    [toast, props.defaultShowTimestamp],
  );
  const showProgress = toast.showProgress ?? props.defaultShowProgress;
  const bodyRadius = toast.bodyRadius ?? props.defaultBodyRadius ?? DEFAULT_BODY_RADIUS;
  const cornerSmoothing = toast.cornerSmoothing ?? props.defaultCornerSmoothing ?? DEFAULT_CORNER_SMOOTHING;
  const styleOverrides = useMemo(
    () => ({ ...props.defaultStyles, ...toast.styles }),
    [props.defaultStyles, toast.styles],
  );
  const headerMeasureKey = [
    toast.type,
    toast.title,
    toast.count ?? 1,
    toast.icon ? "custom-icon" : "status-icon",
    toast.showIcon ?? true,
    toast.showIconBadge ?? true,
    bodyRadius,
  ].join(":");

  const isFront = props.index === 0;
  const isVisible = props.index < props.visibleCount;
  const isTop = props.position.startsWith("top");
  const allowFrontExpansion = useRef(isFront);
  const frontSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [frontSettled, setFrontSettled] = useState(props.totalCount <= 1);
  const shouldAutoExpand =
    !props.forceCollapsed && isFront && allowFrontExpansion.current && (props.totalCount <= 1 || frontSettled);
  const showBodyDelay = props.morphMode ? MORPH_BODY_DELAY : SHOW_BODY_DELAY;
  const [showBody, setShowBody] = useState(false);
  const [renderBody, setRenderBody] = useState(false);

  const toastIdRef = useRef(toast.id);
  const isNewToast = toastIdRef.current !== toast.id;
  const effShowBody = isNewToast ? false : showBody;
  const effRenderBody = isNewToast ? false : renderBody;
  const showBodyRef = useRef(effShowBody);
  const renderBodyRef = useRef(effRenderBody);
  showBodyRef.current = effShowBody;
  renderBodyRef.current = effRenderBody;
  const showBodyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const layoutExpanded = hasBody && (props.expanded || shouldAutoExpand || effRenderBody);
  const cardMeasureKey = [
    headerMeasureKey,
    layoutExpanded ? (toast.description ?? "") : "",
    layoutExpanded ? (toast.action?.label ?? "") : "",
    layoutExpanded ? (meta ?? "") : "",
    layoutExpanded && toast.content ? "has-content" : "",
    bodyLayout,
    layoutExpanded,
    width,
    toast.expandedWidth ?? props.defaultExpandedWidth ?? 0,
    toast.expandedHeight ?? props.defaultExpandedHeight ?? 0,
    toast.horizontalInset ?? props.defaultHorizontalInset,
    bodyRadius,
  ].join("|");

  const values = useToastValues();
  useEffect(() => {
    values.cornerSmoothing.value = cornerSmoothing;
  }, [cornerSmoothing, values]);

  const measure = useMeasurements(headerMeasureKey, cardMeasureKey, toast.id, props.onHeightChange);

  const animationConfig = useMemo(
    () =>
      resolveToastAnimationConfig({
        animation: {
          ...props.defaultAnimation,
          ...toast.animation,
          compact: { ...props.defaultAnimation?.compact, ...toast.animation?.compact },
          morph: { ...props.defaultAnimation?.morph, ...toast.animation?.morph },
          mount: { ...props.defaultAnimation?.mount, ...toast.animation?.mount },
          springs: { ...props.defaultAnimation?.springs, ...toast.animation?.springs },
          stack: { ...props.defaultAnimation?.stack, ...toast.animation?.stack },
        },
        animationPreset: toast.animationPreset ?? props.defaultAnimationPreset,
        springConfig: { ...props.defaultSpringConfig, ...toast.springConfig },
        reduceMotion: props.defaultReduceMotion,
      }),
    [
      props.defaultAnimation,
      props.defaultAnimationPreset,
      props.defaultSpringConfig,
      props.defaultReduceMotion,
      toast.animation,
      toast.animationPreset,
      toast.springConfig,
    ],
  );

  const isReadyToExpand = layoutExpanded && measure.isCardHeightCurrent;

  // A different toast arrived in this slot (morph mode): reset per-toast state.
  useLayoutEffect(() => {
    if (toastIdRef.current === toast.id) return;
    toastIdRef.current = toast.id;
    if (showBodyTimer.current) clearTimeout(showBodyTimer.current);
    if (unmountTimer.current) clearTimeout(unmountTimer.current);
    showBodyTimer.current = null;
    unmountTimer.current = null;
    setShowBody(false);
    setRenderBody(false);
    cancelAnimation(values.swipeX);
    cancelAnimation(values.swipeY);
    cancelAnimation(values.removeProgress);
    values.swipeX.value = 0;
    values.swipeY.value = 0;
    values.removeProgress.value = 0;
  }, [toast.id, values]);

  useEffect(() => {
    if (!isFront) allowFrontExpansion.current = false;
  }, [isFront]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-armed per toast
  useEffect(() => {
    if (frontSettleTimer.current) {
      clearTimeout(frontSettleTimer.current);
      frontSettleTimer.current = null;
    }
    if (!isFront) {
      setFrontSettled(false);
      return;
    }
    if (props.totalCount <= 1) {
      setFrontSettled(true);
      return;
    }
    setFrontSettled(false);
    frontSettleTimer.current = setTimeout(() => {
      frontSettleTimer.current = null;
      setFrontSettled(true);
    }, STACKED_FRONT_REVEAL_DELAY);
    return () => {
      if (frontSettleTimer.current) clearTimeout(frontSettleTimer.current);
    };
  }, [isFront, toast.id, props.totalCount]);

  const shouldRevealBody = isReadyToExpand && (props.expanded || shouldAutoExpand);
  const remeasuringVisible =
    effShowBody && layoutExpanded && !measure.isCardHeightCurrent && (props.expanded || shouldAutoExpand);

  useEffect(() => {
    if (showBodyTimer.current) clearTimeout(showBodyTimer.current);
    if (unmountTimer.current) clearTimeout(unmountTimer.current);
    showBodyTimer.current = null;
    unmountTimer.current = null;

    if (remeasuringVisible) return;
    if (!shouldRevealBody) {
      setShowBody(false);
      if (showBodyRef.current || renderBodyRef.current) {
        unmountTimer.current = setTimeout(() => {
          unmountTimer.current = null;
          setRenderBody(false);
        }, COLLAPSE_BODY_UNMOUNT_DELAY);
      } else {
        setRenderBody(false);
      }
      return () => {
        if (unmountTimer.current) clearTimeout(unmountTimer.current);
      };
    }
    setRenderBody(true);
    if (showBodyRef.current) return;
    showBodyTimer.current = setTimeout(() => {
      showBodyTimer.current = null;
      setShowBody(true);
    }, showBodyDelay);
    return () => {
      if (showBodyTimer.current) clearTimeout(showBodyTimer.current);
      if (unmountTimer.current) clearTimeout(unmountTimer.current);
    };
  }, [shouldRevealBody, remeasuringVisible, showBodyDelay]);

  const widths = useMemo(
    () =>
      getToastWidths({
        title: toast.title,
        screenWidth: width,
        measuredPillWidth: measure.isPillWidthCurrent ? measure.measuredPillWidth : 0,
        expandedWidth: toast.expandedWidth ?? props.defaultExpandedWidth,
        horizontalInset: toast.horizontalInset ?? props.defaultHorizontalInset,
      }),
    [
      toast.title,
      width,
      measure.isPillWidthCurrent,
      measure.measuredPillWidth,
      toast.expandedWidth,
      props.defaultExpandedWidth,
      toast.horizontalInset,
      props.defaultHorizontalInset,
    ],
  );

  const heights = useMemo(
    () =>
      getToastHeights({
        actionLabel: toast.action?.label,
        bodyLayout,
        bodyWidth: widths.bodyWidth,
        description: toast.description,
        expandedHeightOverride: toast.expandedHeight ?? props.defaultExpandedHeight,
        frontHeight: props.frontHeight,
        hasCustomContent: Boolean(toast.content),
        isFront,
        measuredHeight: measure.measuredHeight,
        measuredCurrent: measure.isCardHeightCurrent && layoutExpanded,
        meta,
        showProgress: Boolean(!toast.isLoading && showProgress),
      }),
    [
      bodyLayout,
      widths.bodyWidth,
      measure.measuredHeight,
      measure.isCardHeightCurrent,
      layoutExpanded,
      props.frontHeight,
      isFront,
      toast.action?.label,
      toast.content,
      toast.description,
      toast.expandedHeight,
      toast.isLoading,
      props.defaultExpandedHeight,
      meta,
      showProgress,
    ],
  );

  const [pressed, setPressed] = useState(false);

  const dismiss = useDismiss({
    toast,
    animationConfig,
    expanded: props.expanded,
    hasBody,
    showBody: effShowBody,
    isFront,
    isVisible,
    isExpandedCandidate: props.expanded || shouldAutoExpand,
    onRemove: props.onRemove,
    paused: Boolean(props.dismissPaused),
    timerPaused: pressed || props.expanded,
    shouldAutoExpand,
    values,
  });

  const showExpandedBody = effShowBody && !dismiss.isDismissing && (props.expanded || shouldAutoExpand);
  const stackAlign = getHorizontalPosition(props.position);
  const morphAlign = getMorphAlign(bodyLayout, stackAlign);
  const noHeader = Boolean(toast.content) && toast.showHeader === false;
  const pillWidth = noHeader ? widths.bodyWidth : widths.pillWidth;
  const collapsedHeight = noHeader ? PH : heights.collapsedCardHeight;

  const animated = useAnimatedToastStyles({
    animationConfig,
    bodyWidth: widths.bodyWidth,
    expanded: props.expanded,
    index: props.index,
    isFront,
    isTop,
    morphAlign,
    noHeader,
    totalCount: props.totalCount,
    values,
  });

  useEffects({
    animationConfig,
    bodyWidth: widths.bodyWidth,
    bodyRadius,
    toast,
    expanded: props.expanded,
    expandedOffset: props.expandedOffset,
    collapsedOffset: props.collapsedOffset,
    expandedHeight: heights.expandedHeight,
    collapsedCardHeight: collapsedHeight,
    hasBody,
    isFront,
    isMeasured: noHeader ? measure.isCardHeightCurrent : measure.isPillWidthCurrent,
    isTop,
    isDismissing: dismiss.isDismissing,
    morphMode: Boolean(props.morphMode),
    pillWidth,
    shouldAutoExpand,
    shouldShowExpandedBody: showExpandedBody,
    stackDepth: Math.min(props.index, props.visibleCount - 1),
    values,
  });

  const pan = usePan({
    isTop,
    enabled: props.swipeToDismiss && toast.dismissible,
    threshold: props.swipeThreshold,
    onDismiss: dismiss.handleDismiss,
    values,
  });

  // Title-only toasts fade their header in (FadeIn 500ms).
  const headerFade = useSharedValue(hasBody ? 1 : 0);
  useEffect(() => {
    if (headerFade.value < 1) headerFade.value = withTiming(1, { duration: 500 });
  }, [headerFade]);
  const headerFadeStyle = useAnimatedStyle(() => ({ opacity: headerFade.value }));

  const { onStackPress, totalCount, dismissPaused } = props;
  const handleDismiss = dismiss.handleDismiss;
  const handlePress = useCallback(() => {
    if (dismissPaused) return;
    if (totalCount > 1) return onStackPress?.();
    if (toast.dismissible) handleDismiss();
  }, [dismissPaused, totalCount, onStackPress, toast.dismissible, handleDismiss]);

  const onAction = useCallback(() => {
    toast.action?.onPress();
    handleDismiss();
  }, [toast.action, handleDismiss]);

  const onSecondaryAction = useCallback(() => {
    toast.secondaryAction?.onPress();
    handleDismiss();
  }, [toast.secondaryAction, handleDismiss]);

  if (!isVisible) return null;

  const color = theme.colors[toast.type];
  const Icon = iconMap[toast.type];
  const surfaceFill = toast.fill ?? props.defaultFill ?? theme.surfaceColors[toast.type];
  const stroke = toast.stroke ?? props.defaultStroke ?? theme.surfaceStrokeColors[toast.type];
  const textColor = toast.textColor ?? props.defaultTextColor ?? theme.textColors[toast.type];
  const metaColor = theme.metaTextColors[toast.type];
  const canInteract = isFront || props.expanded;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastOuter,
        isTop ? styles.anchorTop : styles.anchorBottom,
        { alignItems: alignItemsOf(stackAlign) },
        animated.cardStyle,
      ]}
    >
      <View style={styles.pressable} {...pan.panHandlers}>
        <Pressable
          onPress={handlePress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.pressable}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={[toast.title, toast.description].filter(Boolean).join(". ")}
        >
          <Animated.View
            style={[
              styles.surfaceShell,
              Platform.OS === "ios" ? styles.surfaceShadow : null,
              styleOverrides?.container,
              animated.shellStyle,
            ]}
          >
            <View style={[styles.surfaceFrame, { alignItems: alignItemsOf(morphAlign) }]}>
              {/* Surface */}
              <View style={[styles.surfaceCanvas, { width: widths.bodyWidth, height: heights.renderHeight }]}>
                <Svg
                  width={widths.bodyWidth}
                  height={heights.renderHeight}
                  viewBox={`0 0 ${widths.bodyWidth} ${heights.renderHeight}`}
                  fill="none"
                  style={[styles.svgBg, webShadow]}
                >
                  <AnimatedPath animatedProps={animated.pathProps} fill={surfaceFill} stroke={stroke} strokeWidth={0.6} />
                </Svg>

                <Animated.View
                  style={[styles.content, { width: widths.bodyWidth }, styleOverrides?.content]}
                  pointerEvents="box-none"
                >
                  {noHeader ? null : (
                    <Animated.View style={headerFadeStyle}>
                      <ToastHeader
                        align={morphAlign}
                        color={color}
                        count={toast.count}
                        headerContent={toast.headerContent}
                        Icon={Icon}
                        icon={toast.icon}
                        maxWidthStyle={animated.headerMaxWidthStyle}
                        showIcon={toast.showIcon}
                        showIconBadge={toast.showIconBadge}
                        styleOverrides={styleOverrides}
                        title={toast.title}
                        type={toast.type}
                      />
                    </Animated.View>
                  )}

                  <ToastBody
                    actionStyle={animated.actionStyle}
                    bodyLayout={bodyLayout}
                    bodyStyle={animated.bodyStyle}
                    canInteract={canInteract}
                    color={color}
                    descriptionStyle={animated.descriptionStyle}
                    meta={meta}
                    metaColor={metaColor}
                    onAction={onAction}
                    onSecondaryAction={onSecondaryAction}
                    progressStyle={animated.progressStyle}
                    showBody={effRenderBody}
                    showProgress={showProgress}
                    styleOverrides={styleOverrides}
                    textColor={textColor}
                    toast={toast}
                  />
                </Animated.View>

                {!hasBody && !toast.isLoading && showProgress ? (
                  <View pointerEvents="none" style={[styles.pillProgressFrame, { alignItems: alignItemsOf(morphAlign) }]}>
                    <Animated.View style={[styles.pillProgressClip, animated.headerMaxWidthStyle]}>
                      <ToastProgress
                        backgroundColor={`${color}40`}
                        fillStyle={styleOverrides?.progressFill}
                        trackStyle={styleOverrides?.progressTrack}
                        style={animated.progressStyle}
                      />
                    </Animated.View>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>

          <ToastMeasure
            bodyLayout={bodyLayout}
            bodyWidth={widths.bodyWidth}
            headerAlign={morphAlign}
            color={color}
            Icon={Icon}
            meta={meta}
            measureBody={layoutExpanded}
            noHeader={noHeader}
            onMeasureCard={measure.onMeasureCard}
            onMeasureHeader={measure.onMeasureHeader}
            styleOverrides={styleOverrides}
            toast={toast}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
});

export type { SharedValue };
