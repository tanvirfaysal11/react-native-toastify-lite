import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import type { IResolvedToastTheme, TToastThemeInput, TToastType } from "./types";

const each = (v: string): Record<TToastType, string> => ({
  default: v,
  success: v,
  error: v,
  warning: v,
  info: v,
});

// Sileo's state colors (oklch converted to hex).
export const typeColors: Record<TToastType, string> = {
  default: "#737373",
  success: "#3ac530",
  error: "#fb2c36",
  warning: "#f0b100",
  info: "#00a6f4",
};

// Sileo tints the badge/button background with the accent at a fixed alpha.
const accentBg = (alpha: number): Record<TToastType, string> => ({
  default: `rgba(115,115,115,${alpha})`,
  success: `rgba(58,197,48,${alpha})`,
  error: `rgba(251,44,54,${alpha})`,
  warning: `rgba(240,177,0,${alpha})`,
  info: `rgba(0,166,244,${alpha})`,
});

export const DEFAULT_THEME: IResolvedToastTheme = {
  colors: typeColors,
  surfaceColors: each("#1a1a1a"),
  surfaceStrokeColors: each("transparent"),
  badgeBgColors: accentBg(0.2),
  actionColors: accentBg(0.15),
  actionTextColors: { ...typeColors },
  textColors: each("rgba(255,255,255,0.5)"),
  metaTextColors: each("rgba(255,255,255,0.4)"),
};

export const DARK_THEME: IResolvedToastTheme = DEFAULT_THEME;

export const LIGHT_THEME: IResolvedToastTheme = {
  colors: typeColors,
  surfaceColors: each("#f2f2f2"),
  surfaceStrokeColors: each("transparent"),
  badgeBgColors: accentBg(0.2),
  actionColors: accentBg(0.15),
  actionTextColors: { ...typeColors },
  textColors: each("rgba(0,0,0,0.5)"),
  metaTextColors: each("rgba(0,0,0,0.4)"),
};

const ToastThemeContext = createContext<IResolvedToastTheme>(DEFAULT_THEME);

export function resolveTheme(
  theme: TToastThemeInput | undefined,
  systemScheme: "light" | "dark" | null | undefined,
): IResolvedToastTheme {
  // The toast contrasts with the app theme: a dark app gets a light toast and
  // a light app gets a dark toast, so the pill always stands out.
  const appScheme = typeof theme === "string" ? theme : (systemScheme ?? "light");
  const base = appScheme === "dark" ? LIGHT_THEME : DARK_THEME;
  if (!theme || typeof theme === "string") return base;
  return {
    colors: { ...base.colors, ...theme.colors },
    surfaceColors: { ...base.surfaceColors, ...theme.surfaceColors },
    surfaceStrokeColors: { ...base.surfaceStrokeColors, ...theme.surfaceStrokeColors },
    badgeBgColors: { ...base.badgeBgColors, ...theme.badgeBgColors },
    actionColors: { ...base.actionColors, ...theme.actionColors },
    actionTextColors: { ...base.actionTextColors, ...theme.actionTextColors },
    textColors: { ...base.textColors, ...theme.textColors },
    metaTextColors: { ...base.metaTextColors, ...theme.metaTextColors },
  };
}

export function ToastThemeProvider({ children, theme }: { children: ReactNode; theme?: TToastThemeInput }) {
  const systemScheme = useColorScheme();
  const resolved = useMemo<IResolvedToastTheme>(() => resolveTheme(theme, systemScheme), [theme, systemScheme]);
  return <ToastThemeContext.Provider value={resolved}>{children}</ToastThemeContext.Provider>;
}

export const useToastTheme = () => useContext(ToastThemeContext);
