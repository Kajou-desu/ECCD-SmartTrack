# Philippine address lists

Used by the address section of the student, guardian and account forms
(`src/features/students/components/form/AddressFields.jsx`).

| File | Content |
| --- | --- |
| `provinces.json` | `[{ c, n }]` every province, plus "National Capital Region (NCR)", which has none |
| `provinces/<code>.json` | `[{ c, n, t, b: [{ c, n }] }]` that province's cities and municipalities, each with its barangays |
| `puroks.json` | `{ "<barangay code>": ["Purok 1", ...] }` optional suggestions, see below |
| `meta.json` | source and counts |

`c` is the PSA's 10-digit PSGC code, `n` the name, `t` is `city` or `municipality`.
A province's file is fetched only when it is picked, so the form never loads
the whole country (about 42,000 barangays) at once.

## Rebuilding

The lists come from the PSA's Philippine Standard Geographic Code (PSGC), through
the `psgc-areas` npm package (use the exact version recorded in `meta.json`'s
source line, or a newer one and review the diff):

    npm pack psgc-areas && tar xzf psgc-areas-*.tgz
    node scripts/build-ph-address-data.mjs package/data "PSGC <month year> (PSA), via psgc-areas"

`npm test` checks the generated files. The script refuses to build if a city
or municipality is filed under a province its code does not belong to: the
source file is wrong for 17 independent / highly urbanized cities (Cebu City is
filed under Siquijor, Davao City under Davao Occidental, and so on), and the
script's `CITY_PROVINCE` table puts them in the province they are in.

## Puroks

A purok is an informal area inside a barangay. No national register exists, so
the form keeps "Purok / House # / Street" as free text. To suggest puroks for a
barangay, add its code to `puroks.json`; the build never overwrites that file:

    { "0702201001": ["Purok 1", "Purok 2", "Sampaguita"] }

The suggestions appear in the box as the user types; anything else can still be typed.
