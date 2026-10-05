import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

// Stand-ins that report through the onNotify prop the way the real forms do.
vi.mock("@features/settings/components/ProfileSettings.jsx", () => ({
  default: ({ onNotify }) => (
    <button type="button" onClick={() => onNotify?.("success", "Profile updated successfully.")}>
      save-profile
    </button>
  ),
}));
vi.mock("@features/settings/components/SecuritySettings.jsx", () => ({
  default: ({ onNotify }) => (
    <button type="button" onClick={() => onNotify?.("error", "Failed to update password.")}>
      save-password
    </button>
  ),
}));
vi.mock("@features/settings/components/NotificationSettings.jsx", () => ({ default: () => null }));
vi.mock("@features/settings/components/AccountSettings.jsx", () => ({ default: () => null }));

const { default: ParentSettings } = await import("@pages/parentPortal/ParentSettings.jsx");

afterEach(cleanup);

describe("ParentSettings feedback", () => {
  it("shows a profile save result to the parent", () => {
    render(<ParentSettings />);
    fireEvent.click(screen.getByRole("button", { name: "save-profile" }));
    expect(screen.getByText("Profile updated successfully.")).toBeTruthy();
  });

  it("shows a password change error to the parent", () => {
    render(<ParentSettings />);
    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    fireEvent.click(screen.getByRole("button", { name: "save-password" }));
    expect(screen.getByText("Failed to update password.")).toBeTruthy();
  });
});
