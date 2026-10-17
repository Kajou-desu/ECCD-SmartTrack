import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { AppearanceProvider } from "@context/AppearanceContext.jsx";
import ThemeToggleButton from "@components/ui/ThemeToggleButton.jsx";
import AppearanceSettings from "@features/settings/components/AppearanceSettings.jsx";
import { useForcedLightTheme } from "@hooks/useForcedLightTheme.js";
import { APPEARANCE_STORAGE_KEY } from "@utils/appearance.js";

let systemDark;
let mediaListeners;

beforeEach(() => {
  systemDark = false;
  mediaListeners = new Set();
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-text-size");
  window.matchMedia = vi.fn(() => ({
    get matches() {
      return systemDark;
    },
    addEventListener: (_t, fn) => mediaListeners.add(fn),
    removeEventListener: (_t, fn) => mediaListeners.delete(fn),
  }));
});

afterEach(cleanup);

const renderWithProvider = (ui) => render(<AppearanceProvider>{ui}</AppearanceProvider>);
const stored = () => JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY));
const isDark = () => document.documentElement.classList.contains("dark");

describe("header theme toggle", () => {
  it("switches between light and dark and remembers the choice", () => {
    renderWithProvider(<ThemeToggleButton />);
    expect(isDark()).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(isDark()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(stored().theme).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(isDark()).toBe(false);
    expect(stored().theme).toBe("light");
  });

  it("flips to the opposite of what is showing when the preference is System", () => {
    systemDark = true;
    renderWithProvider(<ThemeToggleButton />);
    expect(isDark()).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(isDark()).toBe(false);
    expect(stored().theme).toBe("light");
  });
});

describe("General settings", () => {
  it("lets the user pick theme and text size, and applies + persists them", () => {
    renderWithProvider(<AppearanceSettings />);

    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /System/ }).checked).toBe(true);
    expect(screen.getByRole("radio", { name: /Medium/ }).checked).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /Dark/ }));
    expect(isDark()).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /Large/ }));
    expect(document.documentElement.dataset.textSize).toBe("large");

    fireEvent.click(screen.getByRole("radio", { name: /Small/ }));
    expect(document.documentElement.dataset.textSize).toBe("small");

    expect(stored()).toEqual({ theme: "dark", textSize: "small" });
  });

  it("restores saved preferences and ignores tampered values", () => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ theme: "dark", textSize: "<b>huge</b>" }),
    );
    renderWithProvider(<AppearanceSettings />);
    expect(screen.getByRole("radio", { name: /Dark/ }).checked).toBe(true);
    expect(screen.getByRole("radio", { name: /Medium/ }).checked).toBe(true);
    expect(document.documentElement.dataset.textSize).toBe("medium");
  });
});

describe("System theme", () => {
  it("follows the OS setting while it is live", () => {
    renderWithProvider(<ThemeToggleButton />);
    expect(isDark()).toBe(false);

    systemDark = true;
    act(() => mediaListeners.forEach((fn) => fn({ matches: true })));
    expect(isDark()).toBe(true);
  });
});

describe("forced light theme (the sign-in screen)", () => {
  const Locked = () => {
    useForcedLightTheme();
    return <p>locked</p>;
  };
  const useDark = () => localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ theme: "dark", textSize: "medium" }));

  it("is light while mounted, even with a saved dark preference, and dark again after", () => {
    useDark();
    const { rerender } = renderWithProvider(<p>dashboard</p>);
    expect(isDark()).toBe(true);

    rerender(
      <AppearanceProvider>
        <Locked />
      </AppearanceProvider>,
    );
    expect(isDark()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(stored().theme).toBe("dark"); // the preference itself is untouched

    rerender(
      <AppearanceProvider>
        <p>dashboard</p>
      </AppearanceProvider>,
    );
    expect(isDark()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("stays light when the OS switches to dark underneath it", () => {
    renderWithProvider(<Locked />);
    systemDark = true;
    act(() => mediaListeners.forEach((fn) => fn({ matches: true })));
    expect(isDark()).toBe(false);
  });

  it("holds until the last screen that wants it lets go", () => {
    useDark();
    const { rerender } = renderWithProvider(
      <>
        <Locked />
        <Locked />
      </>,
    );
    expect(isDark()).toBe(false);
    rerender(
      <AppearanceProvider>
        <Locked />
      </AppearanceProvider>,
    );
    expect(isDark()).toBe(false);
  });

  it("does nothing, without an AppearanceProvider, instead of throwing", () => {
    render(<Locked />);
    expect(screen.getByText("locked")).toBeTruthy();
  });
});

