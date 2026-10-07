import { useState } from "react";
import ProfileSettings from "@features/settings/components/ProfileSettings.jsx";
import SecuritySettings from "@features/settings/components/SecuritySettings.jsx";
import NotificationSettings from "@features/settings/components/NotificationSettings.jsx";
import AccountSettings from "@features/settings/components/AccountSettings.jsx";
import { SettingsTabs, SettingsTabPanel } from "@features/settings/components/SettingsTabs.jsx";
import { Toast } from "@components/ui/Toast.jsx";
import PageHeader from "@components/shared/PageHeader";
import { UserRound, Bell, Lock, Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const notify = (type, text) => setMessage({ type, text });
  const clearMessage = () => setMessage({ type: "", text: "" });

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
    },
    {
      id: "security",
      label: "Security",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "account",
      label: "Account",
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <header>
        <PageHeader
          title="Settings"
          subtitle="Manage your admin profile, preferences and security"
        />
      </header>

      <SettingsTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {message.text && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={clearMessage}
        />
      )}

      {activeTab === "profile" && (
        <SettingsTabPanel id="profile" className="w-full">
          {/* Profile Card */}
          <ProfileSettings onNotify={notify} />
        </SettingsTabPanel>
      )}

      {activeTab === "security" && (
        <SettingsTabPanel id="security" className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Change Password */}
          <SecuritySettings onNotify={notify} />
        </SettingsTabPanel>
      )}

      {activeTab === "notifications" && (
        <SettingsTabPanel id="notifications" className="w-full sm:mx-auto">
          {/* Notification Settings */}
          <NotificationSettings />
        </SettingsTabPanel>
      )}

      {activeTab === "account" && (
        <SettingsTabPanel id="account" className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Account Information */}
          <AccountSettings onNotify={notify} />
        </SettingsTabPanel>
      )}
    </div>
  );
}
