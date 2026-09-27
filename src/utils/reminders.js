// Relative import (not the "@constants/..." alias) so this file can be unit
// tested with plain `node --test`, same as the rest of src/utils.
import { HOLIDAYS } from "../constants/holidays.js";
import formatStudentName from "./formatStudentName.js";

const MONTH_ABBREVIATIONS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// How far ahead the banner starts warning about something.
export const REMINDER_WINDOW_DAYS = 7;

// Midnight of the given date, in local time, so two dates on the same day
// always compare equal regardless of the hour they were built at.
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from, to) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

// Same "YYYY-MM-DD prefix, else fall back to Date parsing" approach as
// CalendarEvents.jsx's getBirthdayMonthAndDay — birthdays show up in both
// shapes depending on which endpoint returned them (the date-only roster
// list vs. a raw Prisma Date on a parent's own children).
function getMonthAndDay(dateValue) {
  if (typeof dateValue === "string") {
    const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return { month: Number(match[2]), day: Number(match[3]) };
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return { month: parsed.getMonth() + 1, day: parsed.getDate() };
}

// The next date (this year, or next if this year's has already passed) that
// falls on this month/day, on or after `today`. Returns null for a date that
// never occurs (e.g. Feb 29 in a run of non-leap years) — same as
// CalendarEvents.jsx, which silently skips those rather than shifting them.
function nextOccurrence(month, day, today) {
  const base = startOfDay(today);
  for (const year of [base.getFullYear(), base.getFullYear() + 1]) {
    const candidate = new Date(year, month - 1, day);
    if (candidate.getMonth() !== month - 1) continue; // rolled over: not a real date this year
    if (candidate >= base) return candidate;
  }
  return null;
}

// null if outside the window, otherwise the (non-negative) day count.
function withinWindow(date, today, windowDays) {
  if (!date) return null;
  const daysUntil = daysBetween(today, date);
  return daysUntil >= 0 && daysUntil <= windowDays ? daysUntil : null;
}

// students: roster/children rows with a .birthday. Works for the full
// roster (Teacher/Admin) or just a parent's own children.
export function getBirthdayReminders(students = [], today = new Date(), windowDays = REMINDER_WINDOW_DAYS) {
  const items = [];
  for (const student of students) {
    const monthAndDay = getMonthAndDay(student?.birthday);
    if (!monthAndDay) continue;
    const date = nextOccurrence(monthAndDay.month, monthAndDay.day, today);
    const daysUntil = withinWindow(date, today, windowDays);
    if (daysUntil === null) continue;
    items.push({
      kind: "Birthday",
      label: `${formatStudentName(student) || "A student"}'s Birthday`,
      date,
      daysUntil,
    });
  }
  return items;
}

// The static, recurring Philippine holiday list from constants/holidays.js.
export function getHolidayReminders(today = new Date(), windowDays = REMINDER_WINDOW_DAYS) {
  const items = [];
  for (const holiday of HOLIDAYS) {
    const month = MONTH_ABBREVIATIONS.indexOf(holiday.month) + 1;
    if (month === 0) continue;
    const date = nextOccurrence(month, Number(holiday.day), today);
    const daysUntil = withinWindow(date, today, windowDays);
    if (daysUntil === null) continue;
    items.push({ kind: "Holiday", label: holiday.name, date, daysUntil });
  }
  return items;
}

// eventLogs: the `logs` array from GET /api/events (Teacher/Admin only) —
// each entry has a "YYYY-MM-DD" dateKey, a title, and a status (category).
// Unlike birthdays/holidays these are one-off dates, not yearly-recurring.
export function getEventReminders(eventLogs = [], today = new Date(), windowDays = REMINDER_WINDOW_DAYS) {
  const items = [];
  for (const log of eventLogs) {
    if (!log?.dateKey) continue;
    const date = new Date(`${log.dateKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) continue;
    const daysUntil = withinWindow(date, today, windowDays);
    if (daysUntil === null) continue;
    const kind = log.status === "Holiday" || log.status === "Birthday" ? log.status : "Event";
    items.push({ kind, label: log.title || kind, date, daysUntil });
  }
  return items;
}

const KIND_ICON = {
  Birthday: "🎂",
  Holiday: "🎉",
  Event: "📌",
};

function describeDaysUntil(daysUntil) {
  if (daysUntil === 0) return "today";
  if (daysUntil === 1) return "tomorrow";
  return `in ${daysUntil} days`;
}

// Sorts reminder items soonest-first and renders them into the single
// string the marquee-style ReminderBanner displays. null when there's
// nothing upcoming, so callers can fall back to a default message.
export function formatReminders(items = []) {
  if (!items.length) return null;
  const sorted = [...items].sort(
    (a, b) => a.daysUntil - b.daysUntil || a.label.localeCompare(b.label),
  );
  return sorted
    .map((item) => `${KIND_ICON[item.kind] ?? "📅"} ${item.label} is ${describeDaysUntil(item.daysUntil)}`)
    .join("   •   ");
}
