import test from "node:test";
import assert from "node:assert/strict";
import { combineAddress, splitAddress } from "../src/features/students/utils/address.js";

test("combines and splits all four address parts", () => {
  const parts = {
    province: " Rizal ",
    municipality: "Antipolo",
    barangay: "San Jose",
    details: "Purok 2, Lot 4",
  };

  assert.deepEqual(splitAddress(combineAddress(parts)), {
    province: "Rizal",
    municipality: "Antipolo",
    barangay: "San Jose",
    details: "Purok 2, Lot 4",
  });
});

test("keeps legacy student addresses editable", () => {
  assert.deepEqual(splitAddress("Purok 1, Barangay San Jose"), {
    province: "",
    municipality: "",
    barangay: "San Jose",
    details: "Purok 1",
  });
  assert.equal(splitAddress("Old Road, Block 2").details, "Old Road, Block 2");
});