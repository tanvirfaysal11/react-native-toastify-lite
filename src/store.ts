import { createElement, type ReactNode } from "react";
import { DEFAULT_DURATION, PROMISE_PENDING_DURATION } from "./constants";
import { getDisplayDuration } from "./config";
import { SpinnerIcon } from "./icons";
import type {
  IHeightEntry,
  IToastAction,
  IToastData,
  IToastOptions,
  IToastPromiseData,
  TToastUpdateOptions,
} from "./types";

/* ---------------------------------- State --------------------------------- */

type TToastsListener = (toasts: IToastData[]) => void;
type THeightsListener = (heights: IHeightEntry[]) => void;
type TUpdateListener = (options: TToastUpdateOptions) => void;

export const storeState = {
  defaultDuration: DEFAULT_DURATION,
  groupDuplicates: true,
  heights: [] as IHeightEntry[],
  idCounter: 0,
  toasts: [] as IToastData[],
};

const toastsListeners = new Set<TToastsListener>();
const heightsListeners = new Set<THeightsListener>();
const updateListeners = new Map<string, Set<TUpdateListener>>();

const notifyToasts = () => {
  const snap = [...storeState.toasts];
  toastsListeners.forEach((l) => l(snap));
};
const notifyHeights = () => {
  const snap = [...storeState.heights];
  heightsListeners.forEach((l) => l(snap));
};

/* --------------------------------- Toasts --------------------------------- */

export function addToast(options: Partial<IToastOptions>): string {
  const title = options.title ?? "";
  const type = options.type ?? "default";
  const id = options.id ?? `gooey-${++storeState.idCounter}`;

  // A caller-supplied id is a stable key: reuse it, replacing any toast it already points to.
  if (options.id) {
    const existing = storeState.toasts.find((t) => t.id === id);
    if (existing) {
      storeState.toasts = storeState.toasts.map((t) =>
        t.id === id
          ? {
              ...t,
              ...options,
              id,
              title,
              type,
              count: undefined,
              createdAt: Date.now(),
              duration: options.duration ?? storeState.defaultDuration,
              dismissible: options.dismissible ?? true,
            }
          : t,
      );
      notifyToasts();
      return id;
    }
  }

  // Group simple duplicates (same title + type, no action/content/promise) into one toast.
  if (
    storeState.groupDuplicates &&
    !options.action &&
    !options.secondaryAction &&
    !options.content &&
    !options.isLoading
  ) {
    const existing = storeState.toasts.find(
      (t) =>
        t.title === title &&
        t.type === type &&
        t.description === options.description &&
        !t.action &&
        !t.secondaryAction &&
        !t.content &&
        !t.isLoading,
    );
    if (existing) {
      storeState.toasts = storeState.toasts.map((t) =>
        t.id === existing.id
          ? { ...t, count: (t.count ?? 1) + 1, createdAt: Date.now(), duration: options.duration ?? storeState.defaultDuration }
          : t,
      );
      notifyToasts();
      return existing.id;
    }
  }

  const toast: IToastData = {
    ...options,
    id,
    title,
    type,
    duration: options.duration ?? storeState.defaultDuration,
    dismissible: options.dismissible ?? true,
    createdAt: Date.now(),
  };
  // Newest first.
  storeState.toasts = [toast, ...storeState.toasts];
  notifyToasts();
  return id;
}

export function removeToast(id: string) {
  storeState.toasts = storeState.toasts.filter((t) => t.id !== id);
  storeState.heights = storeState.heights.filter((e) => e.toastId !== id);
  updateListeners.delete(id);
  notifyToasts();
  notifyHeights();
}

export function updateToast(id: string, options: TToastUpdateOptions) {
  const index = storeState.toasts.findIndex((t) => t.id === id);
  if (index < 0) return false;
  const current = storeState.toasts[index];
  const next: IToastData = {
    ...current,
    ...options,
    id: current.id,
    createdAt: current.createdAt,
    title: options.title ?? current.title,
    type: options.type ?? current.type,
    duration: options.duration ?? current.duration,
    isLoading: options.isLoading ?? current.isLoading,
    timing: options.timing ?? current.timing,
    dismissible: options.dismissible ?? current.dismissible,
  };
  storeState.toasts = storeState.toasts.map((t) => (t.id === id ? next : t));
  updateListeners.get(id)?.forEach((l) => l(options));
  notifyToasts();
  return true;
}

export function dismissAll() {
  storeState.toasts = [];
  storeState.heights = [];
  notifyToasts();
  notifyHeights();
}

export function setDefaultDuration(duration: number) {
  storeState.defaultDuration = duration;
}

export function setGroupDuplicates(enabled: boolean) {
  storeState.groupDuplicates = enabled;
}

