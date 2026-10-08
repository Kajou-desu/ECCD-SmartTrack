import { useState } from "react";
import { Download } from "lucide-react";
import { apiClient } from "@api/client.js";
import { downloadCsv } from "@utils/exportCsv.js";
import { toDayKey } from "@utils/dateKeys.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";
import { formatTime } from "@features/attendance/utils/attendanceDeparture.js";
import { RANGE_HEADERS, rangeRows } from "@features/attendance/utils/attendanceRange.js";
import { PROFILE_HEADERS, profileRows, profileFilename } from "../utils/studentProfileExport.js";

const ATTENDANCE_DAYS = 90; // the server allows up to 92 days per request

function daysAgoKey(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDayKey(date);
}

// Two exports for one child: the profile (details and contacts) and the
// recent attendance. The server scopes both to students the caller may see.
export default function StudentExportButtons({ student }) {
  const showToast = useToast();
  const [busy, setBusy] = useState(false);

  const exportProfile = () => {
    try {
      downloadCsv(profileFilename(student), PROFILE_HEADERS, profileRows(student));
    } catch (err) {
      console.error("Failed to export student profile:", err);
      showToast("error", "Failed to export the student profile.");
    }
  };

  const exportAttendance = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const to = toDayKey();
      const from = daysAgoKey(ATTENDANCE_DAYS - 1);
      const { records } = await apiClient.getAttendanceRange(from, to, student.id);
      if (!records?.length) {
        showToast("warning", `No attendance was recorded for ${student.name} in the last ${ATTENDANCE_DAYS} days.`);
        return;
      }
      downloadCsv(
        `${profileFilename(student).replace(/\.csv$/, "")}_attendance_${from}_to_${to}.csv`,
        RANGE_HEADERS,
        rangeRows(records, formatTime),
      );
    } catch (err) {
      console.error("Failed to export student attendance:", err);
      showToast("error", getErrorMessage(err, "Failed to export attendance."));
    } finally {
      setBusy(false);
    }
  };

  const buttonClass =
    "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button type="button" onClick={exportProfile} className={buttonClass}>
        <Download size={16} /> Export profile
      </button>
      <button type="button" onClick={exportAttendance} disabled={busy} className={buttonClass}>
        <Download size={16} /> {busy ? "Exporting..." : `Export attendance (last ${ATTENDANCE_DAYS} days)`}
      </button>
    </div>
  );
}
