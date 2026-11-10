import { ConfirmDialog } from "./AttendanceDialogs";
import { formatUsDate } from "@utils/usDate.js";

const STATUS_LABEL = { present: "present", absent: "absent", excused: "excused" };

// Asks before the selected students are all marked at once.
export default function BulkAttendanceDialog({ pending, todayKey, busy, onConfirm, onCancel }) {
  if (!pending) return null;
  const { action, ids, skipped, date } = pending;
  const students = `${ids.length} student${ids.length === 1 ? "" : "s"}`;

  let title;
  let message;
  if (action === "pickup") {
    title = "Mark selected as picked up?";
    message = `${students} will be marked picked up and their parents/guardians will be notified by app, email and SMS.`;
    if (skipped > 0) message += ` ${skipped} other selected student${skipped === 1 ? " is" : "s are"} skipped (not present today, or already picked up).`;
  } else {
    title = `Mark selected as ${STATUS_LABEL[action]}?`;
    message = `${students} will be marked ${STATUS_LABEL[action]} for ${formatUsDate(date)}. This replaces their current status and clears any pickup already recorded.`;
    if (action === "present" && date === todayKey) message += " Parents/guardians of students not already present will be notified of the arrival.";
  }

  return <ConfirmDialog open title={title} message={busy ? "Saving..." : message} onCancel={busy ? () => {} : onCancel} onConfirm={busy ? () => {} : onConfirm} />;
}
