import { test } from "node:test";
import assert from "node:assert/strict";
import { thumbnailUrl } from "../src/utils/fileUrl.js";

const signed = "https://api.example.com/api/files/1758-ab12.jpg?exp=1760000000000&sig=abc123";

test("adds v=thumb to an API file URL and keeps the signature untouched", () => {
  const url = new URL(thumbnailUrl(signed));
  assert.equal(url.searchParams.get("v"), "thumb");
  assert.equal(url.searchParams.get("exp"), "1760000000000");
  assert.equal(url.searchParams.get("sig"), "abc123");
  assert.equal(url.pathname, "/api/files/1758-ab12.jpg");
});

test("doesn't stack the parameter when called twice", () => {
  const once = thumbnailUrl(signed);
  assert.equal(thumbnailUrl(once), once);
});

test("leaves anything that isn't an API file URL alone", () => {
  assert.equal(thumbnailUrl("https://cdn.example.com/photo.jpg"), "https://cdn.example.com/photo.jpg");
  assert.equal(thumbnailUrl("blob:http://localhost/abc"), "blob:http://localhost/abc");
  assert.equal(thumbnailUrl(null), null);
  assert.equal(thumbnailUrl(undefined), undefined);
  assert.equal(thumbnailUrl(""), "");
});

test("returns the input when it only looks like a file URL but doesn't parse", () => {
  assert.equal(thumbnailUrl("/api/files/x.jpg?exp=1&sig=2"), "/api/files/x.jpg?exp=1&sig=2");
});
