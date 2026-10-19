/**
 * ToastProvider, the toaster, stack mode and morph mode.
 */
import {
  type Context,
  createContext,
  memo,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AccessibilityInfo, Platform, Pressable, View } from "react-native";
import {
  buildHeightMap,
  filterToastsForPosition,
  getCollapsedOffsets,
  getDefaultVertical,
  getExpandedOffsets,
  getFrontHeight,
  getHorizontalPosition,
  resolveToastStackPosition,
  TOAST_POSITIONS,
} from "./config";
import {
  DEFAULT_DURATION,
  DEFAULT_GAP,
  DEFAULT_HORIZONTAL_INSET,
  DEFAULT_OFFSET,
  DEFAULT_SWIPE_THRESHOLD,
  DEFAULT_VISIBLE_TOASTS,
  MORPH_SWAP_COLLAPSE_MS,
} from "./constants";
import { initialInsets, SafeAreaInsetsContext } from "./optional";
import {
  getHeights,
  getToasts,
  removeToast,
  setDefaultDuration,
  setGroupDuplicates,
  subscribeHeights,
  subscribeToasts,
  updateHeight,
} from "./store";
import { styles } from "./styles";
import { ToastThemeProvider } from "./theme";
import { type IToastProps, Toast } from "./Toast";
import type {
  IHeightEntry,
  IToastConfig,
  IToastData,
  IToastOffset,
  IToastProviderProps,
  TToastPosition,
  TToastVerticalPosition,
} from "./types";

/* ---------------------------------- State --------------------------------- */

function useToasterState(duration: number) {
  const [toasts, setToasts] = useState<IToastData[]>(getToasts);
  const [heights, setHeights] = useState<IHeightEntry[]>(getHeights);
  useEffect(() => setDefaultDuration(duration), [duration]);
  useEffect(() => {
    const a = subscribeToasts(setToasts);
    const b = subscribeHeights(setHeights);
    // re-read in case something fired between render and subscribe
    setToasts(getToasts());
    setHeights(getHeights());
    return () => {
      a();
      b();
    };
  }, []);
  return { toasts, heights };
}

const ZERO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

function useInsets(override?: { top: number; bottom: number }) {
  const ctx = useContext((SafeAreaInsetsContext ?? NULL_CONTEXT) as Context<typeof ZERO_INSETS | null>);
  if (override) return override;
  return ctx ?? initialInsets ?? ZERO_INSETS;
}
const NULL_CONTEXT = createContext<typeof ZERO_INSETS | null>(null);

