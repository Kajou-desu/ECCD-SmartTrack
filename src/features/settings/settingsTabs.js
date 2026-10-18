import { UserRound, Bell, Lock, Palette, Settings as SettingsIcon, ScrollText, Users } from "lucide-react";
import { ROLES } from "@auth/roles.js";

const TAB = {
  profile: { id: "profile", label: "Profile", icon: UserRound },
  security: { id: "security", label: "Security", icon: Lock },
  notifications: { id: "notifications", label: "Notifications", icon: Bell },
  general: { id: "general", label: "General", icon: Palette },
  account: { id: "account", label: "Account", icon: SettingsIcon },
  children: { id: "children", label: "My Children", icon: Users },
  logs: { id: "logs", label: "Logs", icon: ScrollText },
};

// Which settings each role sees. This only decides what the UI shows; the
// backend enforces the same limits (activity logs, account deletion and
// notification channels are all refused server-side for other roles).
//
// - Notifications: email/SMS/push alerts are sent to parents and guardians
//   only, so staff have nothing to configure.
// - Account (delete my account): Admin only; an Admin removes other accounts.
// - Logs: the Admin activity trail (moved here from its own sidebar page).
const parentTabs = [TAB.profile, TAB.security, TAB.notifications, TAB.general, TAB.children];

const TABS_BY_ROLE = {
  [ROLES.ADMIN]: [TAB.profile, TAB.security, TAB.general, TAB.account, TAB.logs],
  [ROLES.TEACHER]: [TAB.profile, TAB.security, TAB.general],
  [ROLES.PARENT]: parentTabs,
  [ROLES.GUARDIAN]: parentTabs,
};

// An unknown or missing role gets no tabs (default deny).
export function getSettingsTabs(role) {
  return TABS_BY_ROLE[role] ?? [];
}
