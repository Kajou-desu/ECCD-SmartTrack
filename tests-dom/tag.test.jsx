import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getStudentBleDevices: vi.fn(), addStudentBleDevice: vi.fn(),
  setStudentBleDeviceEnabled: vi.fn(), removeStudentBleDevice: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));
const { default: StudentBleDevicesCard } = await import("@features/smartAttendance/components/StudentBleDevicesCard.jsx");

const TAG = { id: 1, studentId: 7, deviceIdentifier: "D7:40:47:15:14:90", enabled: true, registeredAt: "2026-09-20T00:00:00Z" };
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const apiError = (status, message) => Object.assign(new Error("Something went wrong."), { status, details: { message } });
const type = (value) => fireEvent.change(screen.getByLabelText("Tag address"), { target: { value } });
const submit = () => fireEvent.click(screen.getByText("Add tag"));

function mount() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><StudentBleDevicesCard studentId={7} /></QueryClientProvider>);
}
beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  api.getStudentBleDevices.mockResolvedValue([]);
});
afterEach(cleanup);

describe("StudentBleDevicesCard", () => {
  it("shows an empty state that tells the teacher what to do", async () => {
    mount(); await settle();
    expect(screen.getByText(/No tag registered yet/)).toBeTruthy();
    expect(api.getStudentBleDevices).toHaveBeenCalledWith(7);
  });

  it("lists registered tags with their state in words", async () => {
    api.getStudentBleDevices.mockResolvedValue([TAG, { ...TAG, id: 2, deviceIdentifier: "C9:FC:CB:E2:0D:33", enabled: false }]);
    mount(); await settle();
    expect(screen.getByText("D7:40:47:15:14:90")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText(/Paused, not used/)).toBeTruthy();
  });

  it("the Add button is disabled until something is typed", async () => {
    mount(); await settle();
    expect(screen.getByText("Add tag").closest("button").disabled).toBe(true);
    type("d7");
    expect(screen.getByText("Add tag").closest("button").disabled).toBe(false);
  });

  it("an invalid address is rejected with guidance BEFORE any request is made", async () => {
    mount(); await settle();
    type("not a mac"); submit(); await settle();
    expect(screen.getByRole("alert").textContent).toMatch(/like D7:40:47:15:14:90/);
    expect(api.addStudentBleDevice).not.toHaveBeenCalled();
  });

  it("sends the NORMALISED address, clears the field, and refreshes the list", async () => {
    api.addStudentBleDevice.mockResolvedValue(TAG);
    mount(); await settle();
    type("  d7-40-47-15-14-90 "); submit(); await settle();
    expect(api.addStudentBleDevice).toHaveBeenCalledWith(7, "D7:40:47:15:14:90");
    expect(screen.getByLabelText("Tag address").value).toBe("");
    expect(api.getStudentBleDevices.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("shows the server's message for a duplicate tag, and keeps what was typed", async () => {
    api.addStudentBleDevice.mockRejectedValue(apiError(409, "This device is already registered"));
    mount(); await settle();
    type("D7:40:47:15:14:90"); submit(); await settle();
    expect(screen.getByRole("alert").textContent).toMatch(/already registered/);
    expect(screen.getByLabelText("Tag address").value).toBe("D7:40:47:15:14:90");
  });

  it("removing needs a second, explicit confirmation", async () => {
    api.getStudentBleDevices.mockResolvedValue([TAG]);
    api.removeStudentBleDevice.mockResolvedValue({});
    mount(); await settle();
    fireEvent.click(screen.getByLabelText("Remove tag D7:40:47:15:14:90")); await settle();
    expect(api.removeStudentBleDevice).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Keep it")); await settle();
    expect(api.removeStudentBleDevice).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Remove tag D7:40:47:15:14:90"));
    fireEvent.click(screen.getByText("Remove tag")); await settle();
    expect(api.removeStudentBleDevice).toHaveBeenCalledWith(7, 1);
  });

  it("pause/resume flips the flag through the API", async () => {
    api.getStudentBleDevices.mockResolvedValue([TAG]);
    api.setStudentBleDeviceEnabled.mockResolvedValue({ ...TAG, enabled: false });
    mount(); await settle();
    fireEvent.click(screen.getByText("Pause")); await settle();
    expect(api.setStudentBleDeviceEnabled).toHaveBeenCalledWith(7, 1, false);
  });

  it("a network failure says what to do, never the raw error", async () => {
    api.addStudentBleDevice.mockRejectedValue(new Error("TypeError: fetch failed at 10.0.0.5"));
    mount(); await settle();
    type("D7:40:47:15:14:90"); submit(); await settle();
    const text = screen.getByRole("alert").textContent;
    expect(text).toMatch(/couldn't be saved/);
    expect(text).not.toMatch(/10\.0\.0\.5|TypeError/);
  });
});
