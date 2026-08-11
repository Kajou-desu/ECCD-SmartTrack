import { useState } from "react";
import { Bell, Mail, Shield, CalendarDays } from "lucide-react";

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
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-2xl font-bold text-gray-800">
            Notification Settings
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Choose how you'd like to receive notifications and stay informed about
          important updates.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-[#C2570C]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Communication
            </h3>
          </div>
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            <SettingToggle
              label="Email Notifications"
              description="Receive important updates via email"
              checked={settings.emailNotifications}
              onChange={() => handleSettingChange("emailNotifications")}
            />
            <SettingToggle
              label="SMS Notifications"
              description="Receive SMS alerts for urgent matters"
              checked={settings.smsNotifications}
              onChange={() => handleSettingChange("smsNotifications")}
            />
            <SettingToggle
              label="Push Notifications"
              description="Receive notifications on your device"
              checked={settings.pushNotifications}
              onChange={() => handleSettingChange("pushNotifications")}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-[#C2570C]" />
            <h3 className="text-lg font-semibold text-gray-900">System</h3>
          </div>

          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            <SettingToggle
              label="System Alerts"
              description="Get notified about system and maintenance updates"
              checked={settings.systemAlerts}
              onChange={() => handleSettingChange("systemAlerts")}
            />
            <SettingToggle
              label="Activity Updates"
              description="Receive updates about school activities and events"
              checked={settings.activityUpdates}
              onChange={() => handleSettingChange("activityUpdates")}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-5 w-5 text-[#C2570C]" />
            <h3 className="text-lg font-semibold text-gray-900">
              School Activities
            </h3>
          </div>

          <div className="rounded-2xl border border-gray-200">
            <SettingToggle
              label="Security Notifications"
              description="Get alerts about suspicious activity on your account"
              checked={settings.securityNotifications}
              onChange={() => handleSettingChange("securityNotifications")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <label className="flex items-center cursor-pointer">
        <input
        id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          aria-describedby={`${id}-description`}
        />
        <div
          className={`w-12 h-6 rounded-full transition ${
            checked ? "bg-[#C2570C]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition ${
              checked ? "translate-x-6" : "translate-x-0.5"
            } translate-y-0.5`}
          />
        </div>
      </label>
    </div>
  );
}
