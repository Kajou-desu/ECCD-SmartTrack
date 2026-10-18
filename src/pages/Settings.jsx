import { useState } from "react";
import SettingsPanel from "@features/settings/components/SettingsPanel.jsx";
import { SettingsTabs } from "@features/settings/components/SettingsTabs.jsx";
import { getSettingsTabs } from "@features/settings/settingsTabs.js";
import { isAdmin } from "@auth/permissions.js";
import { useAuth } from "@hooks/useAuth.js";
import { Toast } from "@components/ui/Toast.jsx";
import PageHeader from "@components/shared/PageHeader";

// Settings for staff: an Admin and a Teacher each get their own set of tabs.
export default function AdminSettings() {
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedTab, setSelectedTab] = useState("profile");
  const notify = (type, text) => setMessage({ type, text });
  const clearMessage = () => setMessage({ type: "", text: "" });

  const tabs = getSettingsTabs(user?.role);
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0]?.id;

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <header>
        <PageHeader
          title="Settings"
          subtitle={
            isAdmin(user?.role)
              ? "Manage your admin profile, security, preferences and activity logs"
              : "Manage your profile, security and preferences"
          }
        />
      </header>

      <SettingsTabs tabs={tabs} activeTab={activeTab} onChange={setSelectedTab} />

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
