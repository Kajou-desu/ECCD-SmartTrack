import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ startPickupWatch: vi.fn(), stopPickupWatch: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: PickupWatchControl } = await import("@features/smartAttendance/components/PickupWatchControl.jsx");
const { usePickupWatch } = await import("@features/smartAttendance/hooks/usePickupWatch.js");

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const win = (over = {}) => ({ active: false, endsAt: null, mode: "auto", ...over });

function Harness({ pickupWindow }) {
  const watch = usePickupWatch();
  return (
    <PickupWatchControl
      pickupWindow={pickupWindow}
      endsAtLabel="12:30 PM"
      isToggling={watch.isToggling}
      onStart={watch.start}
      onStop={watch.stop}
    />
  );
}

function mount(pickupWindow) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={qc}><Harness pickupWindow={pickupWindow} /></QueryClientProvider>);
}

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  toast.mockReset();
});
afterEach(cleanup);

describe("PickupWatchControl", () => {
  it("offers Stop while automatic pickup is running, and says until when", async () => {
    api.stopPickupWatch.mockResolvedValue({ pickupWindow: win() });
    mount(win({ active: true }));
    expect(screen.getByText(/Automatic pickup is on until 12:30 PM/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /start auto pickup/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /stop auto pickup/i }));
    await settle();
    expect(api.stopPickupWatch).toHaveBeenCalledTimes(1);
    expect(api.startPickupWatch).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("success", "Automatic pickup stopped.");
  });

  it("offers Start when it is off, and explains a stop the teacher made", async () => {
    api.startPickupWatch.mockResolvedValue({ pickupWindow: win({ active: true, mode: "on" }) });
    mount(win({ mode: "off" }));
    expect(screen.getByText(/Automatic pickup is stopped/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /start auto pickup/i }));
    await settle();
    expect(api.startPickupWatch).toHaveBeenCalledTimes(1);
    expect(api.stopPickupWatch).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("success", "Automatic pickup started.");
  });

  it("says so, in plain words, when the call fails", async () => {
    api.startPickupWatch.mockRejectedValue(new Error("boom"));
    mount(win());
    fireEvent.click(screen.getByRole("button", { name: /start auto pickup/i }));
    await settle();
    expect(toast).toHaveBeenCalledWith("error", "Couldn't start automatic pickup. Please try again.");
  });

  it("ignores a second press while the first is still in flight", async () => {
    let finish;
    api.startPickupWatch.mockReturnValue(new Promise((r) => { finish = r; }));
    mount(win());
    const button = screen.getByRole("button", { name: /start auto pickup/i });
    fireEvent.click(button);
    await settle();
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(api.startPickupWatch).toHaveBeenCalledTimes(1);
    await act(async () => finish({}));
  });
});
