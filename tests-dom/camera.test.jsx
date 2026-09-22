import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";

const api = vi.hoisted(() => ({ sendAttendanceFrame: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { useFaceRecognition } = await import("@features/smartAttendance/hooks/useFaceRecognition.js");

let cam;
function Harness(props) {
  cam = useFaceRecognition(props);
  return <video ref={cam.videoRef} />;
}

const track = { stop: vi.fn() };
const stream = { getTracks: () => [track] };
const ok = (over = {}) => ({ width: 640, height: 360, faces: [], verified: [], ...over });
const advance = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  track.stop.mockClear();
  api.sendAttendanceFrame.mockReset();
  api.sendAttendanceFrame.mockResolvedValue(ok());
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue(stream) } });
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined });
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", { configurable: true, get: () => 1280 });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", { configurable: true, get: () => 720 });
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage: vi.fn() });
  HTMLCanvasElement.prototype.toBlob = (cb) => cb(new Blob(["x"], { type: "image/jpeg" }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("useFaceRecognition — camera lifecycle", () => {
  it("asks for video only (no microphone), goes live, and sends frames", async () => {
    render(<Harness />);
    await act(async () => { await cam.start("user"); });
    const constraints = navigator.mediaDevices.getUserMedia.mock.calls[0][0];
    expect(constraints.audio).toBe(false);
    expect(constraints.video.facingMode).toBe("user");
    expect(cam.status).toBe("live");
    expect(api.sendAttendanceFrame).toHaveBeenCalledTimes(1);
    const [blob] = api.sendAttendanceFrame.mock.calls[0];
    expect(blob.type).toBe("image/jpeg");
  });

  it("never has two frames in flight: the next is sent only after the previous response", async () => {
    let resolveFirst;
    api.sendAttendanceFrame.mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; }));
    render(<Harness />);
    await act(async () => { await cam.start(); });
    await advance(5000); // a slow server: 5 s with no response
    expect(api.sendAttendanceFrame).toHaveBeenCalledTimes(1); // nothing piled up
    await act(async () => { resolveFirst(ok()); });
    await advance(800);
    expect(api.sendAttendanceFrame.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps a ~700 ms cadence", async () => {
    render(<Harness />);
    await act(async () => { await cam.start(); });
    await advance(3500);
    const n = api.sendAttendanceFrame.mock.calls.length;
    expect(n).toBeGreaterThanOrEqual(5);
    expect(n).toBeLessThanOrEqual(7);
  });

  it("reports verified students and the faces to draw", async () => {
    const onVerified = vi.fn();
    api.sendAttendanceFrame.mockResolvedValue(ok({
      faces: [{ box: [1, 2, 3, 4], student: { id: 5, name: "Ana" }, verified: true }],
      verified: [{ studentId: 5, name: "Ana", arrivedAt: "2026-09-20T00:31:00Z" }],
    }));
    render(<Harness onVerified={onVerified} />);
    await act(async () => { await cam.start(); });
    expect(onVerified).toHaveBeenCalledWith([expect.objectContaining({ name: "Ana" })]);
    expect(cam.frame.faces).toHaveLength(1);
    expect(cam.frame.width).toBe(640);
  });

  it("turning it off stops the camera and every further frame", async () => {
    render(<Harness />);
    await act(async () => { await cam.start(); });
    const before = api.sendAttendanceFrame.mock.calls.length;
    await act(async () => { cam.stop(); });
    expect(track.stop).toHaveBeenCalled();
    expect(cam.status).toBe("off");
    await advance(5000);
    expect(api.sendAttendanceFrame.mock.calls.length).toBe(before);
  });

  it("leaving the page (unmount) releases the camera and stops sending", async () => {
    const { unmount } = render(<Harness />);
    await act(async () => { await cam.start(); });
    const before = api.sendAttendanceFrame.mock.calls.length;
    unmount();
    expect(track.stop).toHaveBeenCalled();
    await advance(5000);
    expect(api.sendAttendanceFrame.mock.calls.length).toBe(before);
  });

  it("a 409 (session ended) turns the camera off by itself, with an explanation", async () => {
    api.sendAttendanceFrame.mockRejectedValue(Object.assign(new Error("x"), { status: 409 }));
    render(<Harness />);
    await act(async () => { await cam.start(); });
    expect(track.stop).toHaveBeenCalled();
    expect(cam.status).toBe("off");
    expect(cam.message).toMatch(/stopped/i);
    const calls = api.sendAttendanceFrame.mock.calls.length;
    await advance(5000);
    expect(api.sendAttendanceFrame.mock.calls.length).toBe(calls);
  });

  it("a 403 (permission lost) also stops, and says why", async () => {
    api.sendAttendanceFrame.mockRejectedValue(Object.assign(new Error("x"), { status: 403 }));
    render(<Harness />);
    await act(async () => { await cam.start(); });
    expect(cam.status).toBe("off");
    expect(cam.message).toMatch(/permission/i);
  });

  it("recognition outage: backs off, flags 'degraded' after 3 failures, recovers on success", async () => {
    api.sendAttendanceFrame.mockRejectedValue(Object.assign(new Error("x"), { status: 502 }));
    render(<Harness />);
    await act(async () => { await cam.start(); });
    expect(cam.status).toBe("live"); // still on: the camera itself is fine
    await advance(1000); await advance(2000); await advance(4000);
    expect(cam.degraded).toBe(true);
    // backoff: 4 attempts in ~7 s, not one every 0.7 s
    expect(api.sendAttendanceFrame.mock.calls.length).toBeLessThanOrEqual(5);
    api.sendAttendanceFrame.mockResolvedValue(ok());
    await advance(9000);
    expect(cam.degraded).toBe(false);
    expect(cam.status).toBe("live");
  });

  it("explains a blocked camera and leaves nothing running", async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValue(Object.assign(new Error("x"), { name: "NotAllowedError" }));
    render(<Harness />);
    await act(async () => { await cam.start(); });
    expect(cam.status).toBe("off");
    expect(cam.message).toMatch(/blocked/i);
    expect(api.sendAttendanceFrame).not.toHaveBeenCalled();
  });

  it("turned off while the permission prompt is still open: the camera is released the moment it is granted", async () => {
    let grant;
    navigator.mediaDevices.getUserMedia.mockImplementation(() => new Promise((r) => { grant = r; }));
    render(<Harness />);
    let started;
    await act(async () => { started = cam.start(); });
    await act(async () => { cam.stop(); }); // teacher changes their mind
    await act(async () => { grant(stream); await started; });
    expect(track.stop).toHaveBeenCalled();
    expect(cam.status).toBe("off");
    await advance(3000);
    expect(api.sendAttendanceFrame).not.toHaveBeenCalled();
  });

  it("an unsupported browser gets a clear message instead of a crash", async () => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
    render(<Harness />);
    await act(async () => { await cam.start(); });
    expect(cam.message).toMatch(/HTTPS/);
    expect(cam.status).toBe("off");
  });

  it("restarting (switch camera) tears the old stream down first", async () => {
    render(<Harness />);
    await act(async () => { await cam.start("user"); });
    track.stop.mockClear();
    await act(async () => { await cam.start("environment"); });
    expect(track.stop).toHaveBeenCalled(); // old one released
    expect(navigator.mediaDevices.getUserMedia.mock.calls[1][0].video.facingMode).toBe("environment");
    expect(cam.status).toBe("live");
  });
});
