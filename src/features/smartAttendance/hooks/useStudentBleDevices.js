import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

const keyFor = (studentId) => ["studentBleDevices", studentId];

export function useStudentBleDevices(studentId) {
  const queryClient = useQueryClient();
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
  });
  const toggle = useMutation({
    mutationFn: ({ deviceId, enabled }) => apiClient.setStudentBleDeviceEnabled(studentId, deviceId, enabled),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (deviceId) => apiClient.removeStudentBleDevice(studentId, deviceId),
    onSuccess: refresh,
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
