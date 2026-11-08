import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";
import { normalizeTransfers } from "../utils/transfers.js";

export const TRANSFERS_KEY = ["studentTransfers"];

// A move changes who sees the student and what their pages show, so refresh all of it.
const REFRESH = [TRANSFERS_KEY, ["students"], ["studentProfile"], ["attendance"], ["attendanceRange"], ["dashboardStats"]];
export const refreshAfterTransfer = (queryClient) =>
  Promise.all(REFRESH.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

// The pending requests waiting for me and the ones I asked for.
export function useStudentTransfers() {
  return useQuery({
    queryKey: TRANSFERS_KEY,
    queryFn: async () => normalizeTransfers(await apiClient.getStudentTransfers()),
    refetchInterval: 60_000, // a request from a teacher at another center shows up without a reload
  });
}

const MESSAGES = {
  accept: "Transfer accepted. The student is now yours.",
  decline: "Transfer declined.",
  cancel: "Transfer cancelled.",
};

// Accept / decline / cancel one request. The server checks that it is yours to answer.
export function useAnswerTransfer() {
  const queryClient = useQueryClient();
  const showToast = useToast();
  return useMutation({
    mutationFn: ({ id, action }) => apiClient.answerStudentTransfer(id, action),
    onSuccess: (_data, { action }) => showToast("success", MESSAGES[action]),
    onError: (err) => showToast("error", getErrorMessage(err, "Couldn't update the transfer. Please try again.")),
    onSettled: () => refreshAfterTransfer(queryClient),
  });
}
