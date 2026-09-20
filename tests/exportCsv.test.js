import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeCsvValue } from "../src/utils/exportCsv.js";

test("wraps plain values in quotes", () => {
  assert.equal(escapeCsvValue("Sep 20, 2026"), '"Sep 20, 2026"');
});

test("doubles embedded quotes", () => {
  assert.equal(escapeCsvValue('say "hi"'), '"say ""hi"""');
});

test("renders null/undefined as an empty cell", () => {
  assert.equal(escapeCsvValue(null), '""');
  assert.equal(escapeCsvValue(undefined), '""');
});

for (const trigger of ["=", "+", "-", "@", "\t", "\r"]) {
  test(`neutralizes a text cell starting with ${JSON.stringify(trigger)}`, () => {
    const out = escapeCsvValue(`${trigger}SUM(A1:A9)`);
    assert.ok(out.startsWith(`"'${trigger}`), `expected a leading ' inside the quotes, got ${out}`);
  });
}

test("neutralizes a realistic payload", () => {
  const out = escapeCsvValue('=HYPERLINK("http://evil.example","click")');
  assert.equal(out, `"'=HYPERLINK(""http://evil.example"",""click"")"`);
});

test("leaves numbers alone, including negative ones", () => {
  assert.equal(escapeCsvValue(-5), '"-5"');
  assert.equal(escapeCsvValue(42), '"42"');
});

test("does not touch text that merely contains a trigger character", () => {
  assert.equal(escapeCsvValue("a=b"), '"a=b"');
  assert.equal(escapeCsvValue("Mary-Ann"), '"Mary-Ann"');
});
