// Store / API tests. Run after `npm run build`. Native modules are stubbed so
// only the pure store logic runs in Node.
const Module = require("node:module");
const origLoad = Module._load;
const stub = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? true : stub), apply: () => stub });
Module._load = function (req, ...rest) {
  if (/^react-native(-reanimated|-svg)?$/.test(req)) return stub;
  return origLoad.call(this, req, ...rest);
};

const test = require("node:test");
const assert = require("node:assert");
const { toast, storeState, addToast, updateHeight, setGroupDuplicates } = require("../lib/commonjs/store.js");
const tick = (ms) => new Promise((r) => setTimeout(r, ms));
const reset = () => toast.dismissAll();

test("each call creates a new toast, newest first", () => {
  reset();
  const a = toast.success("Saved");
  const b = toast.error("Failed", { description: "Try again" });
  assert.notEqual(a, b);
  assert.match(a, /^gooey-\d+$/);
  assert.deepEqual(storeState.toasts.map((t) => t.title), ["Failed", "Saved"]);
  assert.equal(storeState.toasts[0].type, "error");
  assert.equal(storeState.toasts[0].duration, 6000);
  assert.equal(storeState.toasts[0].dismissible, true);
});

test("duplicate simple toasts group into one with a count", () => {
  reset();
  const a = toast.success("Saved");
  const b = toast.success("Saved");
  assert.equal(a, b);
  assert.equal(storeState.toasts.length, 1);
  assert.equal(storeState.toasts[0].count, 2);
});

test("toasts with an action do not group", () => {
  reset();
  const action = { label: "OK", onPress: () => {} };
  toast.success("Saved", { action });
  toast.success("Saved", { action });
  assert.equal(storeState.toasts.length, 2);
});

test("different descriptions do not group", () => {
  reset();
  toast.success("Saved", { description: "one" });
  toast.success("Saved", { description: "two" });
  assert.equal(storeState.toasts.length, 2);
});

test("setGroupDuplicates(false) disables grouping", () => {
  reset();
  setGroupDuplicates(false);
  toast.success("Saved");
  toast.success("Saved");
  assert.equal(storeState.toasts.length, 2);
  setGroupDuplicates(true);
});

test("grouping keeps the id and bumps the count + createdAt", () => {
  reset();
  const id = toast.success("Saved");
  const first = storeState.toasts[0].createdAt;
  toast.success("Saved");
  assert.equal(storeState.toasts[0].id, id);
  assert.equal(storeState.toasts[0].count, 2);
  assert.ok(storeState.toasts[0].createdAt >= first);
});

test("plain call defaults to type 'default'", () => {
  reset();
  toast("Hello");
  assert.equal(storeState.toasts[0].type, "default");
});

test("update merges and keeps id + createdAt", () => {
  reset();
  const id = toast.info("One");
  const created = storeState.toasts[0].createdAt;
  assert.equal(toast.update(id, { title: "Two", type: "success" }), true);
  assert.equal(storeState.toasts[0].title, "Two");
  assert.equal(storeState.toasts[0].type, "success");
  assert.equal(storeState.toasts[0].createdAt, created);
  assert.equal(toast.update("nope", { title: "x" }), false);
});

test("dismiss removes toast and its height", () => {
  reset();
  const id = toast.warning("w");
  updateHeight(id, 120);
  assert.equal(storeState.heights.length, 1);
  toast.dismiss(id);
  assert.equal(storeState.toasts.length, 0);
  assert.equal(storeState.heights.length, 0);
});

test("custom() stores content and header", () => {
  reset();
  toast.custom("BODY", { headerContent: "HEAD", title: "AirPods" });
  const t = storeState.toasts[0];
  assert.equal(t.content, "BODY");
  assert.equal(t.headerContent, "HEAD");
  assert.equal(t.type, "default");
});

test("promise: loading (not dismissible, info, spinner) then success", async () => {
  reset();
  const id = toast.promise(tick(20).then(() => ({ id: "tx_1" })), {
    loading: "Uploading…",
    success: (r) => `Uploaded · ${r.id}`,
    error: "Upload failed",
    description: { loading: "Hang tight", success: "In your library." },
  });
  let t = storeState.toasts[0];
  assert.equal(t.id, id);
  assert.equal(t.isLoading, true);
  assert.equal(t.dismissible, false);
  assert.equal(t.type, "info");
  assert.equal(t.description, "Hang tight");
  assert.equal(t.duration, 3600000);
  assert.ok(t.icon);
  await tick(40);
  t = storeState.toasts[0];
  assert.equal(t.title, "Uploaded · tx_1");
  assert.equal(t.type, "success");
  assert.equal(t.isLoading, false);
  assert.equal(t.dismissible, true);
  assert.equal(t.duration, 5000);
  assert.equal(t.description, "In your library.");
});

test("promise rejects -> error message from callback", async () => {
  reset();
  toast.promise(tick(10).then(() => { throw new Error("Network error"); }), {
    loading: "Submitting…",
    success: "Submitted",
    error: (e) => `Failed · ${e.message}`,
  });
  await tick(30);
  assert.equal(storeState.toasts[0].title, "Failed · Network error");
  assert.equal(storeState.toasts[0].type, "error");
});

test("heights ignore sub-pixel changes", () => {
  reset();
  const id = addToast({ title: "h" });
  updateHeight(id, 100);
  const ref = storeState.heights;
  updateHeight(id, 100.4);
  assert.equal(storeState.heights, ref);
});

test("a caller-supplied id is kept and reused", () => {
  reset();
  const id = toast.info("Syncing…", { id: "sync" });
  assert.equal(id, "sync");
  assert.equal(storeState.toasts[0].id, "sync");

  // The same id replaces instead of stacking.
  toast.success("Synced", { id: "sync" });
  assert.equal(storeState.toasts.length, 1);
  assert.equal(storeState.toasts[0].title, "Synced");
  assert.equal(storeState.toasts[0].type, "success");
});

test("isActive reports whether a toast is showing", () => {
  reset();
  const id = toast.info("Hello", { id: "greeting" });
  assert.equal(toast.isActive(id), true);
  assert.equal(toast.isActive("nope"), false);
  toast.dismiss(id);
  assert.equal(toast.isActive(id), false);
});
