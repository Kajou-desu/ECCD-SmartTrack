import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const api = vi.hoisted(() => ({
  login: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useAuth", () => ({ useAuth: () => ({ login: vi.fn() }) }));

const { default: Login } = await import("@pages/Loginpage.jsx");

const serverError = (status, message) =>
  Object.assign(new Error("Something went wrong."), { name: "ApiError", status, details: { message } });

async function openResetForm() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }));
  fireEvent.change(screen.getByLabelText(/Account Email Address/i), { target: { value: "Parent@Example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Get OTP Code" }));
  await screen.findByText("Enter Verification Code");
}

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  api.requestPasswordReset.mockResolvedValue({ message: "If the email exists, an OTP was sent" });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("password reset flow", () => {
  it("prefills the email from the forgot step", async () => {
    await openResetForm();
    expect(screen.getByLabelText(/email/i, { selector: "#reset-email, input[type=email]" }).value).toBe(
      "parent@example.com",
    );
  });

  it("shows the server's reason when the code is rejected, not a generic message", async () => {
    api.resetPassword.mockRejectedValue(serverError(400, "Invalid or expired OTP"));
    await openResetForm();
    fireEvent.change(screen.getByLabelText(/6-Digit Verification Code/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: "Sunshine2026!ab" } });
    fireEvent.change(screen.getByLabelText(/Confirm/i), { target: { value: "Sunshine2026!ab" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(await screen.findByText(/Invalid or expired OTP/)).toBeTruthy();
  });

  it("offers a resend only after a 60 second cooldown, and calls the API again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await openResetForm();
    const button = screen.getByRole("button", { name: /Resend code in \d+s/ });
    expect(button.disabled).toBe(true);

    // The countdown re-arms its timer after each render, so tick second by second.
    for (let i = 0; i < 61; i += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }
    const ready = await screen.findByRole("button", { name: /Didn't get a code\? Resend/ });
    expect(ready.disabled).toBe(false);

    fireEvent.click(ready);
    await waitFor(() => expect(api.requestPasswordReset).toHaveBeenCalledTimes(2));
  });

  it("tells a rate-limited user to wait", async () => {
    api.requestPasswordReset.mockRejectedValue(serverError(429, "Too many requests, please try again later"));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }));
    fireEvent.change(screen.getByLabelText(/Account Email Address/i), { target: { value: "a@b.co" } });
    fireEvent.click(screen.getByRole("button", { name: "Get OTP Code" }));
    expect(await screen.findByText(/Too many requests, please try again later/)).toBeTruthy();
  });
});
