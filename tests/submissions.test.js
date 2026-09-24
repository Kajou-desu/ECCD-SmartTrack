import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getFileBadge, formatSubmittedAt } from "../src/features/materials/utils/submissions.js";

describe("getFileBadge", () => {
  it("marks PDFs", () => {
    assert.deepEqual(getFileBadge("work.pdf"), { label: "PDF", isPdf: true });
    assert.deepEqual(getFileBadge("WORK.PDF"), { label: "PDF", isPdf: true });
  });

  it("labels images by their own extension", () => {
    assert.deepEqual(getFileBadge("photo.png"), { label: "PNG", isPdf: false });
    assert.deepEqual(getFileBadge("photo.jpeg"), { label: "JPEG", isPdf: false });
  });

  it("falls back to FILE when there is no extension", () => {
    assert.deepEqual(getFileBadge("scan"), { label: "FILE", isPdf: false });
    assert.deepEqual(getFileBadge(undefined), { label: "FILE", isPdf: false });
  });
});

describe("formatSubmittedAt", () => {
  it("includes date and time", () => {
    const out = formatSubmittedAt(new Date(2026, 8, 24, 8, 15).toISOString());
    assert.match(out, /Sep 24, 2026/);
    assert.match(out, /8:15\s?AM/);
  });

  it("returns an empty string for missing or invalid input", () => {
    assert.equal(formatSubmittedAt(undefined), "");
    assert.equal(formatSubmittedAt("nope"), "");
  });
});
