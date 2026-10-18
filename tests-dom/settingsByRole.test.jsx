import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { AuthContext } from "@context/authContextObject.js";
import { getSettingsTabs } from "@features/settings/settingsTabs.js";

vi.mock("@features/settings/components/ProfileSettings.jsx", () => ({ default: () => <div>profile-panel</div> }));
vi.mock("@features/settings/components/SecuritySettings.jsx", () => ({ default: () => <div>security-panel</div> }));
vi.mock("@features/settings/components/NotificationSettings.jsx", () => ({ default: () => <div>notifications-panel</div> }));
vi.mock("@features/settings/components/AccountSettings.jsx", () => ({ default: () => <div>account-panel</div> }));
vi.mock("@features/settings/components/AppearanceSettings.jsx", () => ({ default: () => <div>general-panel</div> }));
vi.mock("@features/settings/components/MyChildrenSettings.jsx", () => ({ default: () => <div>children-panel</div> }));
vi.mock("@features/activityLogs/components/ActivityLogsPanel.jsx", () => ({ default: () => <div>logs-panel</div> }));

const { default: SettingsPanel } = await import("@features/settings/components/SettingsPanel.jsx");
const { default: Settings } = await import("@pages/Settings.jsx");
const { default: ParentSettings } = await import("@pages/parentPortal/ParentSettings.jsx");

const ids = (role) => getSettingsTabs(role).map((tab) => tab.id);
const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent);

const renderAs = (role, ui) =>
  render(<AuthContext.Provider value={{ user: { role } }}>{ui}</AuthContext.Provider>);

afterEach(cleanup);

describe("getSettingsTabs", () => {
  it("gives each role its own set", () => {
    expect(ids("Admin")).toEqual(["profile", "security", "general", "account", "logs"]);
    expect(ids("Teacher")).toEqual(["profile", "security", "general"]);
    expect(ids("Parent")).toEqual(["profile", "security", "notifications", "general", "children"]);
    expect(ids("Guardian")).toEqual(ids("Parent"));
  });

  it("only the Admin sees logs and account deletion", () => {
    for (const role of ["Teacher", "Parent", "Guardian"]) {
      expect(ids(role)).not.toContain("logs");
      expect(ids(role)).not.toContain("account");
    }
  });

  it("staff have no notification channel settings", () => {
    expect(ids("Admin")).not.toContain("notifications");
    expect(ids("Teacher")).not.toContain("notifications");
  });

  it("denies an unknown or missing role", () => {
    expect(getSettingsTabs("Janitor")).toEqual([]);
    expect(getSettingsTabs(undefined)).toEqual([]);
  });
});

describe("SettingsPanel", () => {
  it("renders an allowed tab", () => {
    render(<SettingsPanel tabs={getSettingsTabs("Admin")} activeTab="logs" onNotify={() => {}} />);
    expect(screen.getByText("logs-panel")).toBeTruthy();
  });

  it.each(["logs", "account"])("renders nothing for %s when the role doesn't have it", (tab) => {
    const { container } = render(<SettingsPanel tabs={getSettingsTabs("Teacher")} activeTab={tab} onNotify={() => {}} />);
    expect(container.textContent).toBe("");
  });
});

describe("Settings pages", () => {
  it("shows an Admin the Logs tab and opens the activity logs in it", () => {
    renderAs("Admin", <Settings />);
    expect(tabNames()).toEqual(["Profile", "Security", "General", "Account", "Logs"]);
    fireEvent.click(screen.getByRole("tab", { name: "Logs" }));
    expect(screen.getByText("logs-panel")).toBeTruthy();
  });

  it("gives a Teacher only Profile, Security and General", () => {
    renderAs("Teacher", <Settings />);
    expect(tabNames()).toEqual(["Profile", "Security", "General"]);
  });

  it("gives a Guardian notifications and their children, but no account deletion or logs", () => {
    renderAs("Guardian", <ParentSettings />);
    expect(tabNames()).toEqual(["Profile", "Security", "Notifications", "General", "My Children"]);
    fireEvent.click(screen.getByRole("tab", { name: "My Children" }));
    expect(screen.getByText("children-panel")).toBeTruthy();
  });

  it("shows no tabs and no panel for an unknown role", () => {
    const { container } = renderAs("Janitor", <Settings />);
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(container.textContent).not.toContain("-panel");
  });
});
