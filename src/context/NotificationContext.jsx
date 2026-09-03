import { useEffect, useMemo, useState } from "react";
import { NotificationContext } from "./notificationContextObject";

const STORAGE_KEY = "eccd-smarttrack-notifications";

const defaultNotifications = [
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

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(STORAGE_KEY);

      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);

        if (Array.isArray(parsedNotifications)) {
          setNotifications(parsedNotifications);
        } else {
          throw new Error("Stored notifications are not valid");
        }
      } else {
        setNotifications(defaultNotifications);
      }
    } catch (loadError) {
      console.error("Failed to load notifications", loadError);
      setError("We couldn't load your notifications. Showing the latest defaults instead.");
      setNotifications(defaultNotifications);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      setError(null);
    } catch (storageError) {
      console.error("Failed to persist notifications", storageError);
      setError("Your notification changes could not be saved locally.");
    }
  }, [notifications, isLoading]);

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
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  const resetToDefaults = () => {
    setNotifications(defaultNotifications);
    setError(null);
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
