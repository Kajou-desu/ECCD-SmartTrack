import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useAttendanceSession } from "@features/smartAttendance/hooks/useAttendanceSession";
import { useAttendanceMonitor } from "@features/smartAttendance/hooks/useAttendanceMonitor";
import { useFaceRecognition } from "@features/smartAttendance/hooks/useFaceRecognition";
import AttendanceCamera from "@features/smartAttendance/components/AttendanceCamera";
import AttendanceStatusBar from "@features/smartAttendance/components/AttendanceStatusBar";
import AttendanceStudentList from "@features/smartAttendance/components/AttendanceStudentList";
import { describeStopReason } from "@features/smartAttendance/utils/attendanceMonitor.js";
import ErrorMsg from "@components/ui/ErrorMsg";

function formatSessionDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(date);
}

export default function AttendanceLive() {
  const { isActive, isLoading: isSessionLoading } = useAttendanceSession();
  const { monitor, isError } = useAttendanceMonitor(isActive);
  // Spoken to screen-reader users when the camera verifies someone.
  const [announcement, setAnnouncement] = useState("");
  const camera = useFaceRecognition({
    onVerified: (verified) => setAnnouncement(`${verified.map((v) => v.name).join(", ")} marked present`),
  });

  // The camera must never outlive the session. When attendance stops (here or
  // on another device) this page swaps to the "isn't running" view and the
  // <video> element goes away, so the loop could no longer send frames or hear
  // "session ended" from the server — turn the camera off directly instead.
  const { status: cameraStatus, stop: stopCamera } = camera;
  useEffect(() => {
    if (!isSessionLoading && !isActive && cameraStatus !== "off") {
      stopCamera(describeStopReason("session-ended"));
    }
  }, [isSessionLoading, isActive, cameraStatus, stopCamera]);

  const sessionDate = useMemo(() => formatSessionDate(monitor?.session?.date), [monitor?.session?.date]);

  const header = (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Live attendance</h1>
        {sessionDate && <p className="mt-1 text-sm text-gray-600">{sessionDate}</p>}
      </div>
      <Link
        to="/attendance"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
      >
        <ClipboardList aria-hidden="true" className="h-5 w-5" />
        Mark by hand
      </Link>
    </header>
  );

  if (isSessionLoading) {
    return (
      <div className="space-y-6">
        {header}
        <p role="status" className="text-sm text-gray-500">Checking attendance…</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="space-y-6 p-6">
        {header}
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Attendance isn't running</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Press Start Attendance in the top bar. Then turn on a camera facing the door, and students are marked
            present when both their face and their tag are seen.
          </p>
          {camera.message && (
            <div className="mx-auto mt-4 max-w-md">
              <ErrorMsg message={camera.message} onClose={camera.dismissMessage} />
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {header}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

      {isError && <ErrorMsg message="Live results couldn't be loaded. Retrying." onClose={() => {}} />}

      <AttendanceStatusBar
        cameraStatus={camera.status}
        recognitionAvailable={monitor?.recognitionAvailable ?? false}
        gatewayOnline={monitor?.gatewayOnline ?? false}
      />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AttendanceCamera camera={camera} />
        <AttendanceStudentList students={monitor?.students} counts={monitor?.counts} />
      </div>
    </div>
  );
}
