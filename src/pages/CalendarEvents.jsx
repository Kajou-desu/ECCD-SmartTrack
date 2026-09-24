import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import Modal from "@components/ui/Modal";
import ErrorMsg from "@components/ui/ErrorMsg";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

async function fetchEvents(monthKey) {
  return apiClient.getEvents(monthKey);
}

const EVENT_CATEGORIES = ["Holiday", "Birthday", "Others"];

function AddEventModal({ onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Holiday");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !date || saving) return;

    setSaving(true);
    setError("");

    try {
      await apiClient.createEvent({
        title: title.trim(),
        date,
        category,
        description: description.trim() || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err?.details?.message || "Failed to add event. Please try again.");
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="add-event-title">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 id="add-event-title" className="text-lg font-bold text-gray-900">
          Add Event
        </h2>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="event-title" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-4 focus:ring-[#C2570C]/10"
              placeholder="e.g. Founding Day"
            />
          </div>

          <div>
            <label htmlFor="event-date" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Date <span className="text-red-600">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-4 focus:ring-[#C2570C]/10"
            />
          </div>

          <div>
            <label htmlFor="event-category" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Category
            </label>
            <select
              id="event-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-4 focus:ring-[#C2570C]/10"
            >
              {EVENT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="event-description" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Description (optional)
            </label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-4 focus:ring-[#C2570C]/10"
              placeholder="Optional details about this event"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !date || saving}
            className="cursor-pointer rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Adding...
              </span>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CalendarEvents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const monthKey = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [currentDate]);

  const { data: attendanceData, isLoading, isError } = useQuery({
    queryKey: ["events", monthKey],
    queryFn: () => fetchEvents(monthKey),
  });

  const loading = isLoading;
  const [dismissedMonth, setDismissedMonth] = useState(null);
  const showError = isError && dismissedMonth !== monthKey;

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const normalizeEventLegend = (status) => {
    const value = String(status ?? "")
      .trim()
      .toLowerCase();

    if (["today", "present", "completed", "late"].includes(value)) {
      return "Today";
    }
    if (["holiday", "no classes", "holiday event", "day off"].includes(value)) {
      return "Holiday";
    }
    if (["birthday", "birthday event"].includes(value)) {
      return "Birthday";
    }
    return "Others";
  };

  const getDayColor = (day) => {
    const status = attendanceData?.daily?.[day];
    if (!status) return "bg-gray-50 text-gray-500";
    if (status === "Today")
      return "bg-orange-100 text-orange-700 border border-orange-300";
    if (status === "Holiday")
      return "bg-green-100 text-green-700 border border-green-300";
    if (status === "Birthday")
      return "bg-red-100 text-red-700 border border-red-300";
    if (status === "Others")
      return "bg-gray-100 text-gray-700 border border-gray-300";
    return "bg-gray-100 text-gray-600";
  };

  const getDayBorder = (day) => {
    const today = new Date();
    if (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      return "ring-2 ring-orange-500";
    }
    return "";
  };

  const getLegendBadgeClasses = (legend) => {
    switch (legend) {
      case "Today":
        return "bg-orange-200 text-orange-700";
      case "Holiday":
        return "bg-green-200 text-green-700";
      case "Birthday":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getLegendCardClasses = (legend) => {
    switch (legend) {
      case "Today":
        return "bg-orange-50 border-orange-200";
      case "Holiday":
        return "bg-green-50 border-green-200";
      case "Birthday":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const eventLogs = useMemo(() => {
    if (!attendanceData) return [];
    return (attendanceData.logs ?? []).reduce((acc, log) => {
      const legend = normalizeEventLegend(log.status);
      if (!acc.some((item) => item.legend === legend)) {
        acc.push({
          date: log.date,
          time: log.time,
          legend,
        });
      }
      return acc;
    }, []);
  }, [attendanceData]);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Event Calendar</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track upcoming events, special days, and school celebrations
          throughout the month
        </p>
      </div>

      {showError && (
        <ErrorMsg
          message="Unable to load events for this month. Please try again."
          onClose={() => setDismissedMonth(monthKey)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthName}
              {loading && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  Loading...
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-gray-500 uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition ${
                  day
                    ? `${getDayColor(day)} ${getDayBorder(day)} hover:shadow-md`
                    : "bg-transparent"
                }`}
              >
                {day || ""}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Legend
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded border border-orange-300"></div>
                <span className="text-xs text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                <span className="text-xs text-gray-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                <span className="text-xs text-gray-600">Birthday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
                <span className="text-xs text-gray-600">Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Logs */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Event Logs</h3>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="text-sm font-semibold text-[#C2570C] hover:text-orange-800 cursor-pointer"
            >
              Add Event
            </button>
          </div>

          <div className="space-y-3">
            {eventLogs.map((log, idx) => (
              <div
                key={`${log.legend}-${idx}`}
                className={`p-3 rounded-lg border transition ${getLegendCardClasses(
                  log.legend,
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {log.date}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getLegendBadgeClasses(
                      log.legend,
                    )}`}
                  >
                    {log.legend}
                  </span>
                </div>
                {log.time !== "---" && (
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Time:</span> {log.time}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddEventModal && (
        <AddEventModal
          onCancel={() => setShowAddEventModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            setShowAddEventModal(false);
          }}
        />
      )}
    </div>
  );
}