function useReduceMotion(override?: boolean): boolean {
  const [enabled, setEnabled] = useState(override ?? false);
  useEffect(() => {
    if (override !== undefined) {
      setEnabled(override);
      return;
    }
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (active) setEnabled(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [override]);
  return enabled;
}

/* --------------------------------- Shared --------------------------------- */

interface ISlotProps {
  position: TToastPosition;
  vertical: TToastVerticalPosition;
  toasts: IToastData[];
  heightMap: Map<string, number>;
  topInset: number;
  bottomInset: number;
  offset: number | IToastOffset;
  horizontalInset: number;
  common: Omit<
    IToastProps,
    | "toast"
    | "index"
    | "totalCount"
    | "visibleCount"
    | "expanded"
    | "expandedOffset"
    | "collapsedOffset"
    | "frontHeight"
    | "position"
    | "gap"
  >;
}

const offsetValue = (o: ISlotProps["offset"], side: "top" | "right" | "bottom" | "left") =>
  typeof o === "number" ? o : (o?.[side] ?? 0);

function slotLayout(p: ISlotProps) {
  const resolvedPosition = resolveToastStackPosition(p.position ?? "top-center", p.vertical);
  const h = getHorizontalPosition(resolvedPosition);
  const edge = (p.vertical === "top" ? p.topInset : p.bottomInset) + offsetValue(p.offset, p.vertical);
  return {
    resolvedPosition,
    alignStyle:
      h === "center"
        ? styles.toasterCenter
        : h === "right"
          ? { left: 0, right: 0, alignItems: "flex-end" as const, paddingRight: p.horizontalInset + offsetValue(p.offset, "right") }
          : { left: 0, right: 0, alignItems: "flex-start" as const, paddingLeft: p.horizontalInset + offsetValue(p.offset, "left") },
    edgeStyle: p.vertical === "top" ? { top: edge } : { bottom: edge },
  };
}

/* ---------------------------------- Stack --------------------------------- */

const ToastStack = memo(function ToastStack(
  p: ISlotProps & {
    expand: boolean;
    setExpanded: (v: SetStateAction<boolean>) => void;
    visibleToasts: number;
    gap: number;
  },
) {
  const count = p.toasts.length;
  const { setExpanded } = p;
  const toggle = useCallback(() => {
    if (count > 1) setExpanded((c) => !c);
  }, [setExpanded, count]);

  if (!count) return null;
  const layout = slotLayout(p);
  const collapsed = getCollapsedOffsets(p.toasts, p.visibleToasts, p.gap);
  const expanded = getExpandedOffsets(p.toasts, p.heightMap, p.gap);
  const frontHeight = getFrontHeight(p.toasts, p.heightMap);

  return (
    <Pressable
      onPress={toggle}
      style={[styles.toastOuter, styles.toasterContainer, layout.edgeStyle, layout.alignStyle]}
      pointerEvents="box-none"
    >
      <View style={styles.toasterStack} pointerEvents="box-none">
        {p.toasts.slice(0, p.visibleToasts).map((toast, index) => (
          <Toast
            key={toast.id}
            {...p.common}
            toast={toast}
            index={index}
            totalCount={count}
            visibleCount={p.visibleToasts}
            expanded={p.expand}
            expandedOffset={expanded.get(toast.id) ?? 0}
            collapsedOffset={collapsed.get(toast.id) ?? 0}
            frontHeight={frontHeight}
            position={layout.resolvedPosition}
            gap={p.gap}
            onStackPress={toggle}
          />
        ))}
      </View>
    </Pressable>
  );
});

/* ---------------------------------- Morph --------------------------------- */

const hasBody = (t: IToastData) => Boolean(t.description || t.action || t.content);

const ToastMorphSlot = memo(function ToastMorphSlot(p: ISlotProps) {
  const incoming = p.toasts[0];
  const [display, setDisplay] = useState<IToastData | undefined>(() => incoming);
  const [pending, setPending] = useState<IToastData | undefined>();
  const pendingRef = useRef<IToastData | undefined>(undefined);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mirrors the swap behavior
  useLayoutEffect(() => {
    if (!incoming) {
      setDisplay(undefined);
      setPending(undefined);
      pendingRef.current = undefined;
      if (swapTimer.current) clearTimeout(swapTimer.current);
      swapTimer.current = null;
      return;
    }
    if (!display || display.id === incoming.id) {
      setDisplay(incoming);
      return;
    }
    const gone = !p.toasts.some((t) => t.id === display.id);
    // iOS swaps in place; Android collapses the open card first (350ms).
    const collapseFirst = hasBody(display) && (!gone || Platform.OS === "android");
    if (!collapseFirst) {
      pendingRef.current = undefined;
      setPending(undefined);
      if (swapTimer.current) clearTimeout(swapTimer.current);
      swapTimer.current = null;
      setDisplay(incoming);
      return;
    }
    pendingRef.current = incoming;
    setPending(incoming);
    if (swapTimer.current) return;
    swapTimer.current = setTimeout(() => {
      swapTimer.current = null;
      const next = pendingRef.current;
      pendingRef.current = undefined;
      setPending(undefined);
      if (next) setDisplay(next);
    }, MORPH_SWAP_COLLAPSE_MS);
  }, [display, incoming]);

  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    },
    [],
  );

  if (!display) return null;
  const layout = slotLayout(p);
  const replacing = Boolean(pending) && pending?.id !== display.id;

  return (
    <View
      style={[styles.toastOuter, styles.toasterContainer, layout.edgeStyle, layout.alignStyle]}
      pointerEvents="box-none"
    >
      <View style={styles.toasterStack} pointerEvents="box-none">
        {/* no key: the same card instance morphs from one toast into the next */}
        <Toast
          {...p.common}
          toast={display}
          index={0}
          totalCount={1}
          visibleCount={1}
          dismissPaused={replacing}
          expanded={false}
          expandedOffset={0}
          forceCollapsed={replacing}
          collapsedOffset={0}
          frontHeight={getFrontHeight(p.toasts, p.heightMap)}
          position={layout.resolvedPosition}
          gap={0}
          morphMode
        />
      </View>
    </View>
  );
});

/* --------------------------------- Toaster -------------------------------- */

const createExpandedSlots = (v: boolean) =>
  Object.fromEntries(TOAST_POSITIONS.map((p) => [p, v])) as Record<TToastPosition, boolean>;

