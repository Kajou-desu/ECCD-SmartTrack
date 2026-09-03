import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@hooks/useNotifications";
import { Bell, CheckCheck, RefreshCcw, Trash2, X } from "lucide-react";

export default function NotificationModal({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    resetToDefaults,
  } = useNotifications();
  const [filter, setFilter] = useState("all");

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

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => notification.unread);
    }

    return notifications;
  }, [filter, notifications]);

  if (!isOpen) return null;

  const hasNotifications = notifications.length > 0;
  const hasVisibleNotifications = filteredNotifications.length > 0;

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
        aria-live="polite"
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
              {unreadCount > 0
                ? "Stay updated with your latest activity"
                : "You are all caught up"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3 text-sm text-amber-800">
              <p className="flex-1">{error}</p>

              <button
                type="button"
                onClick={resetToDefaults}
                className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-700 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <RefreshCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] ${
                  filter === option.value
                    ? "bg-[#C2570C] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                aria-pressed={filter === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          {hasNotifications && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#C2570C] transition-colors hover:text-orange-800 focus-visible:outline-none focus-visible:underline"
                >
                  <CheckCheck aria-hidden="true" className="h-4 w-4" />
                  Mark all as read
                </button>
              )}

              <button
                type="button"
                onClick={clearAllNotifications}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:underline"
                aria-label="Clear all notifications"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 px-4 py-4 sm:px-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : hasVisibleNotifications ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex w-full items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5 ${
                    notification.unread ? "bg-orange-50/50" : "opacity-80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="flex min-w-0 flex-1 gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C2570C]"
                    aria-label={
                      notification.unread
                        ? `Mark ${notification.title} as read`
                        : `${notification.title} is already read`
                    }
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
                        <div className="flex min-w-0 items-center gap-2">
                          <h3
                            className={`text-sm ${
                              notification.unread
                                ? "font-semibold text-slate-900"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {!notification.unread && (
                            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              Read
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-[11px] text-slate-400">
                          {notification.time}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeNotification(notification.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
                    aria-label={`Dismiss ${notification.title}`}
                    title="Dismiss notification"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell aria-hidden="true" className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {filter === "unread" ? "No unread notifications" : "No notifications"}
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                {filter === "unread"
                  ? "You're all caught up. There are no unread messages right now."
                  : "You're all caught up. New notifications will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
