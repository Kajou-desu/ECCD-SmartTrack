import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  applyAppearance,
  loadAppearance,
  resolveTheme,
  sanitizeAppearance,
  saveAppearance,
} from "../src/utils/appearance.js";

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

function fakeRoot() {
  const classes = new Set();
  return {
    classes,
    classList: {
      toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)),
    },
    style: {},
    dataset: {},
  };
}

test("sanitizeAppearance keeps known values and defaults everything else", () => {
  assert.deepEqual(sanitizeAppearance({ theme: "dark", textSize: "large" }), {
    theme: "dark",
    textSize: "large",
  });
  assert.deepEqual(sanitizeAppearance(null), DEFAULT_APPEARANCE);
  assert.deepEqual(sanitizeAppearance({ theme: "<script>", textSize: 12 }), DEFAULT_APPEARANCE);
  assert.deepEqual(sanitizeAppearance({ theme: "dark", textSize: "huge" }), {
    theme: "dark",
    textSize: "medium",
  });
});

test("loadAppearance falls back to defaults for missing, corrupt or blocked storage", () => {
  assert.deepEqual(loadAppearance(fakeStorage()), DEFAULT_APPEARANCE);
  assert.deepEqual(
    loadAppearance(fakeStorage({ [APPEARANCE_STORAGE_KEY]: "{not json" })),
    DEFAULT_APPEARANCE,
  );
  const blocked = {
    getItem() {
      throw new Error("SecurityError");
    },
  };
  assert.deepEqual(loadAppearance(blocked), DEFAULT_APPEARANCE);
});

test("saveAppearance round-trips and only ever stores sanitized values", () => {
  const storage = fakeStorage();
  saveAppearance({ theme: "dark", textSize: "small", extra: "x" }, storage);
  assert.deepEqual(JSON.parse(storage.data[APPEARANCE_STORAGE_KEY]), {
    theme: "dark",
    textSize: "small",
  });
  assert.deepEqual(loadAppearance(storage), { theme: "dark", textSize: "small" });
});

test("saveAppearance does not throw when storage is blocked", () => {
  const blocked = {
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  assert.doesNotThrow(() => saveAppearance(DEFAULT_APPEARANCE, blocked));
});

test("resolveTheme: explicit choices win, system follows the OS", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});

test("applyAppearance sets the dark class, colour-scheme and text size", () => {
  const root = fakeRoot();
  applyAppearance(root, { theme: "dark", textSize: "large" }, false);
  assert.ok(root.classes.has("dark"));
  assert.equal(root.style.colorScheme, "dark");
  assert.equal(root.dataset.textSize, "large");

  applyAppearance(root, { theme: "light", textSize: "small" }, true);
  assert.ok(!root.classes.has("dark"));
  assert.equal(root.style.colorScheme, "light");
  assert.equal(root.dataset.textSize, "small");

  applyAppearance(root, { theme: "system", textSize: "medium" }, true);
  assert.ok(root.classes.has("dark"));
});

// public/appearance-init.js duplicates the logic so the theme is set before
// first paint. Run it against the same inputs and require identical results.
function runInitScript(stored, systemDark) {
  const root = fakeRoot();
  const sandbox = {
    document: { documentElement: root },
    localStorage: fakeStorage(stored === undefined ? {} : { [APPEARANCE_STORAGE_KEY]: stored }),
    window: { matchMedia: () => ({ matches: systemDark }) },
  };
  vm.runInNewContext(fs.readFileSync("public/appearance-init.js", "utf8"), sandbox);
  return root;
}

test("appearance-init.js matches applyAppearance for every combination", () => {
  const stored = [
    undefined,
    "{not json",
    JSON.stringify({ theme: "<img onerror=x>", textSize: "huge" }),
    ...["system", "light", "dark"].flatMap((theme) =>
      ["small", "medium", "large"].map((textSize) => JSON.stringify({ theme, textSize })),
    ),
  ];
  for (const raw of stored) {
    for (const systemDark of [true, false]) {
      let parsed = null;
      try {
        parsed = raw === undefined ? null : JSON.parse(raw);
      } catch {
        // corrupt JSON -> defaults, same as the script
      }
      const expected = fakeRoot();
      applyAppearance(expected, parsed, systemDark);
      const actual = runInitScript(raw, systemDark);
      assert.equal(actual.classes.has("dark"), expected.classes.has("dark"), `${raw} / ${systemDark}`);
      assert.equal(actual.style.colorScheme, expected.style.colorScheme);
      assert.equal(actual.dataset.textSize, expected.dataset.textSize);
    }
  }
});
