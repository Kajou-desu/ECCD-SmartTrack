import { test } from "node:test";
import assert from "node:assert/strict";
import { toDayKey } from "../src/utils/dateKeys.js";

test("toDayKey is the local calendar day, not the UTC day", () => {
  // 01:00 local on Oct 2: the UTC date is Oct 1 anywhere east of UTC.
  const localEarlyMorning = new Date(2026, 9, 2, 1, 0, 0);
  assert.equal(toDayKey(localEarlyMorning), "2026-10-02");
});
