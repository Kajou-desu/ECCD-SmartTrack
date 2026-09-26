import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getStudents: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: CalendarEvents } = await import("@pages/CalendarEvents.jsx");

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CalendarEvents page", () => {
  it("shows monthly holidays and student birthdays as view-only calendar events", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-05T12:00:00"));
    api.getEvents.mockResolvedValue({ daily: {}, logs: [] });
    api.getStudents.mockResolvedValue([
      { id: 1, firstName: "Ana", lastName: "Reyes", birthday: "2018-01-17" },
    ]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CalendarEvents />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("New Year's Day")).toBeTruthy();
    expect(await screen.findByText("Ana Reyes's Birthday")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show events for January 2026 17" }).className)
      .toContain("bg-red-100");
    expect(screen.queryByLabelText("Edit Ana Reyes's Birthday")).toBeNull();
    expect(screen.queryByLabelText("Delete Ana Reyes's Birthday")).toBeNull();
  });
});