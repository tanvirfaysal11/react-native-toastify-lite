/**
 * The pill's title row. When the title or type changes, the old row stays as a
 * "prev" layer and fades/blurs out (300ms) while the new row fades/un-blurs in
 * (520ms). On Android (RN 0.76+, New Architecture, Reanimated 4) the rows also
 * blur with React Native's own `filter` style; on iOS they crossfade.
 */
import { memo, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, Platform, type StyleProp, Text, View, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  HEADER_LAYER_CLEAR_MS,
  HEADER_LAYER_MAX_BLUR_PX,
  HEADER_TITLE_EXIT_MS,
  HEADER_TITLE_MORPH_MS,
  ICON_SIZE,
} from "./constants";
import type { IToastIcon } from "./icons";
import { CAN_ANIMATE_FILTER } from "./optional";
import { styles } from "./styles";
import { useToastTheme } from "./theme";
import type { IToastStyleOverrides, TToastHorizontalAlign, TToastType } from "./types";

const USE_FILTER_BLUR = (Platform.OS === "android" && CAN_ANIMATE_FILTER) || Platform.OS === "web";

export interface IHeaderLayer {
  key: string;
  type: TToastType;
  title: string;
  Icon: (p: IToastIcon) => ReactNode;
  color: string;
  count?: number;
  headerContent?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  showIconBadge?: boolean;
}

export interface IToastHeaderProps {
  align: TToastHorizontalAlign;
  color: string;
  count?: number;
  headerContent?: ReactNode;
  Icon: (p: IToastIcon) => ReactNode;
  icon?: ReactNode;
  maxWidthStyle?: StyleProp<ViewStyle> | object;
  measure?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
  showIcon?: boolean;
  showIconBadge?: boolean;
  styleOverrides?: IToastStyleOverrides;
  title: string;
  type: TToastType;
}

function createHeaderLayer(p: Omit<IHeaderLayer, "key">): IHeaderLayer {
  return { ...p, key: `${p.type}:${p.title}:${p.headerContent ? "custom" : "default"}` };
}

/* --------------------------------- Content -------------------------------- */

