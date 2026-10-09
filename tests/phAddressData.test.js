import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Checks the generated lists in public/data/ph-address (scripts/build-ph-address-data.mjs).
const DIR = "public/data/ph-address";
const read = (file) => JSON.parse(readFileSync(`${DIR}/${file}`, "utf8"));

const provinces = read("provinces.json");
const placesOf = (code) => read(`provinces/${code}.json`);
const everyPlace = provinces.flatMap((p) => placesOf(p.c).map((place) => ({ ...place, province: p.n })));

test("every listed province has a file, and every file is listed", () => {
  const files = readdirSync(`${DIR}/provinces`).map((f) => f.replace(".json", "")).sort();
  assert.deepEqual(files, provinces.map((p) => p.c).sort());
  assert.ok(provinces.length >= 82);
});

test("the 17 cities whose source province was wrong are under the province they are in", () => {
  const expected = {
    "City of Baguio": "Benguet",
    "City of Angeles": "Pampanga",
    "City of Olongapo": "Zambales",
    "City of Lucena": "Quezon",
    "City of Puerto Princesa": "Palawan",
    "City of Bacolod": "Negros Occidental",
    "City of Iloilo": "Iloilo",
    "City of Cebu": "Cebu",
    "City of Lapu-Lapu": "Cebu",
    "City of Mandaue": "Cebu",
    "City of Tacloban": "Leyte",
    "City of Zamboanga": "Zamboanga del Sur",
    "City of Cagayan De Oro": "Misamis Oriental",
    "City of Iligan": "Lanao del Norte",
    "City of Davao": "Davao del Sur",
    "City of General Santos": "South Cotabato",
    "City of Butuan": "Agusan del Norte",
    "City of Isabela": "Basilan",
  };
  const found = new Map(everyPlace.map((p) => [p.n, p.province]));
  for (const [city, province] of Object.entries(expected)) assert.equal(found.get(city), province, city);
});

test("a city or municipality is listed under exactly one province", () => {
  const seen = new Set();
  for (const place of everyPlace) {
    assert.ok(!seen.has(place.c), `${place.n} appears twice`);
    seen.add(place.c);
  }
});

test("a municipality's code starts with its province's", () => {
  const codeOf = new Map(provinces.map((p) => [p.n, p.c]));
  for (const place of everyPlace) {
    if (place.t !== "municipality" || place.province.startsWith("National Capital Region")) continue;
    assert.equal(place.c.slice(0, 5), codeOf.get(place.province).slice(0, 5), place.n);
  }
});

test("NCR is selectable as a province and holds Manila and Pateros", () => {
  const ncr = provinces.find((p) => p.n.startsWith("National Capital Region"));
  const names = placesOf(ncr.c).map((p) => p.n);
  assert.ok(names.includes("City of Manila"));
  assert.ok(names.includes("Pateros"));
});

test("every city and municipality has barangays", () => {
  let total = 0;
  for (const place of everyPlace) {
    assert.ok(place.b.length > 0, `${place.n} has no barangays`);
    total += place.b.length;
  }
  assert.ok(total > 41000);
});

test("names are sorted and nothing is blank", () => {
  const names = provinces.map((p) => p.n);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "en")));
  for (const place of everyPlace) assert.ok(place.n.trim() && place.b.every((b) => b.n.trim()));
});
