import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import Modal from "@components/ui/Modal";
import ErrorMsg from "@components/ui/ErrorMsg";
import { useStudentsQuery } from "@features/students/hooks/useStudentsQuery.js";
import { HOLIDAYS } from "@constants/holidays.js";
import formatStudentName from "@utils/formatStudentName.js";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

async function fetchEvents(monthKey) {
  return apiClient.getEvents(monthKey);
}

const EVENT_CATEGORIES = ["Holiday", "Birthday", "Event"];
const MONTH_ABBREVIATIONS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function getBirthdayMonthAndDay(birthday) {
  if (typeof birthday === "string") {
    const dateOnlyMatch = birthday.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
      return { month: Number(dateOnlyMatch[2]), day: Number(dateOnlyMatch[3]) };
    }
  }

  const parsedBirthday = new Date(birthday);
  if (Number.isNaN(parsedBirthday.getTime())) return null;
  return { month: parsedBirthday.getMonth() + 1, day: parsedBirthday.getDate() };
}

function formatEventDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function AddEventModal({ eventToEdit, onCancel, onSaved }) {
  const [title, setTitle] = useState(eventToEdit?.title ?? "");
  const [date, setDate] = useState(eventToEdit?.dateKey ?? "");
  const [category, setCategory] = useState(eventToEdit?.legend ?? "Holiday");
  const [description, setDescription] = useState(eventToEdit?.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !date || saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        date,
        category,
        description: description.trim() || undefined,
      };
      if (eventToEdit) {
        await apiClient.updateEvent(eventToEdit.id, payload);
      } else {
        await apiClient.createEvent(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err?.details?.message ||
          `Failed to ${eventToEdit ? "update" : "add"} event. Please try again.`,
      );
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="event-form-title">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 id="event-form-title" className="text-lg font-bold text-gray-900">
          {eventToEdit ? "Edit Event" : "Add Event"}
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
                  {eventToEdit ? "Saving..." : "Adding..."}
              </span>
            ) : (
                eventToEdit ? "Save Changes" : "Add Event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EventDetailsModal({ details, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="event-details-title">
      <div className="p-6">
        <h2 id="event-details-title" className="text-lg font-bold text-gray-900">
          Events for {details.date}
        </h2>

        {details.events.length ? (
          <div className="mt-4 space-y-3">
            {details.events.map((event, index) => (
              <article
                key={event.id ?? `${event.dateKey}-${index}`}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {event.title || event.legend}
                  </h3>
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${getLegendBadgeClasses(
                      event.legend,
                    )}`}
                  >
                    {event.legend}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                    {event.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">No events scheduled.</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function getLegendBadgeClasses(legend) {
  switch (legend) {
    case "Today":
      return "bg-orange-200 text-orange-700";
    case "Holiday":
      return "bg-green-200 text-green-700";
    case "Birthday":
      return "bg-red-200 text-red-700";
    default:
      return "bg-blue-200 text-blue-700";
  }
}

export default function CalendarEvents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [eventDetails, setEventDetails] = useState(null);

  const monthKey = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [currentDate]);

  const { data: attendanceData, isLoading, isError } = useQuery({
    queryKey: ["events", monthKey],
    queryFn: () => fetchEvents(monthKey),
  });
  const { data: studentsData, isLoading: studentsLoading } = useStudentsQuery();

  const loading = isLoading || studentsLoading;
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
    if (["event", "others"].includes(value)) {
      return "Event";
    }
    return "Event";
  };

  const getDayColor = (day) => {
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
    const status =
      eventLogs.find((event) => event.dateKey === dateKey)?.legend ??
      attendanceData?.daily?.[day];
    if (!status) return "bg-gray-50 text-gray-500";
    if (status === "Today")
      return "bg-orange-100 text-orange-700 border border-orange-300";
    if (status === "Holiday")
      return "bg-green-100 text-green-700 border border-green-300";
    if (status === "Birthday")
      return "bg-red-100 text-red-700 border border-red-300";
    if (status === "Event")
      return "bg-blue-100 text-blue-700 border border-blue-300";
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

  const getLegendCardClasses = (legend) => {
    switch (legend) {
      case "Today":
        return "bg-orange-50 border-orange-200";
      case "Holiday":
        return "bg-green-50 border-green-200";
      case "Birthday":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const eventLogs = useMemo(() => {
    const year = Number(monthKey.slice(0, 4));
    const month = Number(monthKey.slice(5, 7));
    const savedEvents = (attendanceData?.logs ?? []).map((log) => ({
      ...log,
      legend: normalizeEventLegend(log.status),
    }));
    const holidayEvents = HOLIDAYS
      .filter((holiday) => MONTH_ABBREVIATIONS[month - 1] === holiday.month)
      .map((holiday) => {
        const dateKey = `${monthKey}-${holiday.day}`;
        return {
          title: holiday.name,
          dateKey,
          date: formatEventDate(dateKey),
          time: "---",
          status: "Holiday",
          legend: "Holiday",
        };
      });
    const birthdayEvents = (studentsData?.students ?? []).flatMap((student) => {
      const birthday = getBirthdayMonthAndDay(student.birthday);
      if (!birthday || birthday.month !== month) return [];
      if (new Date(year, month - 1, birthday.day).getMonth() !== month - 1) {
        return [];
      }

      const dateKey = `${monthKey}-${String(birthday.day).padStart(2, "0")}`;
      return [{
        title: `${formatStudentName(student)}'s Birthday`,
        dateKey,
        date: formatEventDate(dateKey),
        time: "---",
        status: "Birthday",
        legend: "Birthday",
      }];
    });

    return [...savedEvents, ...holidayEvents, ...birthdayEvents].sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey),
    );
  }, [attendanceData, monthKey, studentsData]);

  const showDayDetails = (day) => {
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
    const date = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    setEventDetails({
      date,
      events: eventLogs.filter((event) => event.dateKey === dateKey),
    });
  };

  const showLogDetails = (event) => {
    setEventDetails({ date: event.date, events: [event] });
  };

  const closeEventForm = () => {
    setShowAddEventModal(false);
    setEventToEdit(null);
  };

  const saveEvent = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    closeEventForm();
  };

  const removeEvent = async () => {
    if (!eventToDelete || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiClient.deleteEvent(eventToDelete.id);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventToDelete(null);
    } catch (err) {
      setDeleteError(err?.details?.message || "Failed to delete event. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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
            {days.map((day, idx) =>
              day ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => showDayDetails(day)}
                  aria-label={`Show events for ${monthName} ${day}`}
                  className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition cursor-pointer ${getDayColor(
                    day,
                  )} ${getDayBorder(day)} hover:shadow-md`}
                >
                  {day}
                </button>
              ) : (
                <div key={idx} className="aspect-square bg-transparent" />
              ),
            )}
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
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300"></div>
                <span className="text-xs text-gray-600">Event</span>
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
                key={log.id ?? `${log.dateKey}-${idx}`}
                className={`flex items-start gap-2 p-3 rounded-lg border transition hover:shadow-sm ${getLegendCardClasses(
                  log.legend,
                )}`}
              >
                <button
                  type="button"
                  onClick={() => showLogDetails(log)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                  aria-label={`View ${log.title || log.legend} details`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-800 text-sm">
                        {log.title || log.legend}
                      </span>
                      <span className="mt-1 block text-xs text-gray-600">
                        {log.date}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2 py-1 rounded ${getLegendBadgeClasses(
                        log.legend,
                      )}`}
                    >
                      {log.legend}
                    </span>
                  </span>
                  {log.time !== "---" && (
                    <span className="mt-2 block text-xs text-gray-600">
                      <span className="font-medium">Time:</span> {log.time}
                    </span>
                  )}
                </button>
                {log.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEventToEdit(log);
                        setShowAddEventModal(true);
                      }}
                      className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white/70 hover:text-[#C2570C]"
                      aria-label={`Edit ${log.title || "event"}`}
                      title="Edit event"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEventToDelete(log);
                        setDeleteError("");
                      }}
                      className="cursor-pointer rounded p-1.5 text-red-600 transition hover:bg-white/70 hover:text-red-700"
                      aria-label={`Delete ${log.title || "event"}`}
                      title="Delete event"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {(showAddEventModal || eventToEdit) && (
        <AddEventModal
          eventToEdit={eventToEdit}
          onCancel={closeEventForm}
          onSaved={saveEvent}
        />
      )}

      {eventToDelete && (
        <Modal
          onClose={() => !deleting && setEventToDelete(null)}
          labelledBy="delete-event-title"
        >
          <div className="p-6">
            <h2 id="delete-event-title" className="text-lg font-bold text-gray-900">
              Delete Event?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete “{eventToDelete.title || eventToDelete.legend}”.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deleting}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeEvent}
                disabled={deleting}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {eventDetails && (
        <EventDetailsModal
          details={eventDetails}
          onClose={() => setEventDetails(null)}
        />
      )}
    </div>
  );
}
