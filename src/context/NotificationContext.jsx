import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NotificationContext } from "./notificationContextObject";
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

async function fetchNotifications() {
  const data = await apiClient.getNotifications();
  return (Array.isArray(data) ? data : []).map(toViewModel);
}

export function NotificationProvider({ children }) {
  const { data: queryData, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const [notifications, setNotifications] = useState([]);
  const [initialized, setInitialized] = useState(false);

  if (queryData && !initialized) {
    setInitialized(true);
    setNotifications(queryData);
  }

  const error =
    isError && !initialized
      ? "We couldn't load your notifications. Please try again."
      : null;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification,
      ),
    );

    apiClient.markNotificationRead(id).catch((err) => {
      console.error("Failed to mark notification as read", err);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, unread: true } : notification,
        ),
      );
    });
  };

  const markAllAsRead = () => {
    const previous = notifications;
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );

    apiClient.markAllNotificationsRead().catch((err) => {
      console.error("Failed to mark all notifications as read", err);
      setNotifications(previous);
    });
  };

  const clearAllNotifications = () => {
    const previous = notifications;
    setNotifications([]);

    apiClient.dismissAllNotifications().catch((err) => {
      console.error("Failed to clear notifications", err);
      setNotifications(previous);
    });
  };

  const removeNotification = (id) => {
    const previous = notifications;
    setNotifications((current) => current.filter((notification) => notification.id !== id));

    apiClient.dismissNotification(id).catch((err) => {
      console.error("Failed to dismiss notification", err);
      setNotifications(previous);
    });
  };

  // Also used as the "Retry" action in NotificationModal when the initial
  // load failed — despite the name, this refetches from the server rather
  // than resetting to any hardcoded defaults (there aren't any anymore).
  const resetToDefaults = () => {
    setInitialized(false);
    refetch();
  };

  const value = {
    notifications,
    unreadCount,
    isLoading: isLoading && !initialized,
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
