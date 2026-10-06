import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeCsvValue, downloadCsv, csvText } from "../src/utils/exportCsv.js";

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

// Runs downloadCsv against a stubbed browser and returns the bytes it produced.
async function capture(headers, rows) {
  let blob;
  const realWindow = globalThis.window;
  const realDocument = globalThis.document;
  globalThis.window = { URL: { createObjectURL: (b) => ((blob = b), "blob:x"), revokeObjectURL() {} } };
  globalThis.document = {
    createElement: () => ({ click() {} }),
    body: { appendChild() {}, removeChild() {} },
  };
  try {
    downloadCsv("t.csv", headers, rows);
  } finally {
    globalThis.window = realWindow;
    globalThis.document = realDocument;
  }
  return new Uint8Array(await blob.arrayBuffer());
}

test("file starts with a UTF-8 BOM so Excel reads accented names correctly", async () => {
  const bytes = await capture(["Name"], [["Peña"]]);
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
});

test("headers are quoted and lines end in CRLF", async () => {
  const text = new TextDecoder().decode(await capture(["Name", "Phone"], [["A", "B"], ["C", "D"]]));
  assert.equal(text.replace("\uFEFF", ""), '"Name","Phone"\r\n"A","B"\r\n"C","D"');
});

test("csvText keeps leading zeros on phone numbers", async () => {
  const text = new TextDecoder().decode(await capture(["Phone"], [[csvText("09171234567")]]));
  assert.match(text, /="09171234567"/);
});

test("csvText does not open a formula-injection hole", async () => {
  const text = new TextDecoder().decode(await capture(["Phone"], [[csvText('=1+1"&evil')]]));
  assert.doesNotMatch(text, /^="/m);
  assert.match(text, /"'=1\+1""&evil"/);
});
