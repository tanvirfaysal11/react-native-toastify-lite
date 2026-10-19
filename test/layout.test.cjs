const Module = require("node:module");
const origLoad = Module._load;
const stub = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? true : stub), apply: () => stub });
Module._load = function (req, ...rest) {
  if (/^react-native(-reanimated|-svg)?$/.test(req)) return stub;
  return origLoad.call(this, req, ...rest);
};
const test = require("node:test");
const assert = require("node:assert");
const c = require("../lib/commonjs/config.js");

test("widths: pill and body cap at 350", () => {
  const w = c.getToastWidths({ title: "Saved", screenWidth: 390, measuredPillWidth: 90, horizontalInset: 16 });
  assert.equal(w.pillWidth, 90);
  assert.equal(w.bodyWidth, 350);
  const tablet = c.getToastWidths({ title: "x", screenWidth: 1200, measuredPillWidth: 500, horizontalInset: 16 });
  assert.equal(tablet.pillWidth, 350);
  assert.equal(tablet.bodyWidth, 350);
});

test("presets resolve with Toast defaults", () => {
  const s = c.resolveToastAnimationConfig({});
  assert.deepEqual(s.springs.morph, { damping: 23, stiffness: 235, mass: 1 });
  assert.deepEqual(s.springs.mount, { damping: 16, stiffness: 200, mass: 0.7 });
  assert.equal(s.mount.offset, 50);
  assert.equal(s.morph.squishScaleY, 1);
  const snappy = c.resolveToastAnimationConfig({ animationPreset: "snappy" });
  assert.equal(snappy.springs.morph.stiffness, 360);
  const custom = c.resolveToastAnimationConfig({ animation: { springs: { morph: { damping: 16 } } } });
  assert.equal(custom.springs.morph.damping, 16);
  assert.equal(custom.springs.morph.stiffness, 235);
});

test("positions resolve", () => {
  assert.equal(c.resolveToastStackPosition("top-center", "bottom"), "bottom-center");
  assert.equal(c.resolveToastStackPosition("top-right", undefined), "top-right");
  assert.equal(c.resolveToastStackPosition("top-center", "bottom-left"), "bottom-left");
});

test("expanded height never shorter than measured layout", () => {
  const base = { bodyLayout: "spread", bodyWidth: 358, description: "Short", frontHeight: 40, hasCustomContent: false, isFront: true, measuredHeight: 200, showProgress: true };
  assert.equal(c.getToastHeights({ ...base, measuredCurrent: true }).expandedHeight, 200);
  const est = c.getToastHeights({ ...base, measuredCurrent: false }).expandedHeight;
  assert.ok(est < 200 && est > 40);
});

test("reduceMotion returns an instant config", () => {
  const rm = c.resolveToastAnimationConfig({ reduceMotion: true });
  assert.equal(rm.mount.duration, 0);
  assert.equal(rm.mount.offset, 0);
  assert.equal(rm.mount.axis, "none");
  assert.equal(rm.morph.collapseDuration, 0);
  assert.equal(rm.stack.duration, 0);
  assert.equal(rm.stack.minScale, 1);
  assert.equal(rm.stack.minOpacity, 1);
  assert.equal(rm.springs.morph.overshootClamping, true);
});

test("expanded offsets stack by height + gap", () => {
  const heights = new Map([["a", 40], ["b", 60]]);
  const off = c.getExpandedOffsets([{ id: "a" }, { id: "b" }], heights, 10);
  assert.equal(off.get("a"), 0);
  assert.equal(off.get("b"), 50);
});

test("collapsed offsets cap at the visible count", () => {
  const off = c.getCollapsedOffsets([{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }], 3, 10);
  assert.equal(off.get("a"), 0);
  assert.equal(off.get("b"), 10);
  assert.equal(off.get("c"), 20);
  assert.equal(off.get("d"), 20);
});

test("body layout and morph align resolve", () => {
  assert.equal(c.getBodyLayout(), "spread");
  assert.equal(c.getBodyLayout("center"), "center");
  assert.equal(c.getMorphAlign("left", "right"), "left");
  assert.equal(c.getMorphAlign("center", "right"), "center");
  assert.equal(c.getMorphAlign("spread", "right"), "right");
  assert.equal(c.getHorizontalPosition("top-right"), "right");
  assert.equal(c.getHorizontalPosition("top-center"), "center");
});
