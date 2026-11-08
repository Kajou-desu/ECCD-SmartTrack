const SESSION_FILTERS = [
  { value: "all", label: "All" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
];

export default function SessionFilter({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Filter student works by session"
      className="flex w-full rounded-xl border border-slate-300 bg-white p-1 sm:w-auto"
    >
      {SESSION_FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
            value === option.value ? "bg-[#C2570C] text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
