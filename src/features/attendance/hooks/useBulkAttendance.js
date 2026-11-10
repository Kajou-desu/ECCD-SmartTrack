import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";
import { canMarkPickedUp } from "../utils/attendancePickup.js";

const MAX_PER_REQUEST = 200; // the server's limit for one bulk save
const STATUS_ACTIONS = ["present", "absent", "excused"];

// Marking the selected students present / absent / excused, or picked up, in
// one go. Nothing changes until the teacher confirms: request() only works out
// who the action applies to. Every call still goes through the same endpoints,
// so the server decides what each student's teacher may do. Pickup applies only
// to today's present students who haven't been picked up (as for one student);
// the others are skipped and counted.
export function useBulkAttendance({ date, todayKey, records, selectedIds, onDone }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(null); // { action, ids, skipped, date }
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // A confirmation belongs to one date.
  if (pending && pending.date !== date) setPending(null);

  const pickable = useCallback(
    (ids) => ids.filter((id) => canMarkPickedUp(records.find((r) => r.id === id), date, todayKey)),
    [records, date, todayKey],
  );
  const pickupCount = pickable([...selectedIds]).length;

  const request = (action) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (action === "pickup") {
      const eligible = pickable(ids);
      if (eligible.length === 0) {
        showToast("info", "None of the selected students can be marked picked up. They must be present today and not already picked up.");
        return;
      }
      setPending({ action, ids: eligible, skipped: ids.length - eligible.length, date });
      return;
    }
    if (STATUS_ACTIONS.includes(action)) setPending({ action, ids, skipped: 0, date });
  };

  const confirm = async () => {
    if (!pending || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const { action, ids } = pending;
    let done = 0;
    let failed = 0;
    let lastError = null;
    try {
      if (action === "pickup") {
        // One at a time: each notifies the parents, and one failure shouldn't stop the rest.
        for (const id of ids) {
          try {
            await apiClient.markPickedUp(id);
            done += 1;
          } catch (err) {
            failed += 1;
            lastError = err;
          }
        }
      } else {
        for (let i = 0; i < ids.length; i += MAX_PER_REQUEST) {
          const chunk = ids.slice(i, i + MAX_PER_REQUEST);
          try {
            await apiClient.recordAttendance(chunk.map((studentId) => ({ studentId, date: pending.date, status: action })));
            done += chunk.length;
          } catch (err) {
            failed += chunk.length;
            lastError = err;
          }
        }
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
      setPending(null);
    }
    if (done > 0) showToast("success", `${done} student(s) ${action === "pickup" ? "marked picked up" : `marked ${action}`}.`);
    if (failed > 0) {
      // Everything failed: the server's reason (e.g. not your student). Some failed: how many.
      showToast("error", done === 0 ? getErrorMessage(lastError, "Couldn't update the selected students. Please try again.") : `${failed} student(s) couldn't be updated. Please try again.`);
    }
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    await onDone?.();
  };

  return { pending, busy, pickupCount, request, confirm, cancel: () => setPending(null) };
}

export default useBulkAttendance;
