import { useState } from "react";
import SettingsPanel from "@features/settings/components/SettingsPanel.jsx";
import { SettingsTabs } from "@features/settings/components/SettingsTabs.jsx";
import { getSettingsTabs } from "@features/settings/settingsTabs.js";
import { useAuth } from "@hooks/useAuth.js";
import { Toast } from "@components/ui/Toast.jsx";

export default function ParentSettings() {
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedTab, setSelectedTab] = useState("profile");
  const notify = (type, text) => setMessage({ type, text });
  const clearMessage = () => setMessage({ type: "", text: "" });

  const tabs = getSettingsTabs(user?.role);
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0]?.id;

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your profile, security, notifications and children
        </p>
      </div>

      <SettingsTabs tabs={tabs} activeTab={activeTab} onChange={setSelectedTab} />

      {/* Message Toast */}
      {message.text && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={clearMessage}
        />
      )}

      <SettingsPanel tabs={tabs} activeTab={activeTab} onNotify={notify} />
    </div>
  );
}
