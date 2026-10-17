import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";

const { default: InstallPrompt } = await import("@components/shared/InstallPrompt.jsx");

const fireInstallEvent = (outcome = "accepted") => {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  act(() => window.dispatchEvent(event));
  return event;
};

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
afterEach(cleanup);

describe("InstallPrompt", () => {
  it("shows nothing until the browser says the app can be installed", () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
  });

  it("offers install when the browser allows it, and asks the browser when pressed", async () => {
    render(<InstallPrompt />);
    const event = fireInstallEvent("accepted");
    expect(event.defaultPrevented).toBe(true); // the browser's own mini-bar is held back

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Add to home screen" })));
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
    expect(localStorage.getItem("eccd.installPromptDismissedAt")).toBeNull(); // accepted: nothing to remember
  });

  it("remembers 'Not now' and stays away on the next visit", () => {
    const { unmount } = render(<InstallPrompt />);
    fireInstallEvent();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
    expect(localStorage.getItem("eccd.installPromptDismissedAt")).not.toBeNull();

    unmount();
    render(<InstallPrompt />);
    fireInstallEvent();
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
  });

  it("closing with the X counts as dismissing", () => {
    render(<InstallPrompt />);
    fireInstallEvent();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(localStorage.getItem("eccd.installPromptDismissedAt")).not.toBeNull();
  });

  it("never shows inside the installed app", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    render(<InstallPrompt />);
    fireInstallEvent();
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
  });

  it("goes away when the app gets installed", () => {
    render(<InstallPrompt />);
    fireInstallEvent();
    expect(screen.getByRole("region", { name: /add to home screen/i })).toBeTruthy();
    act(() => window.dispatchEvent(new Event("appinstalled")));
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
  });

  it("shows the Share steps (no install button) on Safari for iPhone", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    render(<InstallPrompt />);
    expect(screen.getByText(/add to home screen/i, { selector: "strong" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add to home screen" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("region", { name: /add to home screen/i })).toBeNull();
    vi.restoreAllMocks();
  });
});