const ToastHeaderContent = memo(function ToastHeaderContent({
  align,
  layer,
  styleOverrides,
}: {
  align: TToastHorizontalAlign;
  layer: IHeaderLayer;
  styleOverrides?: IToastStyleOverrides;
}) {
  const theme = useToastTheme();
  const showIcon = layer.showIcon ?? true;
  const showIconBadge = layer.showIconBadge ?? true;
  const Icon = layer.Icon;
  return (
    <>
      {showIcon ? (
        <View
          style={[
            showIconBadge ? styles.iconWrap : styles.iconPlainWrap,
            showIconBadge ? { backgroundColor: theme.badgeBgColors[layer.type] } : null,
            styleOverrides?.badge,
          ]}
        >
          {layer.icon ?? <Icon size={ICON_SIZE} color={layer.color} />}
        </View>
      ) : null}
      <View style={showIcon ? styles.titleWrap : styles.titleNoIconWrap}>
        <View style={styles.titleRow}>
          <Animated.Text
            style={[
              styles.titleText,
              showIcon ? null : styles.titleTextNoIcon,
              showIcon && align === "center" ? styles.textCenter : null,
              showIcon ? (align === "right" ? styles.textRight : styles.textLeft) : styles.textCenter,
              { color: layer.color },
              styleOverrides?.title,
            ]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {layer.title}
          </Animated.Text>
          {layer.count != null && layer.count > 1 ? (
            <View style={[styles.countBadge, { backgroundColor: theme.badgeBgColors[layer.type] }]}>
              <Text style={[styles.countText, { color: layer.color }]}>{layer.count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
});

/* ---------------------------------- Morph --------------------------------- */

function blurStyle(px: number) {
  "worklet";
  return Platform.OS === "web" ? { filter: `blur(${px}px)` } : { filter: [{ blur: px }] };
}

function useHeaderMorph(p: IToastHeaderProps) {
  const headerKey = `${p.type}:${p.title}:${p.headerContent ? "custom" : "default"}`;
  const make = () =>
    createHeaderLayer({
      color: p.color,
      count: p.count,
      headerContent: p.headerContent,
      Icon: p.Icon,
      icon: p.icon,
      showIcon: p.showIcon,
      showIconBadge: p.showIconBadge,
      title: p.title,
      type: p.type,
    });
  const [headerLayer, setHeaderLayer] = useState(() => ({
    current: make(),
    prev: null as IHeaderLayer | null,
  }));
  const prevKeyRef = useRef(headerKey);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const isMorphingRef = useRef(false);
  const versionRef = useRef(0);
  const current = useSharedValue(1);
  const prev = useSharedValue(1);

  const clearPrev = useCallback((version?: number) => {
    if (version !== undefined && version !== versionRef.current) return;
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    isMorphingRef.current = false;
    setHeaderLayer((s) => (s.prev ? { ...s, prev: null } : s));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on header content
  useLayoutEffect(() => {
    const next = make();
    if (p.measure) {
      prevKeyRef.current = headerKey;
      setHeaderLayer({ current: next, prev: null });
      return;
    }
    if (prevKeyRef.current === headerKey) {
      setHeaderLayer((s) => ({ ...s, current: next }));
      return;
    }

    prevKeyRef.current = headerKey;
    cancelAnimation(current);
    cancelAnimation(prev);
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const wasMorphing = isMorphingRef.current;
    const exitingStart = wasMorphing ? current.value : 0;
    const version = versionRef.current + 1;
    versionRef.current = version;
    isMorphingRef.current = true;

    current.value = 0;
    prev.value = exitingStart;
    setHeaderLayer((s) => ({ current: next, prev: s.current }));

    const start = () => {
      frameRef.current = null;
      if (versionRef.current !== version) return;
      current.value = withTiming(1, { duration: HEADER_TITLE_MORPH_MS, easing: Easing.out(Easing.cubic) });
      prev.value = withTiming(1, { duration: HEADER_TITLE_EXIT_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(clearPrev)(version);
      });
    };
    // Android: wait one frame so the new layer is mounted at opacity 0 first.
    if (Platform.OS === "android") frameRef.current = requestAnimationFrame(start);
    else start();

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => clearPrev(version), HEADER_LAYER_CLEAR_MS);
  }, [headerKey, p.color, p.Icon, p.icon, p.headerContent, p.measure, p.showIcon, p.showIconBadge]);

  useEffect(
    () => () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const currentStyle = useAnimatedStyle(() => {
    const t = current.value;
    const opacity = interpolate(t, [0, 1], [0, 1], Extrapolation.CLAMP);
    if (!USE_FILTER_BLUR) return { opacity };
    return {
      opacity,
      ...blurStyle(interpolate(t, [0, 1], [HEADER_LAYER_MAX_BLUR_PX, 0], Extrapolation.CLAMP)),
    } as ViewStyle;
  });

  const prevStyle = useAnimatedStyle(() => {
    const t = prev.value;
    const opacity = interpolate(t, [0, 1], [1, 0], Extrapolation.CLAMP);
    if (!USE_FILTER_BLUR) return { opacity };
    return {
      opacity,
      ...blurStyle(interpolate(t, [0, 1], [0, HEADER_LAYER_MAX_BLUR_PX], Extrapolation.CLAMP)),
    } as ViewStyle;
  });

  return { headerLayer, currentStyle, prevStyle };
}

/* --------------------------------- Header --------------------------------- */

export const ToastHeader = memo(function ToastHeader(p: IToastHeaderProps) {
  const baseStyle = [
    p.measure ? styles.measureHeader : styles.header,
    p.align === "center" ? styles.headerCentered : null,
    p.showIcon === false ? styles.headerNoIcon : null,
    p.align === "right" ? styles.headerRight : null,
    p.styleOverrides?.header,
    styles.headerRoot,
  ];
  const morph = useHeaderMorph(p);

  const render = (layer: IHeaderLayer) =>
    layer.headerContent ?? (
      <ToastHeaderContent align={p.align} layer={layer} styleOverrides={p.styleOverrides} />
    );

  if (p.measure) {
    return (
      <View style={baseStyle} onLayout={p.onLayout}>
        {p.headerContent ?? (
          <ToastHeaderContent
            align={p.align}
            layer={createHeaderLayer({
              color: p.color,
              count: p.count,
              headerContent: p.headerContent,
              Icon: p.Icon,
              icon: p.icon,
              showIcon: p.showIcon,
              showIconBadge: p.showIconBadge,
              title: p.title,
              type: p.type,
            })}
            styleOverrides={p.styleOverrides}
          />
        )}
      </View>
    );
  }

  const prevLayer = morph.headerLayer.prev;

  return (
    <Animated.View
      style={[styles.headerClip, ...baseStyle, p.maxWidthStyle, { backgroundColor: "transparent" }]}
      onLayout={p.onLayout}
      collapsable={false}
    >
      {prevLayer ? (
        <Animated.View
          key={prevLayer.key}
          pointerEvents="none"
          style={[
            styles.headerOverlayContent,
            p.showIcon === false ? styles.headerOverlayNoIcon : null,
            morph.prevStyle,
          ]}
        >
          {render(prevLayer)}
        </Animated.View>
      ) : null}

      <Animated.View
        key="current"
        style={[
          styles.headerContent,
          p.showIcon === false ? styles.headerContentNoIcon : null,
          morph.currentStyle,
        ]}
      >
        {render(morph.headerLayer.current)}
      </Animated.View>
    </Animated.View>
  );
});
