import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  INSTALL_DISMISSED_KEY,
  INSTALL_REOFFER_DAYS,
  isIosSafari,
  isStandalone,
  rememberDismissed,
  wasDismissedRecently,
} from "../src/utils/installPrompt.js";

const memory = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
};
const DAY = 24 * 60 * 60 * 1000;

describe("isStandalone", () => {
  it("is true when launched from the home screen", () => {
    assert.equal(isStandalone({ matchMedia: () => ({ matches: true }) }), true);
    assert.equal(isStandalone({ matchMedia: () => ({ matches: false }), navigator: { standalone: true } }), true);
  });
  it("is false in a normal browser tab, or with no window", () => {
    assert.equal(isStandalone({ matchMedia: () => ({ matches: false }), navigator: {} }), false);
    assert.equal(isStandalone(undefined), false);
  });
});

describe("isIosSafari", () => {
  const safari = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  it("detects Safari on iPhone and on iPadOS (which reports as a Mac)", () => {
    assert.equal(isIosSafari({ userAgent: safari, platform: "iPhone", maxTouchPoints: 5 }), true);
    assert.equal(
      isIosSafari({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15", platform: "MacIntel", maxTouchPoints: 5 }),
      true,
    );
  });
  it("is false for a desktop Mac, Android, and other iOS browsers", () => {
    assert.equal(isIosSafari({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", platform: "MacIntel", maxTouchPoints: 0 }), false);
    assert.equal(isIosSafari({ userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36", platform: "Linux armv8l", maxTouchPoints: 5 }), false);
    assert.equal(isIosSafari({ userAgent: safari.replace("Version/17.0", "CriOS/120"), platform: "iPhone", maxTouchPoints: 5 }), false);
    assert.equal(isIosSafari(undefined), false);
  });
});

describe("dismissal", () => {
  it("stays away for the re-offer period, then comes back", () => {
    const storage = memory();
    const t0 = Date.UTC(2026, 9, 12);
    assert.equal(wasDismissedRecently(t0, storage), false);
    rememberDismissed(t0, storage);
    assert.equal(wasDismissedRecently(t0 + DAY, storage), true);
    assert.equal(wasDismissedRecently(t0 + (INSTALL_REOFFER_DAYS - 1) * DAY, storage), true);
    assert.equal(wasDismissedRecently(t0 + (INSTALL_REOFFER_DAYS + 1) * DAY, storage), false);
  });

  it("ignores garbage in storage and survives blocked storage", () => {
    const storage = memory();
    storage.setItem(INSTALL_DISMISSED_KEY, "banana");
    assert.equal(wasDismissedRecently(Date.now(), storage), false);
    const blocked = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
    assert.equal(wasDismissedRecently(Date.now(), blocked), false);
    assert.doesNotThrow(() => rememberDismissed(Date.now(), blocked));
  });
});

describe("web app manifest", () => {
  const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  it("has what browsers need to offer installation", () => {
    assert.ok(manifest.name && manifest.short_name);
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.display, "standalone");
    const sizes = manifest.icons.map((i) => i.sizes);
    assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
    assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
  });
  it("points only at icon files that exist", () => {
    for (const icon of manifest.icons) {
      assert.doesNotThrow(() => readFileSync(new URL(`../public${icon.src}`, import.meta.url)), icon.src);
    }
  });
  it("is linked from index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(html, /rel="apple-touch-icon"/);
  });
});
