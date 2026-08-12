import { useState } from "react";
import { CalendarFold, Cake } from "lucide-react";
import { getAllStudentsData } from "../../data/mockData.js";
import { HOLIDAYS } from "../../constants/holidays.js";

export function EventCard() {
  const [selectedEvent, setSelectedEvent] = useState("birthdays");

  const currentMonth = new Date().getMonth();

  // Get data for student
  const birthdays = getAllStudentsData()
    .map(({ student }) => ({
      id: student.id,
      name: student.name,
      date: student.birthday,
      photo: student.photo,
    }))
    .sort((a, b) => {
      const monthA = new Date(a.date).getMonth();
      const monthB = new Date(b.date).getMonth();
      const distanceA = (monthA - currentMonth + 12) % 12;
      const distanceB = (monthB - currentMonth + 12) % 12;
      return distanceA - distanceB;
    });

  const hasBirthdays = birthdays.length > 0;
  const hasHolidays = HOLIDAYS.length > 0;

  const displayedEvents = selectedEvent === "birthdays" ? birthdays : HOLIDAYS;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:h-full">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2">
        <CalendarFold className="h-6 w-6 text-[#C2570C]" />
        <h4 className="text-lg font-semibold text-gray-800 sm:text-xl">
          Events
        </h4>
      </div>

      {/* Filter Button */}
      <div className="flex shrink-0 gap-2" role="group" aria-label="Event type">
        {/* Birthday */}
        <button
          type="button"
          aria-pressed={selectedEvent === "birthdays"}
          onClick={() => setSelectedEvent("birthdays")}
          className={`w-full cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedEvent === "birthdays"
              ? "bg-[#C2570C] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Birthdays
        </button>
        {/* Holidays */}
        <button
          type="button"
          aria-pressed={selectedEvent === "holidays"}
          onClick={() => setSelectedEvent("holidays")}
          className={`w-full cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedEvent === "holidays"
              ? "bg-[#C2570C] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Holidays
        </button>
      </div>

      {/* Event item list */}
      <div className="min-h-0 max-h-80 flex-1 space-y-2 overflow-y-auto pr-2 lg:max-h-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {selectedEvent === "birthdays" ? (
          hasBirthdays ? (
            displayedEvents.map((birthday) => (
              <div
                key={birthday.id}
                className="flex items-center gap-4 rounded-lg bg-orange-50 p-3 transition-colors duration-200 hover:bg-orange-100"
              >
                <img
                  src={birthday.photo || "https://placehold.co/40x40"}
                  alt={birthday.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {birthday.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(birthday.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <Cake className="h-5 w-5 shrink-0 text-[#C2570C]" />
              </div>
            ))
          ) : (
            <div className="flex h-24 items-center justify-center">
              <p className="text-sm italic text-gray-400">No birthdays found</p>
            </div>
          )
        ) : hasHolidays ? (
          displayedEvents.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3 transition-colors duration-200 hover:bg-slate-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {holiday.name}
                </p>

                <p className="text-xs text-gray-500">
                  {holiday.month} {holiday.day}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm italic text-gray-400">
              No upcoming holidays found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
