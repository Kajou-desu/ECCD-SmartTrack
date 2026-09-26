import { toDayKey } from "../../../utils/dateKeys.js";

// Monday of the week containing `date`, as a local Date at midnight.
export function mondayOf(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toWeekKey(date) {
  return toDayKey(date);
}

// "Sep 21 – Sep 27, 2026" for the week starting on `monday`.
export function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const startLabel = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = sunday.toLocaleDateString("en-US", {
    month: monday.getMonth() === sunday.getMonth() ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}
