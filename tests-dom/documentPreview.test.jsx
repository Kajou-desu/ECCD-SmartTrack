import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";

afterEach(cleanup);

describe("RequiredDocumentsCard — document preview", () => {
  it("shows the actual file preview (not the 'not available' placeholder) when the backend provided a url", () => {
    const documents = [
      {
        id: 1,
        name: "vaccination-record.jpg",
        url: "https://api.test/files/vaccination-record.jpg?sig=abc",
        uploadedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    render(<RequiredDocumentsCard documents={documents} />);

    fireEvent.click(screen.getByRole("button", { name: /view document: vaccination-record.jpg/i }));

    expect(screen.queryByText("Preview not available for this document.")).toBeNull();
    const img = screen.getByAltText("vaccination-record.jpg");
    expect(img.getAttribute("src")).toBe(documents[0].url);
  });
});
