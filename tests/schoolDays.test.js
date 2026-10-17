import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DAY_TYPES, countSchoolDays, dayKeysOfMonth, dayType, isWeekend } from "../src/features/calendar/utils/schoolDays.js";

describe("schoolDays", () => {
  it("lists every day of a month, leap February included", () => {
    assert.equal(dayKeysOfMonth("2026-10").length, 31);
    assert.equal(dayKeysOfMonth("2026-02").length, 28);
    assert.equal(dayKeysOfMonth("2028-02").length, 29);
    assert.equal(dayKeysOfMonth("2026-10")[0], "2026-10-01");
  });

  it("knows weekends (2026-10-10 is a Saturday)", () => {
    assert.equal(isWeekend("2026-10-10"), true);
    assert.equal(isWeekend("2026-10-11"), true);
    assert.equal(isWeekend("2026-10-12"), false);
  });

  it("a weekday is a school day unless it is a holiday or no class", () => {
    const sets = { holidayKeys: new Set(["2026-10-13"]), noClassKeys: new Set(["2026-10-14", "2026-10-13", "2026-10-10"]) };
    assert.equal(dayType("2026-10-12", sets), DAY_TYPES.SCHOOL);
    assert.equal(dayType("2026-10-14", sets), DAY_TYPES.NO_CLASS);
    assert.equal(dayType("2026-10-13", sets), DAY_TYPES.NO_CLASS); // explicit no class beats holiday
    assert.equal(dayType("2026-10-10", sets), DAY_TYPES.WEEKEND); // weekend beats everything
    assert.equal(dayType("2026-10-15", { holidayKeys: new Set(["2026-10-15"]) }), DAY_TYPES.HOLIDAY);
  });

  it("counts school days: weekdays minus holidays and no-class days (each once)", () => {
    assert.equal(countSchoolDays("2026-10"), 22);
    assert.equal(countSchoolDays("2026-10", { noClassKeys: new Set(["2026-10-14", "2026-10-15"]) }), 20);
    // a day that is both a holiday and no class is only removed once
    assert.equal(countSchoolDays("2026-10", { holidayKeys: new Set(["2026-10-14"]), noClassKeys: new Set(["2026-10-14"]) }), 21);
    // weekend entries change nothing
    assert.equal(countSchoolDays("2026-10", { noClassKeys: new Set(["2026-10-10"]) }), 22);
  });
});
