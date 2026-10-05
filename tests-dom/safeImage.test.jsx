import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import SafeImage, { FILE_URL_FAILED_EVENT } from "@components/shared/SafeImage.jsx";
import PhotoThumbnail from "@features/photoGallery/components/PhotoThumbnail.jsx";

afterEach(cleanup);

describe("SafeImage", () => {
  it("shows a placeholder when the image fails and asks the app for fresh URLs once", () => {
    const listener = vi.fn();
    window.addEventListener(FILE_URL_FAILED_EVENT, listener);
    const { container, rerender } = render(<SafeImage src="https://api.test/a.jpg?sig=1" alt="Cover" />);

    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Cover" })).toBeTruthy();
    expect(listener).toHaveBeenCalledTimes(1);

    // A refreshed URL is tried again; a second failure does not ask again.
    rerender(<SafeImage src="https://api.test/a.jpg?sig=2" alt="Cover" />);
    const retry = container.querySelector("img");
    expect(retry).toBeTruthy();
    fireEvent.error(retry);
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(FILE_URL_FAILED_EVENT, listener);
  });

  it("renders the image normally when it loads", () => {
    const { container } = render(<SafeImage src="https://api.test/ok.jpg" alt="Ok" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://api.test/ok.jpg");
  });
});

describe("PhotoThumbnail", () => {
  it("stops showing the loading pulse when the image fails", () => {
    const { container } = render(
      <PhotoThumbnail photo={{ id: 1, url: "https://api.test/x.jpg", caption: "Sports day" }} albumTitle="Album" onView={() => {}} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(screen.getByRole("img", { name: "Sports day" })).toBeTruthy();
  });
});
