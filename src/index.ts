import { toast } from "./store";
import { ToastProvider } from "./Toaster";

export { toast, ToastProvider };

export { toastAnimationPresets } from "./config";
export { DefaultIcon, ErrorIcon, InfoIcon, SpinnerIcon, SuccessIcon, WarningIcon } from "./icons";
export { DARK_THEME, DEFAULT_THEME, LIGHT_THEME } from "./theme";
export {
  ToastAnimationPreset,
  ToastBodyLayout,
  ToastMode,
  ToastPosition,
  ToastType,
  ToastVerticalPosition,
} from "./types";
export type {
  IToastAction,
  IToastAnimationConfig,
  IToastAnimationSpringConfig,
  IToastCompactAnimationConfig,
  IToastConfig,
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
} from "./types";
