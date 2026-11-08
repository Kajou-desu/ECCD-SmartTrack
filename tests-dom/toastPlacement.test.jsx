import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useRef } from "react";
import { Toast } from "@components/ui/Toast.jsx";
import { useToastOffset, TOAST_OFFSET_VAR } from "@hooks/useToastOffset.js";

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty(TOAST_OFFSET_VAR);
  vi.restoreAllMocks();
});

function HeaderWithOffset() {
  const ref = useRef(null);
  useToastOffset(ref);
  return <header ref={ref}>Header</header>;
}

describe("toast placement", () => {
  it("sits at the top right, under the header, not at the bottom", () => {
    render(<Toast type="success" message="Saved" onClose={() => {}} />);
    const className = screen.getByRole("status").className;
    expect(className).toContain("right-4");
    expect(className).toContain("top-[calc(var(--toast-top,0px)+0.75rem)]");
    expect(className).not.toContain("bottom-4");
  });

  it("errors keep their alert role in the new position", () => {
    render(<Toast type="error" message="Nope" onClose={() => {}} />);
    expect(screen.getByRole("alert").className).toContain("right-4");
  });

  it("the header publishes where it ends, and removes it when it goes away", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ bottom: 96.4 });
    const { unmount } = render(<HeaderWithOffset />);
    expect(document.documentElement.style.getPropertyValue(TOAST_OFFSET_VAR)).toBe("96px");
    unmount();
    expect(document.documentElement.style.getPropertyValue(TOAST_OFFSET_VAR)).toBe("");
  });

  it("follows the header when its height changes (reminder banner shown or hidden)", () => {
    let observed;
    class FakeObserver {
      constructor(callback) { observed = callback; }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", FakeObserver);
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ bottom: 64 });
    render(<HeaderWithOffset />);
    expect(document.documentElement.style.getPropertyValue(TOAST_OFFSET_VAR)).toBe("64px");
    rect.mockReturnValue({ bottom: 104 });
    observed();
    expect(document.documentElement.style.getPropertyValue(TOAST_OFFSET_VAR)).toBe("104px");
    vi.unstubAllGlobals();
  });
});
