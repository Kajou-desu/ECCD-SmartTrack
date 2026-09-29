import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toTenDigitPhone } from "../src/features/accounts/utils/accountUtils.js";

describe("toTenDigitPhone", () => {
  const cases = [
    ["9171234567", "9171234567"],
    ["09171234567", "9171234567"], // legacy 11-digit
    ["0917-123-4567", "9171234567"],
    ["+63 917 123 4567", "9171234567"],
    ["639171234567", "9171234567"],
    ["917123456789", "9171234567"], // capped at 10
    ["", ""],
    [null, ""],
    [undefined, ""],
    ["abc", ""],
  ];
  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      assert.equal(toTenDigitPhone(input), expected);
    });
  }
});
