import { useState } from "react";
import SettingToggle from "../../../components/ui/SettingToggle";
import { Bell, CalendarDays, Mail, Shield } from "lucide-react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
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
          <SettingToggle
            id="email-notifications"
            label="Email Notifications"
            description="Receive important updates via email"
            checked={settings.emailNotifications}
            onChange={() => handleSettingChange("emailNotifications")}
          />

          <SettingToggle
            id="sms-notifications"
            label="SMS Notifications"
            description="Receive SMS alerts for urgent matters"
            checked={settings.smsNotifications}
            onChange={() => handleSettingChange("smsNotifications")}
          />

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
