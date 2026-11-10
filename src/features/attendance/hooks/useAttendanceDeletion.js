import { useCallback, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";

// Selecting students on one day and deleting their attendance records. Deleting
// is two steps so nothing is removed by surprise: asking first has the server
// COUNT what would go (a dry run: students with no record yet have nothing to
// delete), and only a confirmation after that deletes. The selection belongs to
// one date and is dropped when the date changes.
export function useAttendanceDeletion({ date, visibleIds, onDeleted }) {
  const showToast = useToast();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [pending, setPending] = useState(null); // { ids, count } waiting for confirmation
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false); // blocks a second click before the re-render lands

  const [selectionDate, setSelectionDate] = useState(date);
  if (date !== selectionDate) {
    setSelectionDate(date);
    setSelectedIds(new Set());
    setPending(null);
  }

  const toggle = useCallback((id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  // Everyone currently listed (so a search or filter narrows "all"); a second
  // press clears it.
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(visibleIds));
  }, [allSelected, visibleIds]);

  const toggleMode = useCallback(() => {
    setSelectionMode((on) => !on);
    setSelectedIds(new Set());
    setPending(null);
  }, []);

  const guarded = async (work) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await work();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const requestDelete = () =>
    guarded(async () => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;
      try {
        const { wouldDelete } = await apiClient.deleteAttendance({ from: date, studentIds: ids, dryRun: true });
        if (wouldDelete === 0) {
          showToast("info", "None of the selected students have a record on this date.");
          return;
        }
        setPending({ ids, count: wouldDelete });
      } catch (err) {
        showToast("error", getErrorMessage(err, "Couldn't check the selected records. Please try again."));
      }
    });

  const confirmDelete = () =>
    guarded(async () => {
      if (!pending) return;
      try {
        const { deleted } = await apiClient.deleteAttendance({ from: date, studentIds: pending.ids });
        setPending(null);
        setSelectedIds(new Set());
        setSelectionMode(false);
        showToast("success", `${deleted} attendance record(s) deleted.`);
        await onDeleted?.();
      } catch (err) {
        showToast("error", getErrorMessage(err, "Couldn't delete the selected records. Please try again."));
      }
    });

  return {
    selectionMode,
    selectedIds,
    allSelected,
    pending,
    busy,
    toggle,
    toggleAll,
    clearSelection: () => setSelectedIds(new Set()),
    toggleMode,
    requestDelete,
    confirmDelete,
    cancelDelete: () => setPending(null),
  };
}

export default useAttendanceDeletion;
