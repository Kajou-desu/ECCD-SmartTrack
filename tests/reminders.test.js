import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REMINDER_WINDOW_DAYS,
  getBirthdayReminders,
  getHolidayReminders,
  getEventReminders,
  formatReminders,
} from "../src/utils/reminders.js";

test("REMINDER_WINDOW_DAYS is one week", () => {
  assert.equal(REMINDER_WINDOW_DAYS, 7);
});

test("includes a birthday exactly 7 days out and excludes one 8 days out", () => {
  const today = new Date(2026, 8, 20); // Sep 20, 2026
  const students = [
    { name: "In Window", birthday: "2018-09-27" }, // +7 days
    { name: "Out Of Window", birthday: "2018-09-28" }, // +8 days
  ];
  const results = getBirthdayReminders(students, today);
  assert.equal(results.length, 1);
  assert.equal(results[0].label, "In Window's Birthday");
  assert.equal(results[0].daysUntil, 7);
});

test("a birthday today is included with daysUntil 0", () => {
  const today = new Date(2026, 8, 20);
  const students = [{ name: "Birthday Kid", birthday: "2020-09-20" }];
  const results = getBirthdayReminders(students, today);
  assert.equal(results.length, 1);
  assert.equal(results[0].daysUntil, 0);
});

test("a birthday already passed this year rolls over to next year", () => {
  const today = new Date(2026, 11, 30); // Dec 30, 2026
  const students = [{ name: "New Year Baby", birthday: "2019-01-01" }];
  const results = getBirthdayReminders(students, today);
  assert.equal(results.length, 1);
  assert.equal(results[0].daysUntil, 2); // Dec 30 -> Jan 1
});

test("a Feb 29 birthday is skipped in a non-leap year rather than shifted", () => {
  const today = new Date(2026, 1, 25); // Feb 25, 2026 (2026 is not a leap year)
  const students = [{ name: "Leap Day", birthday: "2016-02-29" }];
  const results = getBirthdayReminders(students, today);
  assert.equal(results.length, 0);
});

test("accepts a full ISO timestamp as well as a plain date string", () => {
  const today = new Date(2026, 8, 20);
  const students = [{ name: "ISO Kid", birthday: "2020-09-22T00:00:00.000Z" }];
  const results = getBirthdayReminders(students, today);
  assert.equal(results.length, 1);
  assert.equal(results[0].daysUntil, 2);
});

test("ignores students with a missing or invalid birthday", () => {
  const today = new Date(2026, 8, 20);
  const students = [{ name: "No Birthday" }, { name: "Bad Date", birthday: "not-a-date" }];
  assert.equal(getBirthdayReminders(students, today).length, 0);
});

test("finds a holiday within the window and skips ones outside it", () => {
  const today = new Date(2026, 10, 25); // Nov 25, 2026 -> Bonifacio Day (Nov 30) is +5
  const results = getHolidayReminders(today);
  assert.equal(results.length, 1);
  assert.equal(results[0].label, "Bonifacio Day");
  assert.equal(results[0].daysUntil, 5);
});

test("finds an event log within the window", () => {
  const today = new Date(2026, 9, 1); // Oct 1, 2026
  const eventLogs = [
    { dateKey: "2026-10-04", title: "Founding Day", status: "Event" },
    { dateKey: "2026-10-20", title: "Too Far", status: "Event" },
  ];
  const results = getEventReminders(eventLogs, today);
  assert.equal(results.length, 1);
  assert.equal(results[0].label, "Founding Day");
  assert.equal(results[0].kind, "Event");
  assert.equal(results[0].daysUntil, 3);
});

test("carries a manually-entered Holiday/Birthday event category through as its own kind", () => {
  const today = new Date(2026, 9, 1);
  const eventLogs = [{ dateKey: "2026-10-02", title: "Suspended Classes", status: "Holiday" }];
  const results = getEventReminders(eventLogs, today);
  assert.equal(results[0].kind, "Holiday");
});

test("formatReminders returns null when there is nothing upcoming", () => {
  assert.equal(formatReminders([]), null);
});

test("formatReminders sorts soonest first and includes an icon per kind", () => {
  const items = [
    { kind: "Holiday", label: "Later Holiday", daysUntil: 5 },
    { kind: "Birthday", label: "Sooner Birthday", daysUntil: 1 },
  ];
  const text = formatReminders(items);
  assert.ok(text.indexOf("Sooner Birthday") < text.indexOf("Later Holiday"));
  assert.match(text, /🎂 Sooner Birthday is tomorrow/);
  assert.match(text, /🎉 Later Holiday is in 5 days/);
});
