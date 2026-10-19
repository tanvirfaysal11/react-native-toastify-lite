import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

/* ---------------------------------- Enums --------------------------------- */

enum ToastBodyLayout {
  Left = "left",
  Center = "center",
  Right = "right",
  Spread = "spread",
}

enum ToastMode {
  Stack = "stack",
  Morph = "morph",
}

enum ToastAnimationPreset {
  Gentle = "gentle",
  Minimal = "minimal",
  Smooth = "smooth",
  Snappy = "snappy",
}

enum ToastPosition {
  TopLeft = "top-left",
  TopCenter = "top-center",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomCenter = "bottom-center",
  BottomRight = "bottom-right",
}

enum ToastType {
  Default = "default",
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

enum ToastVerticalPosition {
  Top = "top",
  Bottom = "bottom",
}

/* ---------------------------------- Types --------------------------------- */

type TToastPosition = `${ToastPosition}`;
type TToastVerticalPosition = `${ToastVerticalPosition}`;
type TToastPositionInput = TToastPosition | TToastVerticalPosition;
type TToastType = `${ToastType}`;
type TToastMode = `${ToastMode}`;
type TToastAnimationAxis = "none" | "x" | "y";
type TToastAnimationPreset = `${ToastAnimationPreset}`;
type TToastBodyLayout = `${ToastBodyLayout}`;
type TToastHorizontalAlign = "left" | "center" | "right";
type TToastPromiseDescription<TData> = string | ((value: TData) => string | undefined);
type TToastPromiseMessage<TData> = string | ((value: TData) => string);
/** Physics spring (works the same on Reanimated 3 and 4). */
interface IToastSpring {
  damping?: number;
  stiffness?: number;
  mass?: number;
  overshootClamping?: boolean;
  velocity?: number;
}
type TToastSpringConfig = IToastSpring;

interface IToastAnimationSpringConfig {
  bodyReveal?: TToastSpringConfig;
  morph?: TToastSpringConfig;
  morphCollapse?: TToastSpringConfig;
  mount?: TToastSpringConfig;
  pillResize?: TToastSpringConfig;
  squish?: TToastSpringConfig;
  stack?: TToastSpringConfig;
}

interface IToastMountAnimationConfig {
  axis?: TToastAnimationAxis;
  duration?: number;
  offset?: number;
}

interface IToastMorphAnimationConfig {
  actionDelay?: number;
  bodyFadeDelay?: number;
  bodyFadeDuration?: number;
  collapseDuration?: number;
  descriptionDelay?: number;
  squishDelay?: number;
  squishDuration?: number;
  squishScaleX?: number;
  squishScaleY?: number;
}

interface IToastStackAnimationConfig {
  collapseDelay?: number;
  duration?: number;
  minOpacity?: number;
  minScale?: number;
  opacityStep?: number;
  scaleStep?: number;
}

interface IToastCompactAnimationConfig {
  squishDuration?: number;
  squishScaleX?: number;
  squishScaleY?: number;
}

interface IToastAnimationConfig {
  compact?: IToastCompactAnimationConfig;
  morph?: IToastMorphAnimationConfig;
  mount?: IToastMountAnimationConfig;
  preset?: TToastAnimationPreset;
  springs?: IToastAnimationSpringConfig;
  stack?: IToastStackAnimationConfig;
}

interface IToastAction {
  label: string;
  onPress: () => void;
}

interface IToastTheme {
  colors?: Partial<Record<TToastType, string>>;
  surfaceColors?: Partial<Record<TToastType, string>>;
  surfaceStrokeColors?: Partial<Record<TToastType, string>>;
  badgeBgColors?: Partial<Record<TToastType, string>>;
  actionColors?: Partial<Record<TToastType, string>>;
  actionTextColors?: Partial<Record<TToastType, string>>;
  textColors?: Partial<Record<TToastType, string>>;
  metaTextColors?: Partial<Record<TToastType, string>>;
}

interface IResolvedToastTheme {
  colors: Record<TToastType, string>;
  surfaceColors: Record<TToastType, string>;
  surfaceStrokeColors: Record<TToastType, string>;
  badgeBgColors: Record<TToastType, string>;
  actionColors: Record<TToastType, string>;
  actionTextColors: Record<TToastType, string>;
  textColors: Record<TToastType, string>;
  metaTextColors: Record<TToastType, string>;
}

type TToastThemeInput = IToastTheme | "light" | "dark";

interface IToastTiming {
  displayDuration?: number;
  expandDuration?: number;
  collapseDuration?: number;
}

interface IToastStyleOverrides {
  action?: StyleProp<ViewStyle>;
  actionText?: StyleProp<TextStyle>;
  badge?: StyleProp<ViewStyle>;
  body?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  description?: StyleProp<TextStyle>;
  header?: StyleProp<ViewStyle>;
  meta?: StyleProp<TextStyle>;
  progressFill?: StyleProp<ViewStyle>;
  progressTrack?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
}

interface IToastOptions {
  action?: IToastAction;
  secondaryAction?: IToastAction;
  animation?: IToastAnimationConfig;
  animationPreset?: TToastAnimationPreset;
  bodyLayout?: TToastBodyLayout;
  bodyRadius?: number;
  cornerSmoothing?: number;
  content?: ReactNode;
  description?: string;
  dismissible?: boolean;
  duration?: number;
  expandedHeight?: number;
  expandedWidth?: number;
  fill?: string;
  headerContent?: ReactNode;
  horizontalInset?: number;
  id?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  meta?: string;
  onAutoClose?: () => void;
  onDismiss?: () => void;
  position?: TToastPositionInput;
  showHeader?: boolean;
  showIcon?: boolean;
  showIconBadge?: boolean;
  showProgress?: boolean;
  showTimestamp?: boolean;
  springConfig?: TToastSpringConfig;
  stroke?: string;
  textColor?: string;
  styles?: IToastStyleOverrides;
  timing?: IToastTiming;
  title: string;
  type?: TToastType;
}

interface IToastData extends Omit<IToastOptions, "dismissible" | "duration" | "type" | "id"> {
  id: string;
  createdAt: number;
  dismissible: boolean;
  duration: number;
  type: TToastType;
  count?: number;
}

interface IToastPromiseAction {
  error?: IToastAction;
  success?: IToastAction;
}

interface IToastPromiseDescription<TResult, TError = unknown> {
  error?: TToastPromiseDescription<TError>;
  loading?: string;
  success?: TToastPromiseDescription<TResult>;
}

interface IToastPromiseIcon {
  error?: ReactNode;
  loading?: ReactNode;
  success?: ReactNode;
}

interface IToastPromiseData<TResult, TError = unknown>
  extends Omit<IToastOptions, "action" | "description" | "dismissible" | "icon" | "title" | "type"> {
  action?: IToastPromiseAction;
  description?: IToastPromiseDescription<TResult, TError>;
  error: TToastPromiseMessage<TError>;
  icon?: IToastPromiseIcon;
  loading: string;
  success: TToastPromiseMessage<TResult>;
}

interface IToastInsets {
  top: number;
  bottom: number;
}

interface IToastOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface IToastConfig {
  animation?: IToastAnimationConfig;
  animationPreset?: TToastAnimationPreset;
  bodyLayout?: TToastBodyLayout;
  bodyRadius?: number;
  cornerSmoothing?: number;
  duration?: number;
  expand?: boolean;
  expandedHeight?: number;
  expandedWidth?: number;
  fill?: string;
  gap?: number;
  horizontalInset?: number;
  mode?: TToastMode;
  offset?: number | IToastOffset;
  position?: TToastPosition;
  groupDuplicates?: boolean;
  reduceMotion?: boolean;
  showProgress?: boolean;
  showTimestamp?: boolean;
  springConfig?: TToastSpringConfig;
  stroke?: string;
  textColor?: string;
  styles?: IToastStyleOverrides;
  swipeThreshold?: number;
  swipeToDismiss?: boolean;
  theme?: TToastThemeInput;
  visibleToasts?: number;
  /**
   * Lite addition. Screen insets. When omitted, they are read from
   * react-native-safe-area-context if your app has it, otherwise 0.
   */
  insets?: IToastInsets;
}

interface IToastProviderProps extends IToastConfig {
  children?: ReactNode;
}

type TToastUpdateOptions = Partial<Omit<IToastOptions, "title">> & { title?: string };

interface IHeightEntry {
  height: number;
  toastId: string;
}

export {
  ToastAnimationPreset,
  ToastBodyLayout,
  ToastMode,
  ToastPosition,
  ToastType,
  ToastVerticalPosition,
};
export type {
  IHeightEntry,
  IResolvedToastTheme,
  IToastAction,
  IToastAnimationConfig,
  IToastAnimationSpringConfig,
  IToastCompactAnimationConfig,
  IToastConfig,
  IToastData,
  IToastInsets,
  IToastMorphAnimationConfig,
  IToastMountAnimationConfig,
  IToastOffset,
  IToastOptions,
  IToastPromiseAction,
  IToastPromiseData,
  IToastPromiseDescription,
  IToastPromiseIcon,
  IToastProviderProps,
  IToastStackAnimationConfig,
  IToastStyleOverrides,
  IToastTheme,
  IToastTiming,
  TToastAnimationAxis,
  TToastAnimationPreset,
  TToastBodyLayout,
  TToastHorizontalAlign,
  TToastMode,
  TToastPosition,
  TToastPositionInput,
  TToastPromiseDescription,
  TToastPromiseMessage,
  TToastSpringConfig,
  TToastThemeInput,
  TToastType,
  TToastVerticalPosition,
  TToastUpdateOptions,
};
