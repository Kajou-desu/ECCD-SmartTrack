import { useState } from "react";
import ReminderBanner from "../components/reminderBanner.jsx";
import Logo from "../assets/ECCDST_Logo.png";
import { CalendarDays, Bell, Play, Pause, Menu } from "lucide-react";

export default function Header({
  reminder,
  isSideBarOpen,
  onOpenSidebar,
  mobileMenuButtonRef,
}) {
  const [isRecording, setIsRecording] = useState(false);

  const toggleAttendance = () => {
    setIsRecording((prev) => !prev);
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
            onClick={onOpenSidebar}
            aria-expanded={isSideBarOpen}
            aria-controls="app-sidebar"
            aria-label="Open navigation"
            className="lg:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          {!isSideBarOpen ? (
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
          ) : null}
        </div>

        {/* Right: Action buttons */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Calendar button */}
          <button
            type="button"
            className="rounded-lg p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 cursor-pointer"
            aria-label="Calendar"
            title="Calendar"
          >
            <CalendarDays className="h-5 w-5" />
          </button>

          {/* Notifications button */}
          <button
            type="button"
            className="relative rounded-lg p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 cursor-pointer"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Divider - Hidden on mobile */}
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Attendance button - Icon only on mobile, icon+text on tablet+ */}
          <button
            type="button"
            onClick={toggleAttendance}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2.5 font-semibold text-white transition sm:px-3 sm:gap-2 cursor-pointer ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#C2570C] hover:bg-orange-800"
            }`}
            title={isRecording ? "Stop Attendance" : "Start Attendance"}
          >
            {isRecording ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
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
