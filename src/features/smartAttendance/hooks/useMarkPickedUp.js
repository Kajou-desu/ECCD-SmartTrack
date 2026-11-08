import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";

// "Mark Picked Up" in the Present Students table. The server decides who may do
// this (a teacher for their own center's students, an Admin for any) and tells
// the parents; here we only refresh what the change touches. `busyIds` stops a
// second press on the same row while its request is in flight.
export function useMarkPickedUp() {
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
    mutationFn: ({ studentId }) => apiClient.markPickedUp(studentId),
    onMutate: ({ studentId }) => setBusy(studentId, true),
    onSuccess: (_data, { name }) => showToast("success", `${name} was marked picked up.`),
    onError: (err) => showToast("error", getErrorMessage(err, "Couldn't mark the student picked up. Please try again.")),
    onSettled: (_data, _err, { studentId }) => {
      setBusy(studentId, false);
      queryClient.invalidateQueries({ queryKey: ["attendanceMonitor"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  return {
    busyIds,
    markPickedUp: (student) => {
      if (busyIds.has(student.studentId)) return;
      mutation.mutate({ studentId: student.studentId, name: student.name });
    },
  };
}

export default useMarkPickedUp;
