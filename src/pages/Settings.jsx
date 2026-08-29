import { useState } from "react";
import ProfileSettings from "@features/settings/components/ProfileSettings.jsx";
import SecuritySettings from "@features/settings/components/SecuritySettings.jsx";
import NotificationSettings from "@features/settings/components/NotificationSettings.jsx";
import AccountSettings from "@features/settings/components/AccountSettings.jsx";
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

      <main className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
        <div className="flex flex-wrap justify-center items-center gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
          ${
            activeTab === id
              ? "bg-[#C2570C] text-white shadow-sm"
              : "text-gray-600 hover:bg-orange-50 hover:text-[#C2570C]"
          }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </main>

      {message.text && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={clearMessage}
        />
      )}

      {activeTab === "profile" && (
        <div className="w-full">
          {/* Profile Card */}
          <ProfileSettings onNotify={notify} />
        </div>
      )}

      {activeTab === "security" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Change Password */}
          <SecuritySettings onNotify={notify} />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="w-full sm:mx-auto">
          {/* Notification Settings */}
          <NotificationSettings />
        </div>
      )}

      {activeTab === "account" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Account Information */}
          <AccountSettings accountType="Admin" onNotify={notify} />
        </div>
      )}
    </div>
  );
}
