// Formats a Date as "YYYY-MM", matching the keys used in mock attendance data.
export function toMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

// Formats a Date as "YYYY-MM-DD" in local time (not UTC), matching the date
// keys used by attendance records.
export function toDayKey(date = new Date()) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
}