export function subscribeToasts(l: TToastsListener) {
  toastsListeners.add(l);
  return () => {
    toastsListeners.delete(l);
  };
}

export const getToasts = () => storeState.toasts;

export const isToastActive = (id: string) => storeState.toasts.some((t) => t.id === id);

/* --------------------------------- Heights -------------------------------- */

export function updateHeight(toastId: string, height: number) {
  const current = storeState.heights.find((e) => e.toastId === toastId);
  if (current && Math.abs(current.height - height) < 1) return;
  storeState.heights = current
    ? storeState.heights.map((e) => (e.toastId === toastId ? { ...e, height } : e))
    : [{ toastId, height }, ...storeState.heights];
  notifyHeights();
}

export function subscribeHeights(l: THeightsListener) {
  heightsListeners.add(l);
  return () => {
    heightsListeners.delete(l);
  };
}

export const getHeights = () => storeState.heights;

/* --------------------------------- Promise -------------------------------- */

const resolveMessage = <T>(v: string | ((r: T) => string), input: T) =>
  typeof v === "function" ? v(input) : v;

const resolveDescription = <T>(v: string | ((r: T) => string | undefined) | undefined, input: T) =>
  !v ? undefined : typeof v === "function" ? v(input) : v;

function settle<TResult, TError>(
  id: string,
  data: IToastPromiseData<TResult, TError>,
  next: {
    action?: IToastAction;
    description?: string;
    icon?: ReactNode;
    title: string;
    type: "success" | "error";
  },
) {
  updateToast(id, {
    ...next,
    dismissible: true,
    duration: getDisplayDuration(data),
    isLoading: false,
    timing: data.timing,
  });
}

function createPromiseToast<TResult, TError = unknown>(
  promise: Promise<TResult>,
  data: IToastPromiseData<TResult, TError>,
) {
  const { action, description, icon, loading, success, error, timing } = data;
  // Same fixed option list (showHeader/showProgress/content are not forwarded).
  const id = addToast({
    animation: data.animation,
    animationPreset: data.animationPreset,
    bodyLayout: data.bodyLayout,
    bodyRadius: data.bodyRadius,
    cornerSmoothing: data.cornerSmoothing,
    expandedHeight: data.expandedHeight,
    expandedWidth: data.expandedWidth,
    fill: data.fill,
    horizontalInset: data.horizontalInset,
    meta: data.meta,
    onAutoClose: data.onAutoClose,
    onDismiss: data.onDismiss,
    position: data.position,
    showIcon: data.showIcon,
    showIconBadge: data.showIconBadge,
    showTimestamp: data.showTimestamp,
    springConfig: data.springConfig,
    stroke: data.stroke,
    styles: data.styles,
    action: undefined,
    description: description?.loading,
    dismissible: false,
    duration: PROMISE_PENDING_DURATION,
    icon: icon?.loading ?? createElement(SpinnerIcon, { color: "#3b82f6", size: 16 }),
    isLoading: true,
    timing: timing ? { ...timing, displayDuration: undefined } : undefined,
    title: loading,
    type: "info",
  });

  promise
    .then((result) =>
      settle(id, data, {
        action: action?.success,
        description: resolveDescription(description?.success, result),
        icon: icon?.success,
        title: resolveMessage(success, result),
        type: "success",
      }),
    )
    .catch((err: TError) =>
      settle(id, data, {
        action: action?.error,
        description: resolveDescription(description?.error, err),
        icon: icon?.error,
        title: resolveMessage(error, err),
        type: "error",
      }),
    );

  return id;
}

/* ----------------------------------- API ---------------------------------- */

type TOpts = Omit<IToastOptions, "title">;
type TTypedOpts = Omit<IToastOptions, "title" | "type">;

export const toast = Object.assign((title: string, options?: TOpts) => addToast({ title, ...options }), {
  success: (title: string, options?: TTypedOpts) => addToast({ title, type: "success", ...options }),
  error: (title: string, options?: TTypedOpts) => addToast({ title, type: "error", ...options }),
  warning: (title: string, options?: TTypedOpts) => addToast({ title, type: "warning", ...options }),
  info: (title: string, options?: TTypedOpts) => addToast({ title, type: "info", ...options }),
  update: (id: string, options: TToastUpdateOptions) => updateToast(id, options),
  isActive: isToastActive,
  promise: <TResult, TError = unknown>(
    promise: Promise<TResult>,
    data: IToastPromiseData<TResult, TError>,
  ) => createPromiseToast(promise, data),
  dismiss: removeToast,
  dismissAll,
  custom: (content: ReactNode, options?: Partial<Omit<IToastOptions, "content">>) =>
    addToast({
      title: options?.title ?? "",
      type: options?.type ?? "default",
      ...options,
      content,
    }),
});
