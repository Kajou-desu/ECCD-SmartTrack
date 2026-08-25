// Formats a Date as "YYYY-MM", matching the keys used in mock attendance data.
export function toMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}