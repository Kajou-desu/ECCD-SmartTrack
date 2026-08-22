export default function MaterialsLoadingState({ count = 8 }) {
  return (
    <section
      aria-label="Loading learning materials"
      aria-busy="true"
      className="grid grid-cols-2 gap-2 sm:gap-6 sm:px-8 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-75 sm:h-85 w-full bg-slate-200" />

          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="hidden h-3 w-full rounded bg-slate-100 sm:block" />
            <div className="mt-1 h-9 w-full rounded-lg bg-slate-200" />
            <div className="h-9 w-full rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </section>
  );
}
