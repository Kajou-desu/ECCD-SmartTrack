import { Link, useLocation } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAttendanceSession } from "../hooks/useAttendanceSession.js";
import { shouldShowPickupBanner } from "../utils/pickupChecks.js";

// Automatic pickup only works while the Live attendance page streams the
// camera, so on every other page a running session shows this reminder. It is
// the only message left of the old pickup pop-ups: who is still inside, who is
// not detected and who was picked up is now the table on the Live attendance page.
export default function PickupTrackingBanner() {
  const { isActive, pickupWindow } = useAttendanceSession();
  const { pathname } = useLocation();

  if (!shouldShowPickupBanner({ isActive, pickupActive: pickupWindow.active, pathname })) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 p-4 sm:items-end">
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
    </div>
  );
}
