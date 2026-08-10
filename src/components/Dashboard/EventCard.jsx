import { CalendarFold, Cake } from "lucide-react";

export function EventCard({ events }) {
  const hasBirthdays = events.birthdays.length > 0;
  const hasHolidays = events.holidays.length > 0;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm p-6 gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-full">
      <div className="flex items-center gap-2">
        <div>
          <CalendarFold className="text-[#C2570C] h-6 w-6" />
        </div>
        <h4 className="font-semibold text-lg sm:text-xl text-gray-800">Events</h4>
      </div>

      <div className="max-h-80 lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        <div className="space-y-2">
          <h6 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Birthdays</h6>
          {hasBirthdays ? (
            events.birthdays.map((birthday) => (
              <div
                key={birthday.id}
                className="flex items-center gap-4 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
              >
                <img
                  src="https://placehold.co/40x40"
                  alt={birthday.name}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{birthday.name}</p>
                  <p className="text-xs text-gray-500">{birthday.date}</p>
                </div>
                <Cake className="h-5 w-5 text-[#C2570C] shrink-0" />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No birthdays this week</p>
          )}
        </div>

        <div className="h-px bg-gray-200" />

        <div className="space-y-2">
          <h6 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Holidays</h6>
          {hasHolidays ? (
            events.holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between gap-4 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{holiday.name}</p>
                  <p className="text-xs text-gray-500">{holiday.month} {holiday.day}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No upcoming holidays found</p>
          )}
        </div>
      </div>
    </div>
  );
}
