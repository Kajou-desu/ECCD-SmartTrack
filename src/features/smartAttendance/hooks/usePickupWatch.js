import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";
import { ATTENDANCE_SESSION_KEY } from "./useAttendanceSession.js";

// Start / Stop automatic pickup. The server owns the state (it decides what the
// pickup job does), so after either call the session status, which carries it,
// is simply re-read.
export function usePickupWatch() {
  const queryClient = useQueryClient();
  const showToast = useToast();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_SESSION_KEY });

  const startMutation = useMutation({
    mutationFn: () => apiClient.startPickupWatch(),
    onSuccess: () => {
      refresh();
      showToast("success", "Automatic pickup started.");
    },
    onError: () => showToast("error", "Couldn't start automatic pickup. Please try again."),
  });

  const stopMutation = useMutation({
    mutationFn: () => apiClient.stopPickupWatch(),
    onSuccess: () => {
      refresh();
      showToast("success", "Automatic pickup stopped.");
    },
    onError: () => showToast("error", "Couldn't stop automatic pickup. Please try again."),
  });

  return {
    isToggling: startMutation.isPending || stopMutation.isPending,
    start: () => startMutation.mutate(),
    stop: () => stopMutation.mutate(),
  };
}

export default usePickupWatch;
