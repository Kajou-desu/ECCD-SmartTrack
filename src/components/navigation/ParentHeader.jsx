import { useState } from "react";
import NotificationModal from "@components/shared/NotificationModal";
import ReminderBanner from "../shared/ReminderBanner";
import ChildSelectorDropdown from "./ChildSelectorDropdown";
import Logo from "@assets/ECCDST_Logo.png";
import { Bell, Menu } from "lucide-react";

export default function ParentHeader({
  reminder,
  isSidebarOpen,
  onOpenSidebar,
  mobileMenuButtonRef,
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-[#f8f9ff]">
      {/* Reminder Banner */}
      <ReminderBanner reminder={reminder} />

      {/* Main Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        {/* Left */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Mobile menu */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={onOpenSidebar}
            aria-expanded={isSidebarOpen}
            aria-controls="parent-sidebar"
            aria-label="Open navigation"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#C2570C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* Header logo
              Hidden while mobile sidebar is open */}
          {!isSidebarOpen && (
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={Logo}
                alt="ECCD SmartTrack"
                className="h-12 w-auto shrink-0"
              />

              <div className="min-w-0">
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

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Child selector - lets a parent with multiple enrolled children switch context */}
          <ChildSelectorDropdown />

          <div
            aria-hidden="true"
            className="mx-1 hidden h-6 w-px bg-slate-200 sm:block"
          />

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={isNotificationOpen}
            title="Notifications"
            className="cursor-pointer relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#C2570C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />

            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            />
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  );
}
