import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

const { default: StudentAvatar } = await import("@features/students/components/StudentAvatar.jsx");
const { default: StudentProfileHeader } = await import(
  "@features/students/components/profile/StudentProfileHeader.jsx"
);

afterEach(cleanup);

describe("a failed photo does not stick when the photo URL changes", () => {
  it("StudentAvatar retries a new URL after the old one failed", () => {
    const base = { firstName: "Ana", lastName: "Cruz" };
    const { container, rerender } = render(<StudentAvatar student={{ ...base, photo: "https://x.test/old.jpg" }} />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();

    rerender(<StudentAvatar student={{ ...base, photo: "https://x.test/new.jpg" }} />);
    expect(container.querySelector("img").getAttribute("src")).toBe("https://x.test/new.jpg");
  });

  it("StudentProfileHeader retries a new URL after the old one failed", () => {
    const base = { name: "Ana Cruz", status: "active" };
    const { container, rerender } = render(
      <StudentProfileHeader student={{ ...base, photo: "https://x.test/old.jpg" }} />,
    );
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();

    rerender(<StudentProfileHeader student={{ ...base, photo: "https://x.test/new.jpg" }} />);
    expect(container.querySelector("img").getAttribute("src")).toBe("https://x.test/new.jpg");
  });
});
