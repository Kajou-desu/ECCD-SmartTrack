import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTagAddress, describeTagError } from "../src/features/smartAttendance/utils/bleTag.js";

test("normalizeTagAddress upper-cases, trims, and accepts ':' or '-'", () => {
  assert.equal(normalizeTagAddress("d7:40:47:15:14:90"), "D7:40:47:15:14:90");
  assert.equal(normalizeTagAddress("  D7-40-47-15-14-90 "), "D7:40:47:15:14:90");
});

test("normalizeTagAddress tolerates whitespace around a pasted address (and sends the trimmed value)", () => {
  assert.equal(normalizeTagAddress("D7:40:47:15:14:90\n"), "D7:40:47:15:14:90");
  assert.equal(normalizeTagAddress("\t d7-40-47-15-14-90 \r\n"), "D7:40:47:15:14:90");
});

test("normalizeTagAddress rejects anything that isn't a MAC address", () => {
  for (const bad of [undefined, null, 5, "", "hello", "D7:40:47:15:14", "D7:40:47:15:14:90:00",
    "GG:40:47:15:14:90", "D740.4715.1490", "D7:40:47:15:14:90; DROP TABLE", "D7:40:47:15:14:90\n; DROP", "D7:40:47\n:15:14:90"]) {
    assert.equal(normalizeTagAddress(bad), null, `input: ${JSON.stringify(bad)}`);
  }
});

test("describeTagError gives an actionable sentence per failure", () => {
  assert.match(describeTagError({ status: 400 }), /like D7:40:47:15:14:90/);
  assert.match(describeTagError({ status: 404 }), /no longer exists/);
  assert.match(describeTagError({ status: 403 }), /permission/);
  assert.match(describeTagError({ status: 500 }), /couldn't be saved/);
  assert.match(describeTagError(new Error("network")), /couldn't be saved/);
});

test("describeTagError shows the server's teacher-facing message for a 409 only", () => {
  assert.equal(describeTagError({ status: 409, details: { message: "This device is already registered" } }), "This device is already registered");
  assert.match(describeTagError({ status: 409, details: {} }), /already be registered/);
  // A server message on any other status is never echoed.
  assert.doesNotMatch(describeTagError({ status: 500, details: { message: "SELECT * FROM secrets" } }), /SELECT/);
});
