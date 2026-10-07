import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getEnrollmentPhotoCount: vi.fn(),
  getEnrollmentPhotoBlob: vi.fn(),
  uploadEnrollmentPhotos: vi.fn(),
  deleteEnrollmentPhotos: vi.fn(),
}));
vi.mock("@api/client.js", () => ({
  apiClient: api,
  ApiError: class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  },
}));

const { default: Card } = await import(
  "@features/smartAttendance/components/StudentEnrollmentPhotosCard.jsx"
);

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  api.getEnrollmentPhotoCount.mockResolvedValue({ count: 2 });
  api.getEnrollmentPhotoBlob.mockResolvedValue(new Blob(["x"], { type: "image/jpeg" }));
  URL.createObjectURL = vi.fn(() => `blob:mock-${Math.random()}`);
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

const photo = (name) => new File(["x"], name, { type: "image/jpeg" });

describe("StudentEnrollmentPhotosCard", () => {
  it("drops the earlier selection when too many photos are chosen", async () => {
    const { container } = render(<Card studentId={5} />);
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [photo("a.jpg")] } });
    expect(await screen.findByText("1 photo selected")).toBeTruthy();

    fireEvent.change(input, { target: { files: Array.from({ length: 9 }, (_, i) => photo(`${i}.jpg`)) } });
    expect(await screen.findByText(/at most 8 photos/i)).toBeTruthy();
    expect(screen.getByText("Choose photos")).toBeTruthy();
    expect(screen.getByRole("button", { name: /replace enrollment photos/i }).disabled).toBe(true);
  });

  it("removes the enrollment after confirmation and reloads the saved list", async () => {
    api.deleteEnrollmentPhotos.mockResolvedValue(null);
    render(<Card studentId={5} />);

    fireEvent.click(await screen.findByRole("button", { name: "Remove enrolled photos" }));
    expect(api.deleteEnrollmentPhotos).not.toHaveBeenCalled(); // asks first
    api.getEnrollmentPhotoCount.mockResolvedValue({ count: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Yes, remove" }));

    await waitFor(() => expect(api.deleteEnrollmentPhotos).toHaveBeenCalledWith(5));
    expect(await screen.findByText("No photos enrolled yet.")).toBeTruthy();
  });

  it("does nothing if removal is cancelled", async () => {
    render(<Card studentId={5} />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove enrolled photos" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.deleteEnrollmentPhotos).not.toHaveBeenCalled();
  });
});
