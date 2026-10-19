import { memo } from "react";
import { type LayoutChangeEvent, Pressable, type StyleProp, Text, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import type { IToastIcon } from "./icons";
import { styles } from "./styles";
import { useToastTheme } from "./theme";
import { ToastHeader } from "./ToastHeader";
import type { IToastData, IToastStyleOverrides, TToastBodyLayout, TToastHorizontalAlign } from "./types";

type AnimStyle = StyleProp<ViewStyle> | any;

function actionWrapStyle(layout: TToastBodyLayout) {
  if (layout === "center") return styles.actionWrapCenter;
  if (layout === "spread") return styles.actionWrapStretch;
  if (layout === "right") return styles.actionWrapRight;
  return null;
}

/* ------------------------------- Description ------------------------------ */

const ToastDescription = memo(function ToastDescription(p: {
  description: string;
  meta?: string;
  layout: TToastBodyLayout;
  styleOverrides?: IToastStyleOverrides;
  textColor?: string;
  metaColor?: string;
}) {
  if (p.layout === "spread" || p.layout === "right") {
    return (
      <View style={styles.descRow}>
        <View style={styles.descTextWrap}>
          <Text style={[styles.descText, styles.textLeft, p.textColor ? { color: p.textColor } : null, p.styleOverrides?.description]}>{p.description}</Text>
        </View>
        {p.meta ? <Text style={[styles.descMeta, p.metaColor ? { color: p.metaColor } : null, p.styleOverrides?.meta]}>{p.meta}</Text> : null}
      </View>
    );
  }
  const align = p.layout === "center" ? styles.textCenter : styles.textLeft;
  return (
    <View>
      <Text style={[styles.descText, align, p.textColor ? { color: p.textColor } : null, p.styleOverrides?.description]}>{p.description}</Text>
      {p.meta ? <Text style={[styles.descMetaInline, align, p.metaColor ? { color: p.metaColor } : null, p.styleOverrides?.meta]}>{p.meta}</Text> : null}
    </View>
  );
});

/* --------------------------------- Progress ------------------------------- */

export const ToastProgress = memo(function ToastProgress(p: {
  inline?: boolean;
  backgroundColor: string;
  fillStyle?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  style?: AnimStyle;
}) {
  return (
    <View style={[p.inline ? styles.inlineProgressTrack : styles.progressTrack, p.trackStyle]}>
      <Animated.View
        style={[
          p.inline ? styles.inlineProgressFill : styles.progressFill,
          { backgroundColor: p.backgroundColor },
          p.fillStyle,
          p.style,
        ]}
      />
    </View>
  );
});

/* ----------------------------------- Body --------------------------------- */

export interface IToastBodyProps {
  actionStyle: AnimStyle;
  bodyLayout: TToastBodyLayout;
  bodyStyle: AnimStyle;
  canInteract: boolean;
  color: string;
  descriptionStyle: AnimStyle;
  meta?: string;
  metaColor?: string;
  onAction: () => void;
  onSecondaryAction: () => void;
  progressStyle: AnimStyle;
  showBody: boolean;
  showProgress: boolean;
  styleOverrides?: IToastStyleOverrides;
  textColor?: string;
  toast: IToastData;
}

export const ToastBody = memo(function ToastBody(p: IToastBodyProps) {
  const theme = useToastTheme();
  if (!p.showBody) return null;

  const progress =
    !p.toast.isLoading && p.showProgress ? (
      <ToastProgress
        inline
        backgroundColor={`${p.color}55`}
        fillStyle={p.styleOverrides?.progressFill}
        trackStyle={p.styleOverrides?.progressTrack}
        style={p.progressStyle}
      />
    ) : null;

  if (p.toast.content) {
    return (
      <Animated.View
        style={[styles.body, p.styleOverrides?.body, p.bodyStyle]}
        pointerEvents={p.canInteract ? "auto" : "none"}
      >
        {p.toast.content}
        {progress}
      </Animated.View>
    );
  }

  if (!p.toast.description && !p.toast.action) return null;

  return (
    <Animated.View
      style={[styles.body, p.styleOverrides?.body, p.bodyStyle]}
      pointerEvents={p.canInteract ? "auto" : "none"}
    >
      {p.toast.description ? (
        <Animated.View style={[p.toast.action ? styles.descWithAction : null, p.descriptionStyle]}>
          <ToastDescription
            description={p.toast.description}
            meta={p.meta}
            metaColor={p.metaColor}
            layout={p.bodyLayout}
            styleOverrides={p.styleOverrides}
            textColor={p.textColor}
          />
        </Animated.View>
      ) : null}
      {p.toast.action ? (
        <Animated.View style={[styles.actionWrap, actionWrapStyle(p.bodyLayout), p.actionStyle]}>
          {p.toast.secondaryAction ? (
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={p.onSecondaryAction}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.actionBtnSecondary,
                  { borderColor: theme.colors[p.toast.type] },
                  p.styleOverrides?.action,
                  { opacity: pressed ? 0.84 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.actionTextColors[p.toast.type] },
                    p.styleOverrides?.actionText,
                  ]}
                >
                  {p.toast.secondaryAction.label}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={p.onAction}
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: theme.actionColors[p.toast.type] },
                  p.styleOverrides?.action,
                  { opacity: pressed ? 0.84 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.actionTextColors[p.toast.type] },
                    p.styleOverrides?.actionText,
                  ]}
                >
                  {p.toast.action.label}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={p.onAction}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: theme.actionColors[p.toast.type] },
                p.styleOverrides?.action,
                { opacity: pressed ? 0.84 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.actionLabel,
                  { color: theme.actionTextColors[p.toast.type] },
                  p.styleOverrides?.actionText,
                ]}
              >
                {p.toast.action.label}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      ) : null}
      {progress}
    </Animated.View>
  );
});

