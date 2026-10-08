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

  describe("a re-enrollment while the photos are loading", () => {
    const stale = () => Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 409 });

    it("pins each photo request to the listed version", async () => {
      api.getEnrollmentPhotoCount.mockResolvedValue({ count: 2, version: "aaaaaaaaaaaaaaaa" });
      render(<Card studentId={5} />);
      await waitFor(() => expect(api.getEnrollmentPhotoBlob).toHaveBeenCalledTimes(2));
      for (const call of api.getEnrollmentPhotoBlob.mock.calls) {
        expect(call[2]).toMatchObject({ version: "aaaaaaaaaaaaaaaa" });
      }
    });

    it("lists again after a 409 and shows the new set, never a mix", async () => {
      api.getEnrollmentPhotoCount
        .mockResolvedValueOnce({ count: 3, version: "aaaaaaaaaaaaaaaa" })
        .mockResolvedValueOnce({ count: 1, version: "bbbbbbbbbbbbbbbb" });
      api.getEnrollmentPhotoBlob.mockImplementation(async (_id, _i, opts) => {
        if (opts.version === "aaaaaaaaaaaaaaaa") throw stale();
        return new Blob(["new"], { type: "image/jpeg" });
      });
      render(<Card studentId={5} />);

      await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(1));
      expect(api.getEnrollmentPhotoCount).toHaveBeenCalledTimes(2);
    });

    it("gives up after three attempts instead of looping forever", async () => {
      api.getEnrollmentPhotoCount.mockResolvedValue({ count: 1, version: "aaaaaaaaaaaaaaaa" });
      api.getEnrollmentPhotoBlob.mockRejectedValue(stale());
      render(<Card studentId={5} />);
      await waitFor(() => expect(api.getEnrollmentPhotoCount).toHaveBeenCalledTimes(3));
      await new Promise((r) => setTimeout(r, 20));
      expect(api.getEnrollmentPhotoCount).toHaveBeenCalledTimes(3);
      expect(screen.queryAllByRole("img")).toHaveLength(0);
    });
  });
});
