// Builds the static Philippine address lists used by the address form
// (src/features/addresses) from a PSGC dataset.
//
//   npm pack psgc-areas && tar xzf psgc-areas-*.tgz      # PSA PSGC as JSON
//   node scripts/build-ph-address-data.mjs package/data  # writes public/data/ph-address
//
// The input directory needs provinces.json, cities.json, municipalities.json and
// barangays.json (the layout of the `psgc-areas` package, which republishes the
// PSA's PSGC publication). Output, all under public/data/ph-address/:
//
//   provinces.json          [{ c, n }]   every province, plus NCR (it has none)
//   provinces/<code>.json   [{ c, n, t, b: [{ c, n }] }]   the province's cities
//                           and municipalities, each with its barangays
//   puroks.json             { "<barangay code>": ["Purok 1", ...] }   see README
//   meta.json               source and counts
//
// A province is fetched only when the user picks it, so the form never loads the
// whole country (about 42,000 barangays) at once.
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const [, , sourceArg, sourceLabel = "PSGC (PSA)"] = process.argv;
if (!sourceArg) {
  console.error("Usage: node scripts/build-ph-address-data.mjs <dir with PSGC json> [source label]");
  process.exit(1);
}

const read = (name) => JSON.parse(readFileSync(path.join(sourceArg, `${name}.json`), "utf8"));
const regions = read("regions");
const provinces = read("provinces");
const cities = read("cities");
const municipalities = read("municipalities");
const barangays = read("barangays");

const byName = (a, b) => a.n.localeCompare(b.n, "en");

// Only NCR's cities and Pateros have no province; they are grouped under their
// region so "National Capital Region (NCR)" appears in the province list.
const regionName = new Map(regions.map((r) => [r.code, r.name]));
// The PSGC file gives every highly urbanized / independent component city a
// `province`, but for these 17 it is wrong (it points at the last province of
// the region: Cebu City -> Siquijor, Davao City -> Davao Occidental, ...), so
// people picking "Cebu" would never find Cebu City. Each is placed under the
// province it is actually in. A city's code starts with its province's first
// five digits, which is what the check below uses to catch any other case.
const CITY_PROVINCE = {
  "1430300000": "1401100000", // Baguio -> Benguet
  "0330100000": "0305400000", // Angeles -> Pampanga
  "0331400000": "0307100000", // Olongapo -> Zambales
  "0431200000": "0405600000", // Lucena -> Quezon
  "1731500000": "1705300000", // Puerto Princesa -> Palawan
  "0630200000": "0604500000", // Bacolod -> Negros Occidental
  "0631000000": "0603000000", // Iloilo City -> Iloilo
  "0730600000": "0702200000", // Cebu City -> Cebu
  "0731100000": "0702200000", // Lapu-Lapu -> Cebu
  "0731300000": "0702200000", // Mandaue -> Cebu
  "0831600000": "0803700000", // Tacloban -> Leyte
  "0931700000": "0907300000", // Zamboanga City -> Zamboanga del Sur
  "1030900000": "1003500000", // Iligan -> Lanao del Norte
  "1130700000": "1102400000", // Davao City -> Davao del Sur
  "1230800000": "1206300000", // General Santos -> South Cotabato
  "1630400000": "1600200000", // Butuan -> Agusan del Norte
  "0990101000": "1900700000", // Isabela City -> Basilan (a province-less city of Region IX)
};

const groupOf = (place) => CITY_PROVINCE[place.code] ?? place.province ?? place.region;

// A city/municipality outside the override list whose code does not start with
// its province's must not slip through unnoticed when the data is rebuilt.
for (const item of [...cities, ...municipalities]) {
  const group = groupOf(item);
  if (item.province && !CITY_PROVINCE[item.code] && item.province.slice(0, 5) !== item.code.slice(0, 5) && item.cityClass !== "HUC") {
    throw new Error(`${item.name}: listed under ${group} but its code says otherwise; add it to CITY_PROVINCE`);
  }
  if (CITY_PROVINCE[item.code] && !provinces.some((p) => p.code === CITY_PROVINCE[item.code])) {
    throw new Error(`${item.name}: override province ${CITY_PROVINCE[item.code]} does not exist`);
  }
}

const groups = new Map(); // group code -> { c, n, places: Map(code -> place) }
for (const p of provinces) groups.set(p.code, { c: p.code, n: p.name, places: new Map() });

const place = (item, type) => {
  const key = groupOf(item);
  if (!groups.has(key)) {
    if (!regionName.has(key)) throw new Error(`${item.name}: unknown province/region ${key}`);
    groups.set(key, { c: key, n: regionName.get(key), places: new Map() });
  }
  groups.get(key).places.set(item.code, { c: item.code, n: item.name, t: type, b: [] });
};
for (const c of cities) place(c, "city");
for (const m of municipalities) place(m, "municipality");

const placeByCode = new Map();
for (const g of groups.values()) for (const [code, p] of g.places) placeByCode.set(code, p);

for (const b of barangays) {
  const parent = placeByCode.get(b.city ?? b.municipality);
  if (!parent) throw new Error(`${b.name}: no city/municipality ${b.city ?? b.municipality}`);
  parent.b.push({ c: b.code, n: b.name });
}

const out = path.resolve("public/data/ph-address");
rmSync(path.join(out, "provinces"), { recursive: true, force: true });
mkdirSync(path.join(out, "provinces"), { recursive: true });

// Provinces with no city or municipality in the source would be unselectable.
const index = [];
let placeCount = 0;
let barangayCount = 0;
for (const g of groups.values()) {
  const list = [...g.places.values()].sort(byName);
  list.forEach((p) => p.b.sort(byName));
  if (list.length === 0) continue;
  placeCount += list.length;
  barangayCount += list.reduce((n, p) => n + p.b.length, 0);
  writeFileSync(path.join(out, "provinces", `${g.c}.json`), JSON.stringify(list));
  index.push({ c: g.c, n: g.n });
}
index.sort(byName);
writeFileSync(path.join(out, "provinces.json"), JSON.stringify(index));

// Puroks are not part of the PSGC (they are informal sub-barangay areas with no
// national register), so this file is only created once and never overwritten.
const puroks = path.join(out, "puroks.json");
if (!existsSync(puroks)) writeFileSync(puroks, "{}\n");

writeFileSync(
  path.join(out, "meta.json"),
  JSON.stringify({ source: sourceLabel, provinces: index.length, citiesAndMunicipalities: placeCount, barangays: barangayCount }, null, 2) + "\n",
);
console.log(`Wrote ${index.length} provinces, ${placeCount} cities/municipalities, ${barangayCount} barangays to ${out}`);
