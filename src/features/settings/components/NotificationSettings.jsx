import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SettingToggle from "../../../components/ui/SettingToggle";
import { Bell, CalendarDays, Mail, Shield } from "lucide-react";
import { apiClient } from "@api/client.js";
import { useAuth } from "@hooks/useAuth.js";
import { useToast } from "@hooks/useToast.js";

export default function NotificationSettings() {
  // Email and SMS are saved on the server (they decide what the backend
  // actually sends). The toggles below are still local-only for now.
  const [settings, setSettings] = useState({
    pushNotifications: true,
    systemAlerts: true,
    activityUpdates: true,
    securityNotifications: true,
  });

  const handleSettingChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showToast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Under the "notifications" prefix so NotificationContext's logout cleanup
  // clears it too, and keyed per user so accounts never share a cached value.
  const queryKey = ["notifications", "preferences", userId];

  const {
    data: prefs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => apiClient.getNotificationPreferences(),
    enabled: userId !== null,
  });

  const updatePreference = useMutation({
    mutationFn: (change) => apiClient.updateNotificationPreferences(change),
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (current) => ({ ...current, ...change }));
    },
    // Re-sync from the server rather than restoring a snapshot, so a failed
    // save can never leave the switch showing something the server doesn't have.
    onError: (err) => {
      console.error("Failed to update notification preferences", err);
      showToast("error", "Couldn't save your notification settings. Please try again.");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handlePreferenceChange = (key) => {
    updatePreference.mutate({ [key]: !prefs[key] });
  };

  return (
    <div
      className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm
        sm:p-6 lg:p-8"
    >
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[#C2570C]" />

          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Notification Settings
          </h2>
        </div>

        <p className="text-sm text-gray-600">
          Choose how you'd like to receive notifications and stay informed about
          important updates.
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-6
          md:grid-cols-2 xl:grid-cols-3"
      >
        <SettingsSection icon={Mail} title="Communication">
          {isLoading ? (
            <p className="bg-gray-50 px-4 py-4 text-sm text-gray-500">
              Loading your notification settings…
            </p>
          ) : isError || !prefs ? (
            <div className="bg-gray-50 px-4 py-4 text-sm text-gray-600">
              <p>We couldn't load your notification settings.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 font-medium text-[#C2570C] underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <SettingToggle
                id="email-notifications"
                label="Email Notifications"
                description="Receive arrival and departure alerts via email"
                checked={prefs.notifyByEmail}
                onChange={() => handlePreferenceChange("notifyByEmail")}
              />

              <SettingToggle
                id="sms-notifications"
                label="SMS Notifications"
                description="Receive arrival and departure alerts by text message"
                checked={prefs.notifyBySms}
                onChange={() => handlePreferenceChange("notifyBySms")}
              />
            </>
          )}

          <SettingToggle
            id="push-notifications"
            label="Push Notifications"
            description="Receive notifications on your device"
            checked={settings.pushNotifications}
            onChange={() => handleSettingChange("pushNotifications")}
          />
        </SettingsSection>

        <SettingsSection icon={Shield} title="System">
          <SettingToggle
            id="system-alerts"
            label="System Alerts"
            description="Get notified about system and maintenance updates"
            checked={settings.systemAlerts}
            onChange={() => handleSettingChange("systemAlerts")}
          />

          <SettingToggle
            id="activity-updates"
            label="Activity Updates"
            description="Receive updates about school activities and events"
            checked={settings.activityUpdates}
            onChange={() => handleSettingChange("activityUpdates")}
          />
        </SettingsSection>

        <SettingsSection icon={CalendarDays} title="School Activities">
          <SettingToggle
            id="security-notifications"
            label="Security Notifications"
            description="Get alerts about suspicious activity on your account"
            checked={settings.securityNotifications}
            onChange={() => handleSettingChange("securityNotifications")}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-[#C2570C]" />

        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-gray-200
          divide-y divide-gray-100"
      >
        {children}
      </div>
    </section>
  );
}
