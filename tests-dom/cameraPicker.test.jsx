import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";

const api = vi.hoisted(() => ({ sendAttendanceFrame: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { useFaceRecognition } = await import("@features/smartAttendance/hooks/useFaceRecognition.js");
const { default: AttendanceCamera } = await import("@features/smartAttendance/components/AttendanceCamera.jsx");

function Page({ role }) {
  const camera = useFaceRecognition({ role });
  return <AttendanceCamera camera={camera} role={role} />;
}

const track = { stop: vi.fn() };
const streamOn = (id) => ({ getTracks: () => [track], getVideoTracks: () => [{ getSettings: () => ({ deviceId: id }) }] });
const DEVICES = [
  { kind: "videoinput", deviceId: "cam-a", label: "Front camera" },
  { kind: "videoinput", deviceId: "cam-b", label: "USB camera" },
];

let getUserMedia;
beforeEach(() => {
  window.localStorage.clear();
  getUserMedia = vi.fn(({ video }) => Promise.resolve(streamOn(video.deviceId?.exact ?? "cam-a")));
  api.sendAttendanceFrame.mockReset();
  api.sendAttendanceFrame.mockResolvedValue({ width: 640, height: 360, faces: [], verified: [] });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia, enumerateDevices: vi.fn().mockResolvedValue(DEVICES), addEventListener: vi.fn(), removeEventListener: vi.fn() },
  });
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined });
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", { configurable: true, get: () => 1280 });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", { configurable: true, get: () => 720 });
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage: vi.fn() });
  HTMLCanvasElement.prototype.toBlob = (cb) => cb(new Blob(["x"], { type: "image/jpeg" }));
});
afterEach(() => cleanup());

describe("camera picker", () => {
  it("lists the available cameras instead of a switch button", async () => {
    render(<Page role="entry" />);
    const select = await screen.findByLabelText("Camera");
    expect(screen.queryByRole("button", { name: /switch camera/i })).toBeNull();
    expect([...select.querySelectorAll("option")].map((o) => o.textContent)).toContain("USB camera");
  });

  it("starts on the chosen camera and remembers it for this role only", async () => {
    render(<Page role="entry" />);
    const select = await screen.findByLabelText("Camera");
    await act(async () => { fireEvent.change(select, { target: { value: "cam-b" } }); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /use this device/i })); });
    expect(getUserMedia.mock.calls.at(-1)[0].video.deviceId).toEqual({ exact: "cam-b" });
    expect(window.localStorage.getItem("smarttrack.cameraDevice.entry")).toBe("cam-b");
    expect(window.localStorage.getItem("smarttrack.cameraDevice.exit")).toBeNull();
  });

  it("switches at once when changed while the camera is on", async () => {
    render(<Page role="entry" />);
    await act(async () => { fireEvent.click(await screen.findByRole("button", { name: /use this device/i })); });
    const select = screen.getByLabelText("Camera");
    await act(async () => { fireEvent.change(select, { target: { value: "cam-b" } }); });
    expect(getUserMedia.mock.calls.at(-1)[0].video.deviceId).toEqual({ exact: "cam-b" });
  });

  it("won't offer the camera the other role is using", async () => {
    window.localStorage.setItem("smarttrack.cameraInUse", JSON.stringify({ entry: { deviceId: "cam-a", at: Date.now() } }));
    render(<Page role="exit" />);
    const select = await screen.findByLabelText("Camera");
    const taken = [...select.querySelectorAll("option")].find((o) => o.value === "cam-a");
    expect(taken.disabled).toBe(true);
    expect(taken.textContent).toMatch(/in use by the entry camera/i);
    expect(select.value).toBe("cam-b"); // moved off the taken one
  });

  it("forgets a remembered camera that is gone and falls back to the default", async () => {
    window.localStorage.setItem("smarttrack.cameraDevice.entry", "cam-a");
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error("x"), { name: "OverconstrainedError" }));
    render(<Page role="entry" />);
    await act(async () => { fireEvent.click(await screen.findByRole("button", { name: /use this device/i })); });
    expect(getUserMedia).toHaveBeenCalledTimes(2);
    expect(getUserMedia.mock.calls[1][0].video.facingMode).toBe("user");
  });

  it("claims its camera while live and lets go when turned off", async () => {
    render(<Page role="exit" />);
    await act(async () => { fireEvent.click(await screen.findByRole("button", { name: /use this device/i })); });
    expect(JSON.parse(window.localStorage.getItem("smarttrack.cameraInUse")).exit.deviceId).toBe("cam-a");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /turn off camera/i })); });
    expect(window.localStorage.getItem("smarttrack.cameraInUse")).toBeNull();
  });
});
