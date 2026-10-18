import ProfileSettings from "./ProfileSettings.jsx";
import SecuritySettings from "./SecuritySettings.jsx";
import NotificationSettings from "./NotificationSettings.jsx";
import AccountSettings from "./AccountSettings.jsx";
import AppearanceSettings from "./AppearanceSettings.jsx";
import ActivityLogsPanel from "@features/activityLogs/components/ActivityLogsPanel.jsx";
import MyChildrenSettings from "./MyChildrenSettings.jsx";
import { SettingsTabPanel } from "./SettingsTabs.jsx";

const NARROW = "w-full sm:max-w-3xl sm:mx-auto";

const PANELS = {
  profile: { className: "w-full", render: (notify) => <ProfileSettings onNotify={notify} /> },
  security: { className: NARROW, render: (notify) => <SecuritySettings onNotify={notify} /> },
  notifications: { className: "w-full sm:mx-auto", render: () => <NotificationSettings /> },
  general: { className: NARROW, render: () => <AppearanceSettings /> },
  account: { className: NARROW, render: (notify) => <AccountSettings onNotify={notify} /> },
  children: { className: NARROW, render: () => <MyChildrenSettings /> },
  logs: { className: "w-full", render: () => <ActivityLogsPanel /> },
};

// Renders one settings tab. `tabs` is the list the current role is allowed to
// see (getSettingsTabs): a tab outside it renders nothing, so a role can never
// get a panel it wasn't given.
export default function SettingsPanel({ tabs, activeTab, onNotify }) {
  const panel = tabs.some((tab) => tab.id === activeTab) ? PANELS[activeTab] : null;
  if (!panel) return null;
  return (
    <SettingsTabPanel id={activeTab} className={panel.className}>
      {panel.render(onNotify)}
    </SettingsTabPanel>
  );
}
