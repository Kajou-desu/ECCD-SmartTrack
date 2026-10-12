import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, DoorOpen } from "lucide-react";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";
import formatStudentName from "@utils/formatStudentName.js";
import { ATTENDANCE_SESSION_KEY, useAttendanceSession } from "../hooks/useAttendanceSession.js";
import { PICKUP_TICK_MS, secondsLeft, shouldShowPickupBanner, visibleChecks } from "../utils/pickupChecks.js";

// Automatic pickup, teacher's side. When neither a student's face nor their tag
// has been seen for a minute, the server asks "is this student still in the
// center?" for 15 seconds. The prompts arrive with the session status the
// header already polls, so this adds no extra requests. In-app only, by design.
export default function PickupCheckPrompt() {
  const { isActive, pickupChecks, pickupWindow, receivedAt } = useAttendanceSession();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const [now, setNow] = useState(() => Date.now());
  const [answeredIds, setAnsweredIds] = useState(() => new Set());

  // Count down only while there is something to count.
  const hasChecks = pickupChecks.length > 0;
  useEffect(() => {
    if (!hasChecks) return undefined;
    const timer = setInterval(() => setNow(Date.now()), PICKUP_TICK_MS);
    return () => clearInterval(timer);
  }, [hasChecks]);

  const answer = useMutation({
    mutationFn: ({ id, stillHere }) => apiClient.answerPickupCheck(id, stillHere),
    onMutate: ({ id }) => setAnsweredIds((prev) => new Set(prev).add(id)),
    onSuccess: (_data, { stillHere, name }) => {
      showToast("success", stillHere ? `${name} is still here.` : `${name} was marked picked up.`);
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SESSION_KEY });
      if (!stillHere) {
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      }
    },
    onError: () => showToast("error", "That check had already ended. Please look at the attendance list."),
  });

  // `now` may predate the data (it only ticks while prompts exist), so never let
  // it run behind the moment the prompts were fetched.
  const clock = Math.max(now, receivedAt);
  const checks = visibleChecks(pickupChecks, receivedAt, clock, answeredIds);
  const showBanner = shouldShowPickupBanner({ isActive, pickupActive: pickupWindow.active, pathname });

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 p-4 sm:items-end"
    >
      {showBanner && (
        <p
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 shadow-lg"
        >
          <Camera aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Pickup tracking is on, but it needs the camera.{" "}
            <Link to="/attendance/live" className="font-semibold underline">
              Open Live attendance
            </Link>{" "}
            and keep it open.
          </span>
        </p>
      )}

      {checks.map((check) => {
        const name = formatStudentName(check.name);
        return (
          <section
            key={check.id}
            aria-label={`Is ${name} still in the center?`}
            className="pointer-events-auto w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h2 className="text-base font-semibold text-slate-800">Is {name} still in the center?</h2>
            <p className="mt-1 text-sm text-slate-600">Neither their face nor their tag has been seen for a while.</p>
            <p className="mt-1 text-xs text-slate-500">Closes in {secondsLeft(check, receivedAt, clock)} s</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={answer.isPending}
                onClick={() => answer.mutate({ id: check.id, stillHere: true, name })}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check aria-hidden="true" className="h-4 w-4" />
                Yes, still here
              </button>
              <button
                type="button"
                disabled={answer.isPending}
                onClick={() => answer.mutate({ id: check.id, stillHere: false, name })}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DoorOpen aria-hidden="true" className="h-4 w-4" />
                No, picked up
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
