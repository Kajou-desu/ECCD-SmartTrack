// Matches ACTIVITY_CATEGORIES on the server (the part of an action before the dot).
export const CATEGORY_OPTIONS = [
  { value: "", label: "All activity" },
  { value: "auth", label: "Sign-ins" },
  { value: "account", label: "Accounts" },
  { value: "student", label: "Students" },
  { value: "attendance", label: "Attendance" },
  { value: "center", label: "Centers" },
  { value: "event", label: "Events" },
  { value: "material", label: "Materials" },
  { value: "export", label: "Exports" },
];

export const PAGE_SIZE = 25;

export const EMPTY_FILTERS = { category: "", from: "", to: "", q: "" };

// "student.update" -> "Students"; unknown categories fall back to the raw text.
export function categoryLabel(action) {
  const category = String(action ?? "").split(".")[0];
  return CATEGORY_OPTIONS.find((o) => o.value === category && o.value)?.label ?? category;
}

// Only the filters that are set go in the query string.
export function buildLogQuery(filters, page, pageSize = PAGE_SIZE) {
  const params = { page, pageSize };
  for (const key of ["category", "from", "to"]) {
    if (filters[key]) params[key] = filters[key];
  }
  const q = String(filters.q ?? "").trim();
  if (q) params.q = q;
  return params;
}

export function totalPages(total, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil((Number(total) || 0) / pageSize));
}

// The date range is only valid when it isn't backwards.
export function isRangeValid({ from, to }) {
  return !from || !to || from <= to;
}

export function formatLogTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
