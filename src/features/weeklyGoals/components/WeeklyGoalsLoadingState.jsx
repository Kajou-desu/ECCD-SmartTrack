export default function WeeklyGoalsLoadingState({ count = 6 }) {
  return (
    <section
      aria-label="Loading weekly goals"
      aria-busy="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="h-2 w-full rounded-full bg-slate-100" />
          <div className="h-8 w-full rounded-lg bg-slate-100" />
        </div>
      ))}
    </section>
  );
}
