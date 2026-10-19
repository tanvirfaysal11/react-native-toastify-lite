// Theme resolution tests. Run after `npm run build`. Native modules are stubbed
// so only the pure resolveTheme logic runs in Node.
const Module = require("node:module");
const origLoad = Module._load;
const stub = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? true : stub), apply: () => stub });
Module._load = function (req, ...rest) {
  if (/^react-native(-reanimated|-svg)?$/.test(req)) return stub;
  return origLoad.call(this, req, ...rest);
};

const test = require("node:test");
const assert = require("node:assert");
const { resolveTheme, LIGHT_THEME, DARK_THEME, DEFAULT_THEME } = require("../lib/commonjs/theme.js");

test("DEFAULT_THEME is the dark theme", () => {
  assert.strictEqual(DEFAULT_THEME, DARK_THEME);
  assert.strictEqual(DARK_THEME.surfaceColors.default, "#1a1a1a");
  assert.strictEqual(LIGHT_THEME.surfaceColors.default, "#f2f2f2");
});

test("toast contrasts with the app theme", () => {
  assert.strictEqual(resolveTheme("dark", undefined), LIGHT_THEME);
  assert.strictEqual(resolveTheme("light", undefined), DARK_THEME);
});

test("auto-detect contrasts with the system scheme", () => {
  assert.strictEqual(resolveTheme(undefined, "dark"), LIGHT_THEME);
  assert.strictEqual(resolveTheme(undefined, "light"), DARK_THEME);
  assert.strictEqual(resolveTheme(undefined, null), DARK_THEME);
});

test("object theme merges over the resolved base", () => {
  const r = resolveTheme({ surfaceColors: { success: "#0f1a12" } }, "light");
  assert.strictEqual(r.surfaceColors.success, "#0f1a12");
  assert.strictEqual(r.surfaceColors.error, DARK_THEME.surfaceColors.error);
  assert.strictEqual(r.textColors.default, DARK_THEME.textColors.default);
});

test("text/meta colors differ between light and dark", () => {
  assert.notStrictEqual(LIGHT_THEME.textColors.default, DARK_THEME.textColors.default);
  assert.notStrictEqual(LIGHT_THEME.metaTextColors.default, DARK_THEME.metaTextColors.default);
});
