import { DAILY_THEME } from "@data/mockData";
import { ArrowRight, CircleCheck } from "lucide-react";

export function DailyThemeCard() {
  const theme = DAILY_THEME;

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col md:flex-row h-full">
        {/* Right Panel */}
        <div className="flex min-w-45 flex-col items-center justify-center bg-[#e5eeff] p-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-md">
            <span className="text-6xl font-extrabold text-[#C2570C]">
              {theme.letter}
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-orange-700">
            {theme.label}
          </p>
          <p className="mt-1 text-center text-sm text-orange-600">
            {theme.subtitle}
          </p>
        </div>

        {/* Left Panel */}
        <div className="flex flex-1 flex-col gap-4 p-6 min-h-0 overflow-y-auto">
          <div className="self-start rounded-full bg-orange-100 px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#C2570C]">
              Today's Theme
            </span>
          </div>
          <div className="flex flex-col gap-2 my-auto">
            <h2 className="text-2xl font-bold text-gray-800">{theme.title}</h2>
            <p className="text-sm leading-6 text-gray-600">
              {theme.description}
            </p>
            <div className="space-y-3">
              {theme.objectives.map((objective, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C2570C]" />
                  <p className="text-sm leading-6 text-gray-700">{objective}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-[#C2570C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#a94709] sm:w-auto"
          >
            <span className="text-sm">View Lesson</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
