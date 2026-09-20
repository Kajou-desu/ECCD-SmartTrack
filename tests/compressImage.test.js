import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { compressImage, compressImages, targetSize } from "../src/utils/compressImage.js";

// The real work (decode + JPEG encode) is done by the browser's own
// createImageBitmap / canvas, which Node doesn't have. These tests stub
// those two so what's verified is OUR logic: what gets skipped, how it's
// resized, and that every failure falls back to the untouched original.

function fakeFile(name, type, size) {
  return new File([new Uint8Array(size)], name, { type, lastModified: 1700000000000 });
}

let calls;
let inFlight;
let maxInFlight;
function stubBrowser({ bitmapSize = { width: 4000, height: 3000 }, outputSize = 100, decodeFails = false, blobIsNull = false } = {}) {
  calls = { fill: [], draw: [], closed: 0, canvas: null };
  inFlight = 0;
  maxInFlight = 0;

  globalThis.createImageBitmap = async () => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (decodeFails) {
      inFlight -= 1;
      throw new Error("cannot decode");
    }
    return { ...bitmapSize, close: () => { calls.closed += 1; inFlight -= 1; } };
  };
  globalThis.document = {
    createElement: () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
          set fillStyle(value) { calls.fill.push(["style", value]); },
          fillRect: () => calls.fill.push(["rect"]),
          drawImage: () => calls.draw.push(["draw", canvas.width, canvas.height]),
        }),
        toBlob: (cb) => cb(blobIsNull ? null : new Blob([new Uint8Array(outputSize)], { type: "image/jpeg" })),
      };
      calls.canvas = canvas;
      return canvas;
    },
  };
}

beforeEach(() => stubBrowser());
afterEach(() => {
  delete globalThis.createImageBitmap;
  delete globalThis.document;
});

test("targetSize never scales up and preserves aspect ratio", () => {
  assert.deepEqual(targetSize(800, 600), { width: 800, height: 600 });
  assert.deepEqual(targetSize(2000, 1000), { width: 2000, height: 1000 });
  assert.deepEqual(targetSize(4000, 3000), { width: 2000, height: 1500 });
  assert.deepEqual(targetSize(3000, 4000), { width: 1500, height: 2000 });
  assert.deepEqual(targetSize(10000, 1), { width: 2000, height: 1 }); // never collapses to 0
});

test("shrinks a large photo: JPEG, .jpg name, resized, original metadata untouched", async () => {
  const original = fakeFile("IMG_0001.png", "image/png", 5_000_000);
  const out = await compressImage(original);

  assert.notEqual(out, original);
  assert.equal(out.type, "image/jpeg");
  assert.equal(out.name, "IMG_0001.jpg");
  assert.equal(out.size, 100);
  assert.equal(out.lastModified, original.lastModified);
  assert.deepEqual([calls.canvas.width, calls.canvas.height], [2000, 1500]);
  assert.equal(original.size, 5_000_000); // the input file is never modified
});

test("paints a white base before the image (transparent PNGs must not turn black)", async () => {
  await compressImage(fakeFile("logo.png", "image/png", 900_000));
  assert.deepEqual(calls.fill, [["style", "#fff"], ["rect"]]);
  assert.equal(calls.draw.length, 1);
});

test("releases the decoded bitmap", async () => {
  await compressImage(fakeFile("a.jpg", "image/jpeg", 900_000));
  assert.equal(calls.closed, 1);
});

test("returns non-images untouched, without decoding anything", async () => {
  for (const [name, type] of [["doc.pdf", "application/pdf"], ["w.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], ["anim.gif", "image/gif"]]) {
    const file = fakeFile(name, type, 500_000);
    assert.equal(await compressImage(file), file);
  }
  assert.equal(calls.canvas, null);
});

test("returns non-File input untouched", async () => {
  assert.equal(await compressImage(null), null);
  assert.equal(await compressImage("nope"), "nope");
});

test("keeps the original when the result would not be smaller", async () => {
  stubBrowser({ outputSize: 600_000 });
  const original = fakeFile("small.jpg", "image/jpeg", 500_000);
  assert.equal(await compressImage(original), original);
});

test("falls back to the original when the image cannot be decoded", async () => {
  stubBrowser({ decodeFails: true });
  const original = fakeFile("broken.jpg", "image/jpeg", 500_000);
  assert.equal(await compressImage(original), original);
});

test("falls back to the original when encoding produces nothing", async () => {
  stubBrowser({ blobIsNull: true });
  const original = fakeFile("a.jpg", "image/jpeg", 500_000);
  assert.equal(await compressImage(original), original);
  assert.equal(calls.closed, 1); // still cleaned up
});

test("falls back to the original when the browser lacks the APIs", async () => {
  delete globalThis.createImageBitmap;
  const original = fakeFile("a.jpg", "image/jpeg", 500_000);
  assert.equal(await compressImage(original), original);
});

test("compressImages keeps order and decodes one image at a time", async () => {
  const files = ["a", "b", "c", "d"].map((n) => fakeFile(`${n}.jpg`, "image/jpeg", 900_000));
  const out = await compressImages(files);

  assert.deepEqual(out.map((f) => f.name), ["a.jpg", "b.jpg", "c.jpg", "d.jpg"]);
  assert.equal(maxInFlight, 1);
});
