import { useState } from "react";
import ReminderBanner from "../../components/shared/ReminderBanner";
import Logo from "../../assets/ECCDST_Logo.png";
import { CalendarDays, Bell, Play, Pause, Menu } from "lucide-react";

export default function Header({
  reminder,
  isSidebarOpen,
  onOpenSidebar,
  onToggleAttendance,
  mobileMenuButtonRef,
}) {
  const [isRecording, setIsRecording] = useState(false);

  const toggleAttendance = () => {
    setIsRecording((prev) => !prev);
    onToggleAttendance?.(!isRecording);
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
            aria-label="Calendar"
            title="Calendar"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 cursor-pointer"
          >
            <CalendarDays aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* Notifications button */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 cursor-pointer"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            />
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
            className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2.5 font-semibold text-white transition sm:px-3 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${
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
    </header>
  );
}
