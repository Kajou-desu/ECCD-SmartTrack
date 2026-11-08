import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, render, screen, act, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ getMaterials: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { useMaterials } = await import("@features/materials/hooks/useMaterials.js");
const { default: MaterialsToolbar } = await import("@features/materials/components/MaterialsToolbar.jsx");
const { default: MaterialsList } = await import("@features/materials/components/MaterialsList.jsx");

const ALL = [
  { id: 1, title: "Shapes", category: "Math" },
  { id: 2, title: "Colors", category: "Art" },
  { id: 3, title: "Letters", category: "Reading" },
];
const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);

beforeEach(() => {
  api.getMaterials.mockImplementation(async ({ session } = {}) => {
    if (session === "morning") return [ALL[1]];
    if (session === "afternoon") return [];
    return ALL;
  });
});
afterEach(() => {
  cleanup();
  api.getMaterials.mockReset();
});

async function setup() {
  const hook = renderHook(() => useMaterials(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("Learning Materials session filter", () => {
  it("starts on All and asks the server for nothing extra", async () => {
    const { result } = await setup();
    expect(result.current.sessionFilter).toBe("all");
    expect(result.current.filteredMaterials.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(api.getMaterials).toHaveBeenCalledTimes(1);
  });

  it("Morning keeps the materials students of that session submitted work for", async () => {
    const { result } = await setup();
    act(() => result.current.setSessionFilter("morning"));
    await waitFor(() => expect(result.current.filteredMaterials.map((m) => m.id)).toEqual([2]));
    expect(api.getMaterials).toHaveBeenCalledWith({ session: "morning" });
  });

  it("a material with no submissions appears under neither session, and back on All again", async () => {
    const { result } = await setup();
    act(() => result.current.setSessionFilter("afternoon"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredMaterials).toEqual([]);
    act(() => result.current.setSessionFilter("all"));
    expect(result.current.filteredMaterials).toHaveLength(3);
  });

  it("search still narrows within the chosen session", async () => {
    const { result } = await setup();
    act(() => result.current.setSessionFilter("morning"));
    await waitFor(() => expect(result.current.filteredMaterials).toHaveLength(1));
    act(() => result.current.setSearchQuery("shapes"));
    expect(result.current.filteredMaterials).toEqual([]);
  });

  it("shows nothing, plus an error, when the session lookup fails", async () => {
    const { result } = await setup();
    api.getMaterials.mockRejectedValueOnce(new Error("down"));
    act(() => result.current.setSessionFilter("morning"));
    await waitFor(() => expect(result.current.error).toMatch(/filter by session/));
    expect(result.current.filteredMaterials).toEqual([]);
  });
});

describe("session filter toggle and empty state", () => {
  it("marks the chosen toggle and reports changes", () => {
    const onChange = vi.fn();
    render(<MaterialsToolbar searchQuery="" onSearchChange={() => {}} onAddMaterial={() => {}} sessionFilter="morning" onSessionFilterChange={onChange} />);
    expect(screen.getByRole("button", { name: "Morning" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Afternoon" }));
    expect(onChange).toHaveBeenCalledWith("afternoon");
  });

  it("explains an empty session instead of blaming an empty search", () => {
    render(<MaterialsList materials={ALL} filteredMaterials={[]} searchQuery="" sessionFilter="afternoon" onClearSearch={() => {}} />);
    expect(screen.getByText("No student work for the afternoon session")).toBeTruthy();
    expect(screen.queryByText(/match ""/)).toBeNull();
  });
});
