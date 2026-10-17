// Which days of a month are school days. A weekday is a school day unless it is
// a holiday or a day marked "no class"; Saturdays and Sundays never are. All
// dates are "YYYY-MM-DD" keys handled with UTC arithmetic, so the browser's
// timezone can never shift a day.

export const DAY_TYPES = { SCHOOL: "school", NO_CLASS: "noClass", HOLIDAY: "holiday", WEEKEND: "weekend" };

const pad = (n) => String(n).padStart(2, "0");

export function dayKeysOfMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`);
}

export function isWeekend(dateKey) {
  const weekday = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return weekday === 0 || weekday === 6;
}

// holidayKeys / noClassKeys: Sets of "YYYY-MM-DD". A no-class day wins over a
// holiday (it is the teacher's explicit statement), a weekend over both.
export function dayType(dateKey, { holidayKeys = new Set(), noClassKeys = new Set() } = {}) {
  if (isWeekend(dateKey)) return DAY_TYPES.WEEKEND;
  if (noClassKeys.has(dateKey)) return DAY_TYPES.NO_CLASS;
  if (holidayKeys.has(dateKey)) return DAY_TYPES.HOLIDAY;
  return DAY_TYPES.SCHOOL;
}

export function countSchoolDays(monthKey, sets) {
  return dayKeysOfMonth(monthKey).filter((key) => dayType(key, sets) === DAY_TYPES.SCHOOL).length;
}
