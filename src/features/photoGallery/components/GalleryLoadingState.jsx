export default function GalleryLoadingState({ count = 10 }) {
  return (
    <section
      aria-label="Loading photos"
      aria-busy="true"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse rounded-lg bg-slate-200"
        />
      ))}
    </section>
  );
}
