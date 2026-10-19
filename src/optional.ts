/**
 * Optional integration with react-native-safe-area-context, used only when the
 * app already has it. Metro treats a `require` inside try/catch as optional
 * (on by default), so nothing breaks when it is not installed.
 */
import type { Context } from "react";

/* ----------------------- react-native-safe-area-context ---------------------- */

type Insets = { top: number; right: number; bottom: number; left: number };

let safeArea: {
  SafeAreaInsetsContext?: Context<Insets | null>;
  initialWindowMetrics?: { insets: Insets } | null;
} | null = null;
try {
  safeArea = require("react-native-safe-area-context");
} catch {
  safeArea = null;
}

export const SafeAreaInsetsContext = safeArea?.SafeAreaInsetsContext ?? null;
export const initialInsets = safeArea?.initialWindowMetrics?.insets ?? null;

/* ------------------------- Reanimated major version ------------------------ */

let reanimatedMajor = 3;
try {
  reanimatedMajor = parseInt(require("react-native-reanimated/package.json").version, 10) || 3;
} catch {
  reanimatedMajor = 3;
}

/** Animated `filter: blur()` styles need Reanimated 4. */
export const CAN_ANIMATE_FILTER = reanimatedMajor >= 4;
