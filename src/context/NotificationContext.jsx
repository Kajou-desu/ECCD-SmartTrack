import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationContext } from "./notificationContextObject";
import { useToast } from "@hooks/useToast.js";
import { useAuth } from "@hooks/useAuth.js";
import { apiClient } from "@api/client.js";
import formatRelativeTime from "@utils/formatRelativeTime.js";

function toViewModel(notification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    unread: !notification.isRead,
  };
}

// How often the open app checks for new notifications. Paused automatically
// while the tab is in the background.
const POLL_INTERVAL_MS = 30_000;

async function fetchNotifications() {
  const data = await apiClient.getNotifications();
  return (Array.isArray(data) ? data : []).map(toViewModel);
}

export function NotificationProvider({ children }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  // Keyed per user so one account's notifications can never be served to
  // another on a shared browser, and gated on auth so nothing is requested
  // (and 401'd) from the login screen.
  const userId = user?.id ?? null;
  const queryKey = useMemo(() => ["notifications", userId], [userId]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: fetchNotifications,
    enabled: isAuthenticated && userId !== null,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  // Drop every cached notification the moment the session ends.
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["notifications"] });
    }
  }, [isAuthenticated, queryClient]);

  const notifications = useMemo(() => data ?? [], [data]);

  const error =
    isError && !data
      ? "We couldn't load your notifications. Please try again."
      : null;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  // Optimistic local edit of the cached list.
  // Cancels any in-flight poll first so a stale response can't overwrite it.
  const patchCache = (updater) => {
    queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, (current) => updater(current ?? []));
  };

  // On failure: tell the user, then re-sync with the server's truth rather
  // than restoring a stale snapshot (which could erase notifications that
  // arrived in the meantime).
  const revert = (message) => {
    showToast("error", message);
    queryClient.invalidateQueries({ queryKey });
  };

  const markAsRead = (id) => {
    patchCache((list) =>
      list.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );

    apiClient.markNotificationRead(id).catch((err) => {
      console.error("Failed to mark notification as read", err);
      revert("Couldn't mark the notification as read. Please try again.");
    });
  };

  const markAllAsRead = () => {
    patchCache((list) => list.map((n) => ({ ...n, unread: false })));

    apiClient.markAllNotificationsRead().catch((err) => {
      console.error("Failed to mark all notifications as read", err);
      revert("Couldn't mark notifications as read. Please try again.");
    });
  };

  const clearAllNotifications = () => {
    patchCache(() => []);

    apiClient.dismissAllNotifications().catch((err) => {
      console.error("Failed to clear notifications", err);
      revert("Couldn't clear notifications. Please try again.");
    });
  };

  const removeNotification = (id) => {
    patchCache((list) => list.filter((n) => n.id !== id));

    apiClient.dismissNotification(id).catch((err) => {
      console.error("Failed to dismiss notification", err);
      revert("Couldn't dismiss the notification. Please try again.");
    });
  };

  // Used as the "Retry" action in NotificationModal when the load failed.
  // (Name kept so the modal doesn't need to change.)
  const resetToDefaults = () => {
    refetch();
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    resetToDefaults,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
