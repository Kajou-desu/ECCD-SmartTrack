// Loads the static Philippine address lists in public/data/ph-address (built by
// scripts/build-ph-address-data.mjs from the PSA's PSGC). Provinces are listed
// up front; a province's cities, municipalities and barangays load only when
// it is picked, and every file is fetched once per page load.
const BASE_URL = `${import.meta.env.BASE_URL}data/ph-address`;

// Codes come from the lists themselves, but are checked before they are put
// in a URL so nothing else can ever be requested through this loader.
const PSGC_CODE = /^\d{10}$/;

const cache = new Map();

function getJson(file) {
  if (!cache.has(file)) {
    const request = fetch(`${BASE_URL}/${file}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Address data request failed (${response.status})`);
        return response.json();
      })
      .catch((error) => {
        cache.delete(file); // a failed request is retried next time
        throw error;
      });
    cache.set(file, request);
  }
  return cache.get(file);
}

// [{ c: code, n: name }], sorted by name. Includes the National Capital Region,
// which has no provinces.
export const loadProvinces = () => getJson("provinces.json");

// [{ c, n, t: "city" | "municipality", b: [{ c, n }] }] — the province's cities
// and municipalities, each with its barangays.
export function loadProvincePlaces(provinceCode) {
  if (!PSGC_CODE.test(provinceCode)) return Promise.reject(new Error("Invalid province code"));
  return getJson(`provinces/${provinceCode}.json`);
}

// { "<barangay code>": ["1", "2", "Sampaguita"] } — optional purok suggestions.
// Puroks are not part of the PSGC, so this starts empty (see public/data/ph-address/README.md).
export const loadPuroks = () => getJson("puroks.json");
