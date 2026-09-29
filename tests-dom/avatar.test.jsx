import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

const { default: Avatar } = await import("@components/shared/Avatar.jsx");

afterEach(cleanup);

describe("Avatar", () => {
  it("shows the photo when there is one", () => {
    const { container } = render(<Avatar src="https://example.test/a.jpg" name="Ana Cruz" />);
    expect(container.querySelector("img").getAttribute("src")).toBe("https://example.test/a.jpg");
  });

  it("falls back to initials when there is no photo", () => {
    const { container } = render(<Avatar name="Ana Maria Cruz" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("AM");
  });

  it("falls back to a generic icon when there is no photo and no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back to the placeholder when the image fails to load", () => {
    const { container } = render(<Avatar src="https://example.test/gone.jpg" name="Ana Cruz" />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("AC");
  });

  it("tries a new photo again after an earlier one failed", () => {
    const { container, rerender } = render(<Avatar src="https://example.test/old.jpg" name="Ana Cruz" />);
    fireEvent.error(container.querySelector("img"));
    rerender(<Avatar src="https://example.test/new.jpg" name="Ana Cruz" />);
    expect(container.querySelector("img").getAttribute("src")).toBe("https://example.test/new.jpg");
  });

  it("is hidden from assistive tech unless given an alt", () => {
    const { container, rerender } = render(<Avatar name="Ana Cruz" />);
    expect(container.firstChild.getAttribute("aria-hidden")).toBe("true");
    rerender(<Avatar name="Ana Cruz" alt="Ana's profile" />);
    expect(container.firstChild.getAttribute("role")).toBe("img");
    expect(container.firstChild.getAttribute("aria-label")).toBe("Ana's profile");
  });
});
