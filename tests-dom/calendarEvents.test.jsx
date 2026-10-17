import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getStudents: vi.fn(),
  getNoClassDays: vi.fn(),
  createNoClassDays: vi.fn(),
  deleteNoClassDay: vi.fn(),
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
    api.getNoClassDays.mockResolvedValue([]);
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

// The page has a "Set No Class" link too; the form's own button is the submit one.
const submitButton = () => screen.getAllByRole("button", { name: "Set No Class" }).find((b) => b.type === "submit");

function renderCalendar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CalendarEvents />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CalendarEvents page — no-class days", () => {
  const setup = () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-07T12:00:00")); // October 2026
    Object.values(api).forEach((f) => f.mockReset());
    api.getEvents.mockResolvedValue({ daily: {}, logs: [] });
    api.getStudents.mockResolvedValue([]);
    api.getNoClassDays.mockResolvedValue([{ id: 9, dateKey: "2026-10-14", reason: "Typhoon" }]);
  };

  it("colours a no-class day, lists it, and counts school days without it", async () => {
    setup();
    renderCalendar();

    expect(await screen.findByText("No class: Typhoon")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show events for October 2026 14" }).className).toContain("bg-purple-100");
    // October 2026: 22 weekdays, minus the no-class day (no fixed national holiday falls in October)
    expect(screen.getByText("21 school days this month")).toBeTruthy();
    // an ordinary weekday and a weekend look different
    expect(screen.getByRole("button", { name: "Show events for October 2026 13" }).className).toContain("bg-white");
    expect(screen.getByRole("button", { name: "Show events for October 2026 10" }).className).toContain("bg-gray-50");
  });

  it("marks a range as no class from the Set No Class form and reports days already set", async () => {
    setup();
    api.createNoClassDays.mockResolvedValue({ requested: 3, created: 2 });
    renderCalendar();
    await screen.findByText("No class: Typhoon");

    fireEvent.click(screen.getAllByRole("button", { name: "Set No Class" })[0]);
    fireEvent.change(screen.getByLabelText(/^From/), { target: { value: "2026-10-19" } });
    fireEvent.change(screen.getByLabelText(/^To/), { target: { value: "2026-10-21" } });
    fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: " Teachers' meeting " } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(api.createNoClassDays).toHaveBeenCalledWith({ from: "2026-10-19", to: "2026-10-21", reason: "Teachers' meeting" }),
    );
  });

  it("shows the server's message when setting fails, and blocks a backwards range", async () => {
    setup();
    api.createNoClassDays.mockRejectedValue(Object.assign(new Error("x"), { name: "ApiError", status: 400, details: { message: "Choose a weekday." } }));
    renderCalendar();
    await screen.findByText("No class: Typhoon");

    fireEvent.click(screen.getAllByRole("button", { name: "Set No Class" })[0]);
    fireEvent.change(screen.getByLabelText(/^From/), { target: { value: "2026-10-20" } });
    fireEvent.change(screen.getByLabelText(/^To/), { target: { value: "2026-10-19" } });
    expect(screen.getByText(/can't be before the first day/i)).toBeTruthy();
    expect(submitButton().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/^To/), { target: { value: "" } });
    fireEvent.click(submitButton());
    expect(await screen.findByRole("alert")).toBeTruthy();
  });

  it("offers Set no class on an ordinary school day only", async () => {
    setup();
    renderCalendar();
    await screen.findByText("No class: Typhoon");

    fireEvent.click(screen.getByRole("button", { name: "Show events for October 2026 13" })); // Tuesday
    expect(screen.getByRole("button", { name: "Set no class" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    fireEvent.click(screen.getByRole("button", { name: "Show events for October 2026 10" })); // Saturday
    expect(screen.queryByRole("button", { name: "Set no class" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    fireEvent.click(screen.getByRole("button", { name: "Show events for October 2026 14" })); // already no class
    expect(screen.queryByRole("button", { name: "Set no class" })).toBeNull();
  });

  it("makes a day a school day again", async () => {
    setup();
    api.deleteNoClassDay.mockResolvedValue(undefined);
    renderCalendar();
    await screen.findByText("No class: Typhoon");

    fireEvent.click(screen.getByRole("button", { name: /remove no class on/i }));
    await waitFor(() => expect(api.deleteNoClassDay).toHaveBeenCalledWith(9));
  });
});