const ToastToaster = memo(function ToastToaster({
  animation,
  animationPreset,
  position = "top-center",
  duration = DEFAULT_DURATION,
  visibleToasts = DEFAULT_VISIBLE_TOASTS,
  gap = DEFAULT_GAP,
  expand = false,
  bodyLayout = "spread",
  bodyRadius,
  cornerSmoothing,
  expandedHeight,
  expandedWidth,
  fill,
  horizontalInset = DEFAULT_HORIZONTAL_INSET,
  mode = "stack",
  offset = DEFAULT_OFFSET,
  showProgress = true,
  showTimestamp = true,
  springConfig,
  stroke,
  textColor,
  styles: styleOverrides,
  swipeToDismiss = true,
  swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
  theme,
  insets,
  groupDuplicates,
  reduceMotion,
  disabled = false,
}: IToastConfig & { disabled?: boolean }) {
  const { top, bottom } = useInsets(insets);
  const { toasts, heights } = useToasterState(duration);
  const reduceMotionEnabled = useReduceMotion(reduceMotion);
  useEffect(() => setGroupDuplicates(groupDuplicates ?? true), [groupDuplicates]);
  const heightMap = useMemo(() => buildHeightMap(heights), [heights]);
  const [expandedSlots, setExpandedSlots] = useState(() => createExpandedSlots(expand));
  const isMorph = mode === "morph";

  const slots = useMemo(
    () =>
      TOAST_POSITIONS.map((slot) => ({
        position: slot,
        toasts: filterToastsForPosition(toasts, position, slot),
        vertical: getDefaultVertical(slot),
      })),
    [position, toasts],
  );

  useEffect(() => {
    if (disabled) return;
    setExpandedSlots(createExpandedSlots(expand));
  }, [disabled, expand]);

  useEffect(() => {
    if (disabled) return;
    setExpandedSlots((cur) => {
      let changed = false;
      const next = { ...cur };
      for (const s of slots) {
        if (s.toasts.length <= 1 && next[s.position]) {
          next[s.position] = false;
          changed = true;
        }
      }
      return changed ? next : cur;
    });
  }, [disabled, slots]);

  // Morph mode keeps one toast per position: the newest replaces the rest.
  useEffect(() => {
    if (disabled || !isMorph) return;
    for (const s of slots) for (const t of s.toasts.slice(1)) removeToast(t.id);
  }, [disabled, isMorph, slots]);

  // Screen readers: announce each new toast on iOS (Android uses the live region).
  const announced = useRef<string | undefined>(undefined);
  useEffect(() => {
    const t = toasts[0];
    if (!t || announced.current === `${t.id}:${t.title}`) return;
    announced.current = `${t.id}:${t.title}`;
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility([t.title, t.description].filter(Boolean).join(". "));
    }
  }, [toasts]);

  const common: ISlotProps["common"] = useMemo(
    () => ({
      swipeToDismiss,
      swipeThreshold,
      defaultAnimation: animation,
      defaultAnimationPreset: animationPreset,
      defaultBodyLayout: bodyLayout,
      defaultBodyRadius: bodyRadius,
      defaultCornerSmoothing: cornerSmoothing,
      defaultExpandedHeight: expandedHeight,
      defaultExpandedWidth: expandedWidth,
      defaultFill: fill,
      defaultHorizontalInset: horizontalInset,
      defaultShowProgress: showProgress,
      defaultShowTimestamp: showTimestamp,
      defaultSpringConfig: springConfig,
      defaultStroke: stroke,
      defaultTextColor: textColor,
      defaultReduceMotion: reduceMotionEnabled,
      defaultStyles: styleOverrides,
      onRemove: removeToast,
      onHeightChange: updateHeight,
    }),
    [
      swipeToDismiss,
      swipeThreshold,
      animation,
      animationPreset,
      bodyLayout,
      bodyRadius,
      cornerSmoothing,
      expandedHeight,
      expandedWidth,
      fill,
      horizontalInset,
      showProgress,
      showTimestamp,
      springConfig,
      stroke,
      textColor,
      reduceMotionEnabled,
      styleOverrides,
    ],
  );

  if (disabled || !toasts.length) return null;

  return (
    <ToastThemeProvider theme={theme}>
      {slots.map((s) => {
        const slotProps: ISlotProps = {
          position: s.position,
          vertical: s.vertical,
          toasts: s.toasts,
          heightMap,
          topInset: top,
          bottomInset: bottom,
          offset,
          horizontalInset,
          common,
        };
        return isMorph ? (
          <ToastMorphSlot key={s.position} {...slotProps} />
        ) : (
          <ToastStack
            key={s.position}
            {...slotProps}
            gap={gap}
            visibleToasts={visibleToasts}
            expand={expandedSlots[s.position]}
            setExpanded={(next) =>
              setExpandedSlots((cur) => ({
                ...cur,
                [s.position]: typeof next === "function" ? next(cur[s.position]) : next,
              }))
            }
          />
        );
      })}
    </ToastThemeProvider>
  );
});

/* --------------------------------- Provider ------------------------------- */

const ProviderContext = createContext<{ registerChildProvider: () => () => void } | null>(null);

/**
 * Put this once near the root, inside a flex:1 view (SafeAreaProvider or your
 * root View). A nested provider (for example inside a modal screen) takes over
 * while it is mounted, so toasts are never drawn twice.
 */
export const ToastProvider = memo(function ToastProvider({ children, ...config }: IToastProviderProps) {
  const parent = useContext(ProviderContext);
  const [childCount, setChildCount] = useState(0);
  const registerChildProvider = useCallback(() => {
    setChildCount((c) => c + 1);
    return () => setChildCount((c) => Math.max(0, c - 1));
  }, []);
  const value = useMemo(() => ({ registerChildProvider }), [registerChildProvider]);
  useEffect(() => parent?.registerChildProvider(), [parent]);

  return (
    <ProviderContext.Provider value={value}>
      {children}
      <ToastToaster {...config} disabled={childCount > 0} />
    </ProviderContext.Provider>
  );
});
