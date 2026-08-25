import { useEffect } from "react";
import { Bell, CheckCheck, X } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Attendance completed",
    message: "Today's attendance has been recorded successfully.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    title: "New student registered",
    message: "A new student has been added to your class.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "System reminder",
    message: "Please review today's attendance records.",
    time: "Yesterday",
    unread: false,
  },
];

export default function NotificationModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="notification-title"
                className="text-lg font-bold text-slate-900"
              >
                Notifications
              </h2>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Stay updated with your latest activity
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <span className="text-sm font-medium text-slate-600">
            Recent notifications
          </span>

          {unreadCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C2570C] transition-colors hover:text-orange-800 focus-visible:outline-none focus-visible:underline"
            >
              <CheckCheck aria-hidden="true" className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C2570C] sm:px-5 ${
                    notification.unread ? "bg-orange-50/50" : ""
                  }`}
                >
                  <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#C2570C]">
                    <Bell aria-hidden="true" className="h-5 w-5" />

                    {notification.unread && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          notification.unread
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {notification.time}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {notification.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell aria-hidden="true" className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No notifications
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                You're all caught up. New notifications will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
