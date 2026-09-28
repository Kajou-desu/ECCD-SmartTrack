import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";

const keyFor = (studentId) => ["studentBleDevices", studentId];

export function useStudentBleDevices(studentId) {
  const queryClient = useQueryClient();
  const showToast = useToast();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keyFor(studentId) });

  const query = useQuery({
    queryKey: keyFor(studentId),
    queryFn: async () => {
      const devices = await apiClient.getStudentBleDevices(studentId);
      return Array.isArray(devices) ? devices : [];
    },
  });

  const add = useMutation({
    mutationFn: (deviceIdentifier) => apiClient.addStudentBleDevice(studentId, deviceIdentifier),
    onSuccess: refresh,
    onSettled: (_data, error) => {
      if (error) showToast("error", error.message || "Couldn't add the attendance tag.");
      else showToast("success", "Attendance tag added.");
    },
  });
  const toggle = useMutation({
    mutationFn: ({ deviceId, enabled }) => apiClient.setStudentBleDeviceEnabled(studentId, deviceId, enabled),
    onSuccess: refresh,
    onSettled: (_data, error, variables) => {
      if (error) {
        showToast("error", error.message || "Couldn't update the attendance tag.");
      } else {
        showToast("success", `Attendance tag ${variables.enabled ? "resumed" : "paused"}.`);
      }
    },
  });
  const remove = useMutation({
    mutationFn: (deviceId) => apiClient.removeStudentBleDevice(studentId, deviceId),
    onSuccess: refresh,
    onSettled: (_data, error) => {
      if (error) showToast("error", error.message || "Couldn't remove the attendance tag.");
      else showToast("success", "Attendance tag removed.");
    },
  });

  return {
    devices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    add,
    toggle,
    remove,
    isBusy: add.isPending || toggle.isPending || remove.isPending,
  };
}

export default useStudentBleDevices;
