// The server only accepts a departure for TODAY's record of a student who is
// present and hasn't already departed (PATCH /attendance/:id/depart), so the
// "Mark departed" control is only offered in exactly that case.
export function canMarkDeparted(record, dateKey, todayKey) {
  return Boolean(record) && dateKey === todayKey && record.status === "present" && !record.departedAt;
}

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