/* ---------------------------------- Measure ------------------------------- */

const ToastMeasureBody = memo(function ToastMeasureBody(p: {
  bodyLayout: TToastBodyLayout;
  meta?: string;
  styleOverrides?: IToastStyleOverrides;
  toast: IToastData;
}) {
  const theme = useToastTheme();
  if (p.toast.content) {
    return <View style={[styles.measureBody, p.styleOverrides?.body]}>{p.toast.content}</View>;
  }
  if (!p.toast.description && !p.toast.action) return null;
  return (
    <View style={[styles.measureBody, p.styleOverrides?.body]}>
      {p.toast.description ? (
        <View style={p.toast.action ? styles.descWithAction : null}>
          <ToastDescription
            description={p.toast.description}
            meta={p.meta}
            layout={p.bodyLayout}
            styleOverrides={p.styleOverrides}
          />
        </View>
      ) : null}
      {p.toast.action ? (
        <View style={[styles.actionWrap, actionWrapStyle(p.bodyLayout)]}>
          <View
            style={[
              styles.actionBtn,
              { backgroundColor: theme.actionColors[p.toast.type] },
              p.styleOverrides?.action,
            ]}
          >
            <Text
              style={[
                styles.actionLabel,
                { color: theme.actionTextColors[p.toast.type] },
                p.styleOverrides?.actionText,
              ]}
            >
              {p.toast.action.label}
            </Text>
          </View>
        </View>
      ) : null}
      {!p.toast.isLoading ? <View style={styles.measureInlineProgress} /> : null}
    </View>
  );
});

/** Invisible copy of the card, laid out once to measure pill width and card height. */
export const ToastMeasure = memo(function ToastMeasure(p: {
  bodyLayout: TToastBodyLayout;
  bodyWidth: number;
  headerAlign: TToastHorizontalAlign;
  color: string;
  Icon: (p: IToastIcon) => React.ReactNode;
  meta?: string;
  measureBody: boolean;
  noHeader: boolean;
  onMeasureCard: (e: LayoutChangeEvent) => void;
  onMeasureHeader: (e: LayoutChangeEvent) => void;
  styleOverrides?: IToastStyleOverrides;
  toast: IToastData;
}) {
  return (
    <View
      style={styles.measureLayer}
      pointerEvents="none"
      onLayout={p.onMeasureCard}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.measureCard, { width: p.bodyWidth }]}>
        {p.noHeader ? null : (
          <ToastHeader
            align={p.headerAlign}
            color={p.color}
            count={p.toast.count}
            headerContent={p.toast.headerContent}
            icon={p.toast.icon}
            Icon={p.Icon}
            measure
            onLayout={p.onMeasureHeader}
            showIcon={p.toast.showIcon}
            showIconBadge={p.toast.showIconBadge}
            styleOverrides={p.styleOverrides}
            title={p.toast.title}
            type={p.toast.type}
          />
        )}
        {p.measureBody ? (
          <ToastMeasureBody
            bodyLayout={p.bodyLayout}
            meta={p.meta}
            styleOverrides={p.styleOverrides}
            toast={p.toast}
          />
        ) : null}
      </View>
    </View>
  );
});
