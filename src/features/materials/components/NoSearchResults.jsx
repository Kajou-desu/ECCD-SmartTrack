import { Search } from "lucide-react";

export default function NoSearchResults({ query, onClearSearch }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Search size={28} className="text-slate-500" aria-hidden="true" />

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No materials found
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        No learning materials match &quot;{query}&quot;.
      </p>

      <button
        type="button"
        onClick={onClearSearch}
        className="mt-5 cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Clear Search
      </button>
    </div>
  );
}
