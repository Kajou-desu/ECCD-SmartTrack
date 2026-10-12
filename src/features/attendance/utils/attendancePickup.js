// The server only accepts a pickup for TODAY's record of a student who is
// present and hasn't already been picked up (PATCH /attendance/:id/pickup), so the
// "Mark picked up" control is only offered in exactly that case.
export function canMarkPickedUp(record, dateKey, todayKey) {
  return Boolean(record) && dateKey === todayKey && record.status === "present" && !record.pickedUpAt;
}

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
