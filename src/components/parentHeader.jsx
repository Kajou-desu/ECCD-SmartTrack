import ReminderBanner from "../components/reminderBanner.jsx";
import Logo from "../assets/ECCDST_Logo.png";
import { Bell, Menu } from "lucide-react";

export default function ParentHeader({
  reminder,
  isSideBarOpen,
  onOpenSidebar,
}) {

  return (
    <header className="border-b border-slate-200 bg-[#f8f9ff]">
      {/* Reminder Banner - Dismissible and responsive */}
      <ReminderBanner reminder={reminder} />

      {/* Main Header — single flat row */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        {/* Left: Mobile hamburger + spacer */}
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden rounded-lg p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 cursor-pointer"
            aria-expanded={isSideBarOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="h-5 w-5" />
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
        </div>
      </div>
    </header>
  );
}
