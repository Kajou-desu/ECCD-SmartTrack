import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const getStudentDocumentLink = vi.fn();
vi.mock("@api/client.js", () => ({ apiClient: { getStudentDocumentLink } }));

const { default: RequiredDocumentsCard } = await import(
  "@features/students/components/profile/RequiredDocumentsCard"
);
const { default: PhotoThumbnail } = await import("@features/photoGallery/components/PhotoThumbnail.jsx");
const { default: AlbumCard } = await import("@features/eventPhotos/components/AlbumCard.jsx");

const STALE = "https://api.test/api/files/doc.jpg?exp=1&sig=stale&s=1";
const FRESH = "https://api.test/api/files/doc.jpg?exp=999&sig=fresh&s=1";
const documents = [{ id: 7, name: "birth-certificate.jpg", url: STALE, uploadedAt: "2026-01-01T00:00:00.000Z" }];
const viewButton = () => screen.getByRole("button", { name: /view document: birth-certificate.jpg/i });

beforeEach(() => getStudentDocumentLink.mockReset());
afterEach(cleanup);

describe("opening a student document (M38)", () => {
  it("asks for a fresh link at the moment of opening, instead of using the one from the list", async () => {
    getStudentDocumentLink.mockResolvedValue({ url: FRESH });
    render(<RequiredDocumentsCard documents={documents} studentId={12} />);

    fireEvent.click(viewButton());

    const img = await screen.findByAltText("birth-certificate.jpg");
    expect(getStudentDocumentLink).toHaveBeenCalledWith(12, 7);
    expect(img.getAttribute("src")).toBe(FRESH);
  });

  it("shows a message and doesn't open a preview when the link can't be fetched", async () => {
    const apiError = Object.assign(new Error("Something went wrong."), {
      name: "ApiError",
      status: 403,
      details: { message: "Forbidden" },
    });
    getStudentDocumentLink.mockRejectedValueOnce(apiError);
    render(<RequiredDocumentsCard documents={documents} studentId={12} />);

    fireEvent.click(viewButton());

    expect((await screen.findByRole("alert")).textContent).toBe("Forbidden");
    expect(screen.queryByAltText("birth-certificate.jpg")).toBeNull();
  });

  it("ignores a second click while the link is being fetched", async () => {
    let resolve;
    getStudentDocumentLink.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<RequiredDocumentsCard documents={documents} studentId={12} />);

    fireEvent.click(viewButton());
    fireEvent.click(viewButton());
    resolve({ url: FRESH });

    await screen.findByAltText("birth-certificate.jpg");
    expect(getStudentDocumentLink).toHaveBeenCalledTimes(1);
  });

  it("clears an earlier error on the next attempt", async () => {
    getStudentDocumentLink.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ url: FRESH });
    render(<RequiredDocumentsCard documents={documents} studentId={12} />);

    fireEvent.click(viewButton());
    await screen.findByRole("alert");
    fireEvent.click(viewButton());

    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(await screen.findByAltText("birth-certificate.jpg")).toBeTruthy();
  });
});

describe("gallery tiles use thumbnails (M36)", () => {
  const url = "https://api.test/api/files/p1.jpg?exp=1&sig=abc";

  it("PhotoThumbnail requests ?v=thumb", () => {
    render(<PhotoThumbnail photo={{ id: 1, url, caption: "Sports day" }} albumTitle="Album" onView={() => {}} />);
    expect(new URL(screen.getByAltText("Sports day").getAttribute("src")).searchParams.get("v")).toBe("thumb");
  });

  it("AlbumCard cover requests ?v=thumb", () => {
    const album = { id: 1, title: "Field trip", date: "2026-01-01", photos: [{ id: 1, url }] };
    render(<AlbumCard album={album} onOpen={() => {}} />);
    const cover = screen.getByAltText("Cover photo for Field trip");
    expect(new URL(cover.getAttribute("src")).searchParams.get("v")).toBe("thumb");
  });
});
