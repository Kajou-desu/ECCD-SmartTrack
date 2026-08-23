import { RefreshCw, Sparkles, AlertTriangle } from "lucide-react";

export function ProgressLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading progress data"
      className="animate-pulse space-y-6"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
          >
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="mt-3 h-6 w-10 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-48 rounded-3xl border border-gray-200 bg-white" />
    </div>
  );
}

export function ProgressEmptyState({ childName }) {
  return (
    <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50"
        aria-hidden="true"
      >
        <Sparkles size={32} className="text-blue-600" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No progress data yet for {childName}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Activities, milestones, and weekly goals will appear here once{" "}
        {childName}'s teacher starts logging progress.
      </p>
    </div>
  );
}

export function ProgressErrorState({ onRetry }) {
  return (
    <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-red-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-50"
        aria-hidden="true"
      >
        <AlertTriangle size={32} className="text-red-600" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Couldn't load progress data
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Something went wrong while fetching this section. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
