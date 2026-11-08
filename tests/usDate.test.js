import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUsDate, formatUsDate } from "../src/utils/usDate.js";

test("parses MM/DD/YYYY into a YYYY-MM-DD key, with or without leading zeros", () => {
  assert.equal(parseUsDate("09/05/2026"), "2026-09-05");
  assert.equal(parseUsDate("9/5/2026"), "2026-09-05");
  assert.equal(parseUsDate("12/31/2026"), "2026-12-31");
  assert.equal(parseUsDate("  10/05/2026 "), "2026-10-05");
});

test("05/10/2026 is always May 10 (never read day-first)", () => {
  assert.equal(parseUsDate("05/10/2026"), "2026-05-10");
  assert.equal(parseUsDate("25/12/2026"), null);
});

test("only real calendar dates parse", () => {
  for (const value of ["02/30/2026", "02/29/2026", "04/31/2026", "00/10/2026", "10/00/2026", "13/01/2026"]) {
    assert.equal(parseUsDate(value), null, value);
  }
  assert.equal(parseUsDate("02/29/2028"), "2028-02-29");
  assert.equal(parseUsDate("02/29/2100"), null); // 2100 is not a leap year
});

test("anything not in exactly that format is refused", () => {
  const bad = ["2026-10-05", "10-05-2026", "10.05.2026", "10/05/26", "10/05/20266", "1/2/3", "Oct 5, 2026", "10/05", "", "  ", null, undefined, 20261005, "10/05/2026 08:00", "٠٩/٠٥/٢٠٢٦"];
  for (const value of bad) assert.equal(parseUsDate(value), null, JSON.stringify(value));
});

test("formats a date key as MM/DD/YYYY and ignores a trailing time", () => {
  assert.equal(formatUsDate("2026-09-05"), "09/05/2026");
  assert.equal(formatUsDate("2026-09-05T00:00:00.000Z"), "09/05/2026");
});

test("formatting gives blank for anything that isn't a date key", () => {
  for (const value of ["", null, undefined, "not a date", "09/05/2026", 5]) assert.equal(formatUsDate(value), "", String(value));
});

test("format and parse are inverses", () => {
  for (const key of ["2026-01-01", "2028-02-29", "2026-12-31"]) assert.equal(parseUsDate(formatUsDate(key)), key);
});
