export default function StudentPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">&lt;</button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button key={page} type="button" onClick={() => onPageChange(page)} aria-label={`Go to page ${page}`} className={`rounded-lg px-3 py-1.5 transition ${currentPage === page ? "bg-[#C2570C] text-white" : "border border-gray-200 bg-white hover:bg-gray-50"}`}>{page}</button>
      ))}

      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page" className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">&gt;</button>
    </div>
  );
}
