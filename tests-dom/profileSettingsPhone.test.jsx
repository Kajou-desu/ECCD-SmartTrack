import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

let mockUser;
vi.mock("../src/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: mockUser, updateUser: vi.fn() }),
}));
const updateMyProfile = vi.fn();
const uploadMyProfilePhoto = vi.fn();
vi.mock("@api/client.js", () => ({
  apiClient: {
    put: vi.fn(),
    post: vi.fn(),
    updateMyProfile: (...a) => updateMyProfile(...a),
    uploadMyProfilePhoto: (...a) => uploadMyProfilePhoto(...a),
  },
}));

const { default: ProfileSettings } = await import("@features/settings/components/ProfileSettings.jsx");

afterEach(() => {
  cleanup();
  updateMyProfile.mockReset();
  uploadMyProfilePhoto.mockReset();
});

function renderEditing(role, phone = "") {
  mockUser = { firstName: "Maria", middleName: "", lastName: "Cruz", email: "m@example.com", phone, role };
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

const save = () => fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));
const typePhone = (value) => fireEvent.change(screen.getByLabelText("Phone"), { target: { value } });

describe("ProfileSettings phone save", () => {
  it.each(["Parent", "Guardian"])("blocks a non-PH-mobile phone for a %s before submitting", (role) => {
    renderEditing(role);
    typePhone("123-4567");
    save();

    expect(screen.getByRole("alert").textContent).toMatch(/Philippine mobile number/);
    expect(updateMyProfile).not.toHaveBeenCalled();
    typePhone("0917 123 4567");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("accepts a PH mobile number for a Parent", async () => {
    updateMyProfile.mockResolvedValue({});
    renderEditing("Parent");
    typePhone("0917 123 4567");
    save();

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalled());
    expect(updateMyProfile.mock.calls[0][0].phone).toBe("0917 123 4567");
  });

  it("does not apply the PH rule to a Teacher", async () => {
    updateMyProfile.mockResolvedValue({});
    renderEditing("Teacher");
    typePhone("123-4567");
    save();

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalled());
  });

  it("sends '' when a saved phone is emptied", async () => {
    updateMyProfile.mockResolvedValue({});
    renderEditing("Parent", "09171234567");
    typePhone("");
    save();

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalled());
    expect(updateMyProfile.mock.calls[0][0].phone).toBe("");
  });

  it("omits phone when none was ever set", async () => {
    updateMyProfile.mockResolvedValue({});
    renderEditing("Teacher");
    save();

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalled());
    expect(updateMyProfile.mock.calls[0][0].phone).toBeUndefined();
  });
});

describe("ProfileSettings view and errors", () => {
  it("shows the current user, not a stale copy, when not editing", () => {
    mockUser = { firstName: "Maria", lastName: "Cruz", email: "old@example.com", phone: "", role: "Teacher" };
    const { rerender } = render(<ProfileSettings onNotify={() => {}} />);
    mockUser = { ...mockUser, email: "new@example.com", phone: "09171234567" };
    rerender(<ProfileSettings onNotify={() => {}} />);

    expect(screen.getAllByText("new@example.com").length).toBeGreaterThan(0);
    expect(screen.queryByText("old@example.com")).toBeNull();
    expect(screen.getByText("09171234567")).toBeTruthy();
  });

  it("reports the server's message when the photo upload fails", async () => {
    uploadMyProfilePhoto.mockRejectedValue({ name: "ApiError", status: 400, message: "Something went wrong.", details: { message: "Image too big" } });
    mockUser = { firstName: "Maria", lastName: "Cruz", email: "m@example.com", role: "Teacher" };
    const onNotify = vi.fn();
    const { container } = render(<ProfileSettings onNotify={onNotify} />);
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });

    await waitFor(() => expect(onNotify).toHaveBeenCalledWith("error", "Image too big"));
  });
});
