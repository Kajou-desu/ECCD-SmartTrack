import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";

// "Still here" in the Present Students table. The server restarts the unseen
// clock (and decides who may); here we only refresh the monitor so the row goes
// back to Inside. `busyIds` stops a second press while the request is in flight.
export function useStillHere() {
  const queryClient = useQueryClient();
  const showToast = useToast();
  const [busyIds, setBusyIds] = useState(() => new Set());

  const setBusy = (id, busy) =>
    setBusyIds((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });

  const mutation = useMutation({
    mutationFn: ({ studentId }) => apiClient.markStillHere(studentId),
    onMutate: ({ studentId }) => setBusy(studentId, true),
    onSuccess: (_data, { name }) => showToast("success", `${name} is marked as still here.`),
    onError: (err) => showToast("error", getErrorMessage(err, "Couldn't update the student. Please try again.")),
    onSettled: (_data, _err, { studentId }) => {
      setBusy(studentId, false);
      queryClient.invalidateQueries({ queryKey: ["attendanceMonitor"] });
    },
  });

  return {
    busyIds,
    markStillHere: (student) => {
      if (busyIds.has(student.studentId)) return;
      mutation.mutate({ studentId: student.studentId, name: student.name });
    },
  };
}

export default useStillHere;
