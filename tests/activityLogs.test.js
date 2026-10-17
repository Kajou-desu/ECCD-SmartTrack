import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORY_OPTIONS,
  buildLogQuery,
  categoryLabel,
  isRangeValid,
  totalPages,
  formatLogTime,
} from "../src/features/activityLogs/utils/activityLogs.js";

test("buildLogQuery sends only the filters that are set", () => {
  assert.deepEqual(buildLogQuery({ category: "", from: "", to: "", q: "  " }, 1), { page: 1, pageSize: 25 });
  assert.deepEqual(buildLogQuery({ category: "student", from: "2026-10-01", to: "", q: " Ana " }, 3), {
    page: 3,
    pageSize: 25,
    category: "student",
    from: "2026-10-01",
    q: "Ana",
  });
});

test("categoryLabel names the part of the action before the dot", () => {
  assert.equal(categoryLabel("student.update"), "Students");
  assert.equal(categoryLabel("auth.login"), "Sign-ins");
  assert.equal(categoryLabel("weird.thing"), "weird");
});

test("every filterable category is one the server accepts", () => {
  const server = ["auth", "account", "student", "attendance", "center", "event", "material", "export"];
  assert.deepEqual(CATEGORY_OPTIONS.map((o) => o.value).filter(Boolean), server);
});

test("totalPages rounds up and is never below 1", () => {
  assert.equal(totalPages(0), 1);
  assert.equal(totalPages(25), 1);
  assert.equal(totalPages(26), 2);
  assert.equal(totalPages(undefined), 1);
});

test("isRangeValid rejects a backwards range only", () => {
  assert.equal(isRangeValid({ from: "2026-10-02", to: "2026-10-01" }), false);
  assert.equal(isRangeValid({ from: "2026-10-01", to: "2026-10-01" }), true);
  assert.equal(isRangeValid({ from: "", to: "2026-10-01" }), true);
});

test("formatLogTime survives a bad value", () => {
  assert.equal(formatLogTime("nope"), "");
  assert.match(formatLogTime("2026-10-12T08:05:00Z"), /2026/);
});

test("downloadCsv reports an export only when it is given a kind", async () => {
  const { downloadCsv } = await import("../src/utils/exportCsv.js");
  // node has no DOM: without a kind nothing else may be touched; with one, the
  // download itself fails here first, which proves the report is after it.
  assert.throws(() => downloadCsv("x.csv", ["a"], [["1"]], { kind: "students" }));
});
