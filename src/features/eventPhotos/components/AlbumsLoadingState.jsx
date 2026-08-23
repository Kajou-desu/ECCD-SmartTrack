export default function AlbumsLoadingState({ count = 6 }) {
  return (
    <section
      aria-label="Loading photo albums"
      aria-busy="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-4/3 w-full bg-slate-200" />

          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </section>
  );
}
