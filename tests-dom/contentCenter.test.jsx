import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getCenters: vi.fn(),
  getMaterials: vi.fn(),
  getEventOptions: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const auth = vi.hoisted(() => ({ user: { id: 1, role: "Admin", centerId: null } }));
vi.mock("@hooks/useAuth.js", () => ({ useAuth: () => ({ user: auth.user }) }));

const { default: AddMaterial } = await import("@features/materials/components/AddMaterial.jsx");
const { default: CreateAlbumModal } = await import("@features/eventPhotos/components/CreateAlbumModal.jsx");

const CENTERS = [{ id: 1, name: "ECCD Angeles" }, { id: 2, name: "ECCD Mabalacat" }];
const ACTIVITIES = [
  { id: 10, title: "Angeles counting", centerId: 1 },
  { id: 20, title: "Mabalacat shapes", centerId: 2 },
];

const wrap = (ui) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>
);
const asAdmin = () => (auth.user = { id: 1, role: "Admin", centerId: null });
const asTeacher = () => (auth.user = { id: 2, role: "Teacher", centerId: 1 });

beforeEach(() => {
  Object.values(api).forEach((m) => m.mockReset());
  api.getCenters.mockResolvedValue(CENTERS);
  api.getMaterials.mockResolvedValue(ACTIVITIES);
  api.getEventOptions.mockResolvedValue([]);
});
afterEach(cleanup);

describe("AddMaterial center", () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Shapes" } });
    fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: "Math" } });
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: "Circles" } });
    const file = new File(["%PDF-1.4"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(document.getElementById("material-file"), { target: { files: [file] } });
  };

  it("makes an Admin choose a center and sends it with the material", async () => {
    asAdmin();
    const onConfirm = vi.fn();
    render(wrap(<AddMaterial onCancel={vi.fn()} onConfirm={onConfirm} />));

    const select = await screen.findByLabelText(/^Center/);
    expect(select.required).toBe(true);
    await waitFor(() => expect(select.disabled).toBe(false));
    expect([...select.options].map((o) => o.textContent)).toEqual(["Select a center", "ECCD Angeles", "ECCD Mabalacat"]);

    fill();
    fireEvent.change(select, { target: { value: "2" } });
    fireEvent.submit(select.closest("form"));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ title: "Shapes", centerId: "2" }));
  });

  it("shows a Teacher no center field and sends none (the server uses their own)", () => {
    asTeacher();
    const onConfirm = vi.fn();
    render(wrap(<AddMaterial onCancel={vi.fn()} onConfirm={onConfirm} />));

    expect(screen.queryByLabelText(/^Center/)).toBeNull();
    expect(api.getCenters).not.toHaveBeenCalled();

    fill();
    fireEvent.submit(document.querySelector("form"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0][0]).not.toHaveProperty("centerId");
  });
});

describe("CreateAlbumModal center", () => {
  it("makes an Admin choose a center before the album can be created", async () => {
    asAdmin();
    const onConfirm = vi.fn(() => ({ success: true }));
    render(wrap(<CreateAlbumModal onCancel={vi.fn()} onConfirm={onConfirm} />));

    fireEvent.change(screen.getByLabelText(/^Album Name/), { target: { value: "Trip" } });
    fireEvent.submit(document.querySelector("form"));

    expect((await screen.findByRole("alert")).textContent).toMatch(/Choose a center/);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("passes the Admin's center on, and offers only that center's activities", async () => {
    asAdmin();
    const onConfirm = vi.fn(() => ({ success: true }));
    render(wrap(<CreateAlbumModal onCancel={vi.fn()} onConfirm={onConfirm} />));

    const center = await screen.findByLabelText(/^Center/);
    await waitFor(() => expect(center.disabled).toBe(false));
    fireEvent.change(center, { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Connect album to"), { target: { value: "activity" } });

    const activity = await screen.findByLabelText(/Select activity/);
    await waitFor(() => expect(activity.disabled).toBe(false));
    expect([...activity.options].map((o) => o.textContent)).toEqual(["Choose activity", "Mabalacat shapes"]);

    fireEvent.change(activity, { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/^Album Name/), { target: { value: "Trip" } });
    fireEvent.submit(document.querySelector("form"));

    expect(onConfirm).toHaveBeenCalledWith("Trip", expect.objectContaining({ type: "activity", id: "20" }), "2");
  });

  it("clears a chosen activity when the center changes", async () => {
    asAdmin();
    render(wrap(<CreateAlbumModal onCancel={vi.fn()} onConfirm={vi.fn()} />));

    const center = await screen.findByLabelText(/^Center/);
    await waitFor(() => expect(center.disabled).toBe(false));
    fireEvent.change(center, { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Connect album to"), { target: { value: "activity" } });
    const activity = await screen.findByLabelText(/Select activity/);
    await waitFor(() => expect(activity.disabled).toBe(false));
    fireEvent.change(activity, { target: { value: "10" } });
    expect(activity.value).toBe("10");

    fireEvent.change(center, { target: { value: "2" } });
    await waitFor(() => expect(screen.getByLabelText(/Select activity/).value).toBe(""));
  });

  it("shows a Teacher no center field and passes none", async () => {
    asTeacher();
    const onConfirm = vi.fn(() => ({ success: true }));
    render(wrap(<CreateAlbumModal onCancel={vi.fn()} onConfirm={onConfirm} />));

    expect(screen.queryByLabelText(/^Center/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/^Album Name/), { target: { value: "Trip" } });
    // pick an event so the form is valid
    api.getEventOptions.mockResolvedValue([{ id: 8, title: "Family Day" }]);
    fireEvent.submit(document.querySelector("form"));

    expect(onConfirm).toHaveBeenCalledWith("Trip", expect.anything(), undefined);
  });
});
