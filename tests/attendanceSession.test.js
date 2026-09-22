import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVE_POLL_MS,
  IDLE_POLL_MS,
  sessionPollInterval,
  normalizeSessionResponse,
} from "../src/features/smartAttendance/utils/attendanceSession.js";

test("polls quickly while a session is active and slowly when idle", () => {
  assert.equal(sessionPollInterval({ id: 1, status: "active" }), ACTIVE_POLL_MS);
  assert.equal(sessionPollInterval(null), IDLE_POLL_MS);
  assert.ok(ACTIVE_POLL_MS < IDLE_POLL_MS);
});

test("normalizes the { session } envelope to an object or null", () => {
  const session = { id: 4, date: "2026-09-20", status: "active" };
  assert.deepEqual(normalizeSessionResponse({ session }), session);
  assert.equal(normalizeSessionResponse({ session: null }), null);
});

test("never returns undefined (React Query treats undefined as an error)", () => {
  for (const bad of [undefined, null, {}, { session: undefined }, { session: "x" }, "oops", 42]) {
    assert.equal(normalizeSessionResponse(bad), null, `input: ${JSON.stringify(bad)}`);
  }
});
