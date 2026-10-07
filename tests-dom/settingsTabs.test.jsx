import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { UserRound, Lock } from "lucide-react";
import { SettingsTabs, SettingsTabPanel } from "@features/settings/components/SettingsTabs.jsx";

afterEach(cleanup);

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: Lock },
];

function Harness() {
  const [active, setActive] = useState("profile");
  return (
    <>
      <SettingsTabs tabs={tabs} activeTab={active} onChange={setActive} />
      <SettingsTabPanel id={active}>content-{active}</SettingsTabPanel>
    </>
  );
}

describe("SettingsTabs", () => {
  it("exposes tablist/tab/tabpanel semantics and switches tabs", () => {
    render(<Harness />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    const profile = screen.getByRole("tab", { name: "Profile" });
    const security = screen.getByRole("tab", { name: "Security" });
    expect(profile.getAttribute("aria-selected")).toBe("true");
    expect(security.getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(profile.id);
    expect(profile.getAttribute("aria-controls")).toBe(screen.getByRole("tabpanel").id);

    fireEvent.click(security);
    expect(security.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(security.id);
    expect(screen.getByText("content-security")).toBeTruthy();
  });
});
