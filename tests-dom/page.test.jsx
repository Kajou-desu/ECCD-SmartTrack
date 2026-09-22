import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getAttendanceSession: vi.fn(),
  getAttendanceMonitor: vi.fn(),
  sendAttendanceFrame: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: AttendanceLive } = await import("@pages/AttendanceLive.jsx");

const SESSION = { id: 3, date: "2026-09-20", status: "active" };
const MONITOR = {
  session: SESSION, gatewayOnline: false, recognitionAvailable: true,
  counts: { verified: 1, faceOnly: 1, bleOnly: 0 },
  students: [
    { studentId: 1, name: "Ana Reyes", status: "verified", verifiedAt: "2026-09-20T00:31:00.000Z" },
    { studentId: 2, name: "Ben Cruz", status: "face_only", verifiedAt: null },
  ],
};
const track = { stop: vi.fn() };
const advance = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
let queryClient;

function mount() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><AttendanceLive /></MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "setInterval", "clearTimeout", "clearInterval"] });
  track.stop.mockClear();
  Object.values(api).forEach((f) => f.mockReset());
  api.getAttendanceSession.mockResolvedValue({ session: SESSION });
  api.getAttendanceMonitor.mockResolvedValue(MONITOR);
  api.sendAttendanceFrame.mockResolvedValue({ width: 640, height: 360, faces: [], verified: [] });
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }) } });
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined });
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", { configurable: true, get: () => 1280 });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", { configurable: true, get: () => 720 });
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage: vi.fn() });
  HTMLCanvasElement.prototype.toBlob = (cb) => cb(new Blob(["x"], { type: "image/jpeg" }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("AttendanceLive page", () => {
  it("when attendance isn't running: says so, and offers no camera and no monitor polling", async () => {
    api.getAttendanceSession.mockResolvedValue({ session: null });
    mount(); await advance(50);
    expect(screen.getByText("Attendance isn't running")).toBeTruthy();
    expect(screen.queryByText("Use this device's camera")).toBeNull();
    await advance(10000);
    expect(api.getAttendanceMonitor).not.toHaveBeenCalled(); // nothing polled while idle
  });

  it("shows who is verified and who is waiting, in words, and the hardware status", async () => {
    mount(); await advance(50);
    expect(screen.getByText("Ana Reyes")).toBeTruthy();
    expect(screen.getByText("Marked present")).toBeTruthy();
    expect(screen.getByText("Face seen, waiting for tag")).toBeTruthy();
    expect(screen.getByText("1 marked present, 1 waiting for a second check")).toBeTruthy();
    expect(screen.getByText("Not connected")).toBeTruthy(); // door tag reader offline is visible
    expect(screen.getByText("Ready")).toBeTruthy();           // face recognition
    expect(screen.getByText(/Arrived at \d{1,2}:\d{2}/)).toBeTruthy();
  });

  it("warns when face recognition isn't set up on the server", async () => {
    api.getAttendanceMonitor.mockResolvedValue({ ...MONITOR, recognitionAvailable: false });
    mount(); await advance(50);
    expect(screen.getByText("Not set up on the server")).toBeTruthy();
  });

  it("the camera is opt-in: nothing streams until the teacher turns it on", async () => {
    mount(); await advance(50);
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    expect(api.sendAttendanceFrame).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Use this device's camera")); await advance(50);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(api.sendAttendanceFrame).toHaveBeenCalled();
    expect(screen.getByText("Turn off camera")).toBeTruthy();
  });

  it("THE CAMERA NEVER OUTLIVES THE SESSION: stopping attendance elsewhere turns it off here", async () => {
    mount(); await advance(50);
    fireEvent.click(screen.getByText("Use this device's camera")); await advance(50);
    expect(track.stop).not.toHaveBeenCalled();

    // Another device stops attendance; this page notices on its next poll.
    api.getAttendanceSession.mockResolvedValue({ session: null });
    await advance(3500);

    expect(track.stop).toHaveBeenCalled(); // camera light is off
    expect(screen.getByText("Attendance isn't running")).toBeTruthy();
    expect(screen.getByText(/Attendance was stopped, so the camera was turned off/)).toBeTruthy();
    const frames = api.sendAttendanceFrame.mock.calls.length;
    await advance(5000);
    expect(api.sendAttendanceFrame.mock.calls.length).toBe(frames); // and nothing more is sent
  });

  it("announces newly verified students to screen readers", async () => {
    api.sendAttendanceFrame.mockResolvedValue({
      width: 640, height: 360, faces: [],
      verified: [{ studentId: 2, name: "Ben Cruz", arrivedAt: "2026-09-20T00:32:00Z" }],
    });
    mount(); await advance(50);
    fireEvent.click(screen.getByText("Use this device's camera")); await advance(50);
    const live = screen.getByText("Ben Cruz marked present");
    expect(live.getAttribute("aria-live")).toBe("polite");
  });

  it("refreshes the roster and dashboard when the verified count goes up", async () => {
    mount(); await advance(50);
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    api.getAttendanceMonitor.mockResolvedValue({ ...MONITOR, counts: { verified: 2, faceOnly: 0, bleOnly: 0 } });
    await advance(2500);
    const keys = spy.mock.calls.map((c) => JSON.stringify(c[0].queryKey));
    expect(keys).toContain('["attendance"]');
    expect(keys).toContain('["dashboardStats"]');
  });
});
