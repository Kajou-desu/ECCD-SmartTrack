import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@context/authContextObject.js";

const api = vi.hoisted(() => ({ getSchoolTimes: vi.fn(), updateSchoolTimes: vi.fn(), getCenters: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: SchoolTimeSettings } = await import("@features/settings/components/SchoolTimeSettings.jsx");

const saved = { centerId: 8, morningStart: "08:00", morningEnd: "10:30", afternoonStart: "13:00", afternoonEnd: "14:30", isDefault: false };

function renderAs(role, onNotify = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ user: { role } }}>
        <SchoolTimeSettings onNotify={onNotify} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
  return { onNotify, client };
}
const setTime = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  api.getSchoolTimes.mockResolvedValue(saved);
  api.getCenters.mockResolvedValue([{ id: 8, name: "ECCD Angeles" }, { id: 9, name: "ECCD Clark" }]);
  api.updateSchoolTimes.mockImplementation(async (payload) => ({ ...saved, ...payload, isDefault: false }));
});
afterEach(cleanup);

describe("SchoolTimeSettings as a Teacher", () => {
  it("loads their own center's times, asking for no center", async () => {
    renderAs("Teacher");
    expect(await screen.findByLabelText("Morning starts")).toHaveProperty("value", "08:00");
    expect(screen.getByLabelText("Afternoon ends")).toHaveProperty("value", "14:30");
    expect(api.getSchoolTimes).toHaveBeenCalledWith(undefined);
    expect(screen.queryByLabelText(/Center/)).toBeNull();
  });

  it("saves edited times without sending a center, tells the user, and refreshes late data", async () => {
    const { onNotify, client } = renderAs("Teacher");
    const invalidate = vi.spyOn(client, "invalidateQueries");
    await screen.findByLabelText("Morning starts");
    setTime("Morning starts", "08:30");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));

    await waitFor(() => expect(onNotify).toHaveBeenCalledWith("success", "School times were saved."));
    expect(api.updateSchoolTimes).toHaveBeenCalledWith({
      morningStart: "08:30", morningEnd: "10:30", afternoonStart: "13:00", afternoonEnd: "14:30",
    });
    const keys = invalidate.mock.calls.map((call) => call[0].queryKey[0]);
    expect(keys).toEqual(expect.arrayContaining(["attendance", "attendanceRange", "dashboardStats"]));
  });

  it("explains that the standard times apply until the center saves its own", async () => {
    api.getSchoolTimes.mockResolvedValue({ ...saved, isDefault: true });
    renderAs("Teacher");
    expect(await screen.findByText(/standard start times apply: morning at 8:00 AM and afternoon at 1:00 PM/)).toBeTruthy();
  });

  it("stops an impossible schedule before calling the server", async () => {
    renderAs("Teacher");
    await screen.findByLabelText("Morning starts");
    setTime("Morning ends", "07:00");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/morning session must end after it starts/);
    expect(api.updateSchoolTimes).not.toHaveBeenCalled();
  });

  it("stops a cleared time", async () => {
    renderAs("Teacher");
    await screen.findByLabelText("Morning starts");
    setTime("Afternoon starts", "");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/all four/);
    expect(api.updateSchoolTimes).not.toHaveBeenCalled();
  });

  it("shows the server's reason when saving fails, and keeps what was typed", async () => {
    api.updateSchoolTimes.mockRejectedValue(
      Object.assign(new Error("x"), { name: "ApiError", status: 403, details: { message: "Your account is not connected to a center yet." } }),
    );
    const { onNotify } = renderAs("Teacher");
    await screen.findByLabelText("Morning starts");
    setTime("Morning starts", "09:00");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/not connected to a center/);
    expect(screen.getByLabelText("Morning starts")).toHaveProperty("value", "09:00");
    expect(onNotify).not.toHaveBeenCalled();
  });

  it("clears an error message once the user edits", async () => {
    renderAs("Teacher");
    await screen.findByLabelText("Morning starts");
    setTime("Morning ends", "07:00");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));
    await screen.findByRole("alert");
    setTime("Morning ends", "10:00");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a plain message when the times can't be loaded", async () => {
    api.getSchoolTimes.mockRejectedValue(new Error("boom"));
    renderAs("Teacher");
    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn't be loaded/);
  });
});

describe("SchoolTimeSettings as an Admin", () => {
  it("waits for a center to be chosen before asking for anything", async () => {
    renderAs("Admin");
    expect(await screen.findByText(/Choose a center/)).toBeTruthy();
    expect(api.getSchoolTimes).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Morning starts")).toBeNull();
  });

  it("loads the chosen center and saves with that center's id", async () => {
    const { onNotify } = renderAs("Admin");
    await waitFor(() => expect(screen.getByRole("option", { name: "ECCD Clark" })).toBeTruthy());
    fireEvent.change(screen.getByLabelText(/Center/), { target: { value: "9" } });

    expect(await screen.findByLabelText("Morning starts")).toBeTruthy();
    expect(api.getSchoolTimes).toHaveBeenCalledWith(9);

    setTime("Afternoon starts", "12:45");
    fireEvent.click(screen.getByRole("button", { name: "Save school times" }));
    await waitFor(() => expect(onNotify).toHaveBeenCalled());
    expect(api.updateSchoolTimes).toHaveBeenCalledWith(expect.objectContaining({ centerId: 8, afternoonStart: "12:45" }));
  });

  it("returns to the prompt when the center is cleared", async () => {
    renderAs("Admin");
    await waitFor(() => expect(screen.getByRole("option", { name: "ECCD Clark" })).toBeTruthy());
    fireEvent.change(screen.getByLabelText(/Center/), { target: { value: "9" } });
    await screen.findByLabelText("Morning starts");
    fireEvent.change(screen.getByLabelText(/Center/), { target: { value: "" } });
    expect(await screen.findByText(/Choose a center/)).toBeTruthy();
    expect(screen.queryByLabelText("Morning starts")).toBeNull();
  });
});
