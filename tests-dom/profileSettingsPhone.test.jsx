import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

let mockUser;
vi.mock("../src/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: mockUser, updateUser: vi.fn() }),
}));
vi.mock("@api/client.js", () => ({ apiClient: { put: vi.fn(), post: vi.fn() } }));

const { default: ProfileSettings } = await import("@features/settings/components/ProfileSettings.jsx");

afterEach(cleanup);

function renderEditing(role) {
  mockUser = { firstName: "Maria", middleName: "", lastName: "Cruz", email: "m@example.com", phone: "", role };
  render(<ProfileSettings onNotify={() => {}} />);
  // The form is behind an edit toggle.
  fireEvent.click(screen.getByRole("button", { name: /edit/i }));
}

describe("ProfileSettings phone hint", () => {
  it.each(["Parent", "Guardian"])("shows the PH mobile hint to a %s", (role) => {
    renderEditing(role);

    expect(screen.getByText(/Philippine mobile number/)).toBeTruthy();
    expect(screen.getByLabelText("Phone").getAttribute("aria-describedby")).toBe("profile-phone-hint");
  });

  it.each(["Teacher", "Admin"])("does not show it to a %s", (role) => {
    renderEditing(role);

    expect(screen.queryByText(/Philippine mobile number/)).toBeNull();
    expect(screen.getByLabelText("Phone").hasAttribute("aria-describedby")).toBe(false);
  });
});
