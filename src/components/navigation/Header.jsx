import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReminderBanner from "../shared/ReminderBanner";
import NotificationModal from "../shared/NotificationModal";
import Logo from "@assets/ECCDST_Logo.png";
import { useNotifications } from "@hooks/useNotifications";
import { Toast } from "@components/ui/Toast";
import { useAttendanceSession } from "@features/smartAttendance/hooks/useAttendanceSession";
import { CalendarDays, Bell, Play, Pause, Menu } from "lucide-react";

export default function Header({
  reminder,
  isSidebarOpen,
  onOpenSidebar,
  onToggleAttendance,
  mobileMenuButtonRef,
}) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  // Whether attendance is running lives on the server (survives refresh,
  // shared across devices) rather than in local state.
  const {
    isActive: isRecording,
    isLoading: isSessionLoading,
    isToggling,
    start,
    stop,
  } = useAttendanceSession();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  const toggleAttendance = async () => {
    if (isToggling) return;
    const wasRecording = isRecording;
    try {
      if (wasRecording) await stop();
      else await start();
      onToggleAttendance?.(!wasRecording);
    } catch (err) {
      console.error("Failed to toggle attendance session:", err);
      setAttendanceError(
        wasRecording
          ? "Couldn't stop attendance. Please try again."
          : "Couldn't start attendance. Please try again.",
      );
    }
  };

  return (
    <header className="border-b border-slate-200 bg-[#f8f9ff]">
      {/* Reminder Banner - Dismissible and responsive */}
      <ReminderBanner reminder={reminder} />

      {/* Main Header — single flat row */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        {/* Left: Mobile hamburger + spacer */}
        <div className="flex flex-1 items-center gap-2">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onOpenSidebar();
              // Keep focus on the button
              setTimeout(() => {
                mobileMenuButtonRef.current?.focus();
              }, 0);
            }}
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            aria-label="Open navigation"
            className="lg:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          {!isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-12 w-auto" />
              <div>
                <h2 className="text-xl font-bold leading-5 text-[#C2570C]">
                  ECCD
                </h2>
                <p className="text-xs font-semibold uppercase text-[#C2570C]/70">
                  SmartTrack
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Calendar button */}
          <button
            type="button"
            onClick={() => navigate("/calendar")}
            aria-label="Calendar"
            title="Calendar"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 cursor-pointer"
          >
            <CalendarDays aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* Notifications button */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            aria-haspopup="dialog"
            aria-expanded={isNotificationOpen}
            title="Notifications"
            className="relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Divider - Hidden on mobile */}
          <div
            aria-hidden="true"
            className="mx-1 hidden h-6 w-px bg-slate-200 sm:block"
          />

          {/* Attendance button - Icon only on mobile, icon+text on tablet+ */}
          <button
            type="button"
            onClick={toggleAttendance}
            disabled={isSessionLoading || isToggling}
            aria-busy={isToggling}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2.5 font-semibold text-white transition sm:px-3 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-wait disabled:opacity-70 ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                : "bg-[#C2570C] hover:bg-orange-800 focus-visible:ring-[#C2570C]"
            }`}
            title={isRecording ? "Stop Attendance" : "Start Attendance"}
            aria-pressed={isRecording}
          >
            {isRecording ? (
              <Pause aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Play aria-hidden="true" className="h-5 w-5" />
            )}
            <span className="hidden sm:inline text-sm">
              {isRecording ? "Stop Attendance" : "Start Attendance"}
            </span>
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {attendanceError && (
        <Toast
          type="error"
          message={attendanceError}
          onClose={() => setAttendanceError("")}
        />
      )}
    </header>
  );
}
