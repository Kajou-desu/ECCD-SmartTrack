import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppearanceProvider } from "@context/AppearanceContext.jsx";
import { APPEARANCE_STORAGE_KEY } from "@utils/appearance.js";

vi.mock("@api/client.js", () => ({ apiClient: { login: vi.fn(), requestPasswordReset: vi.fn(), resetPassword: vi.fn() } }));
vi.mock("@hooks/useAuth", () => ({ useAuth: () => ({ login: vi.fn() }) }));

const { default: Login } = await import("@pages/Loginpage.jsx");

const isDark = () => document.documentElement.classList.contains("dark");

beforeEach(() => {
  localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ theme: "dark", textSize: "medium" }));
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(cleanup);

const renderLogin = (ui = <Login />) =>
  render(
    <AppearanceProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AppearanceProvider>,
  );

describe("sign-in page", () => {
  it("is white even when the app and the OS are both dark", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeTruthy();
    expect(isDark()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("stays white on the forgot-password and reset steps", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }));
    expect(isDark()).toBe(false);
  });

  it("hands the dark theme back when you leave it", () => {
    const { unmount } = renderLogin();
    expect(isDark()).toBe(false);
    unmount();
    // Provider unmounted with it; render the provider alone to see the saved theme apply again.
    render(<AppearanceProvider><p>dashboard</p></AppearanceProvider>);
    expect(isDark()).toBe(true);
  });
});
