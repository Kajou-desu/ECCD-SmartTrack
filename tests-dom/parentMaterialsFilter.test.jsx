import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, render, screen, act, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ getMaterials: vi.fn(), getSubmissions: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useParentChild", () => ({ useParentChild: () => ({ selectedChildId: 5 }) }));

const { default: useParentMaterials } = await import("@features/materials/hooks/useParentMaterials.js");
const { default: ParentMaterialsToolbar } = await import("@features/materials/components/ParentMaterialsToolbar.jsx");
const { default: ParentMaterialsList } = await import("@features/materials/components/ParentMaterialsList.jsx");

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);

beforeEach(() => {
  api.getMaterials.mockResolvedValue([
    { id: 1, title: "Shapes", category: "Math" },
    { id: 2, title: "Colors", category: "Art" },
    { id: 3, title: "Letters", category: "Reading" },
  ]);
  api.getSubmissions.mockResolvedValue([{ materialId: 2, fileUrl: "x", fileName: "x.pdf", submittedAt: "2026-10-01" }]);
});
afterEach(() => {
  cleanup();
  Object.values(api).forEach((f) => f.mockReset());
});

async function setup() {
  const hook = renderHook(() => useParentMaterials(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("parent materials — pending filter", () => {
  it("counts pending as the materials this child has handed in no work for", async () => {
    const { result } = await setup();
    expect(result.current.counts).toEqual({ all: 3, pending: 2, completed: 1 });
  });

  it("pending shows only materials without a submission", async () => {
    const { result } = await setup();
    act(() => result.current.setStatusFilter("pending"));
    expect(result.current.filteredMaterials.map((m) => m.title)).toEqual(["Shapes", "Letters"]);
  });

  it("completed shows only materials with a submission, and works with search", async () => {
    const { result } = await setup();
    act(() => result.current.setStatusFilter("completed"));
    expect(result.current.filteredMaterials.map((m) => m.title)).toEqual(["Colors"]);

    act(() => {
      result.current.setStatusFilter("pending");
      result.current.setSearchQuery("let");
    });
    expect(result.current.filteredMaterials.map((m) => m.title)).toEqual(["Letters"]);
  });

  it("only this child's submissions count: submissions are requested for the selected child", async () => {
    await setup();
    expect(api.getSubmissions).toHaveBeenCalledWith(5);
  });
});

describe("parent materials toolbar and list", () => {
  it("shows the three filters with counts and reports the choice", () => {
    const onChange = vi.fn();
    render(
      <ParentMaterialsToolbar searchQuery="" onSearchChange={() => {}} statusFilter="all" onStatusFilterChange={onChange} counts={{ all: 3, pending: 2, completed: 1 }} />,
    );
    expect(screen.getByRole("button", { name: "All (3)" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Pending (2)" }));
    expect(onChange).toHaveBeenCalledWith("pending");
  });

  it("says 'Nothing pending' instead of a search message when everything is done", () => {
    const onClearFilter = vi.fn();
    render(
      <ParentMaterialsList materials={[{ id: 1 }]} filteredMaterials={[]} searchQuery="" statusFilter="pending" onClearSearch={() => {}} onClearFilter={onClearFilter} onView={() => {}} />,
    );
    expect(screen.getByText("Nothing pending")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /show all materials/i }));
    expect(onClearFilter).toHaveBeenCalled();
  });
});
