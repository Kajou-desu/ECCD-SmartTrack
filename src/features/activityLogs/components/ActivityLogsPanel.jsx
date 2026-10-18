import { useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText, Search } from "lucide-react";

import LoadingState from "@components/shared/LoadingState";
import useActivityLogs from "@features/activityLogs/hooks/useActivityLogs.js";
import {
  CATEGORY_OPTIONS,
  EMPTY_FILTERS,
  PAGE_SIZE,
  categoryLabel,
  formatLogTime,
  isRangeValid,
  totalPages,
} from "@features/activityLogs/utils/activityLogs.js";

const FIELD =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

// The Admin's activity trail, shown in Settings > Logs.
export default function ActivityLogsPanel() {
  // `draft` is what the controls show; `filters` is what was applied, so the
  // table doesn't refetch on every keystroke.
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching, refetch } = useActivityLogs(filters, page);

  const rangeOk = isRangeValid(draft);
  const set = (key) => (event) => setDraft((d) => ({ ...d, [key]: event.target.value }));

  const apply = (event) => {
    event.preventDefault();
    if (!rangeOk) return;
    setFilters(draft);
    setPage(1);
  };
  const clear = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const logs = data?.logs ?? [];
  const pages = totalPages(data?.total, PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ScrollText aria-hidden="true" className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Activity Logs</h2>
        </div>
        <p className="text-sm text-gray-600">
          Who signed in, added, changed, removed or exported records. Entries can&apos;t be edited or deleted here.
        </p>
      </div>

      <form onSubmit={apply} className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Type
          <select aria-label="Type" className={FIELD} value={draft.category} onChange={set("category")}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          From
          <input aria-label="From" type="date" className={FIELD} value={draft.from} onChange={set("from")} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          To
          <input aria-label="To" type="date" className={FIELD} value={draft.to} onChange={set("to")} />
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-gray-600">
          Search
          <input
            aria-label="Search"
            type="search"
            maxLength={100}
            placeholder="Name, email or action"
            className={FIELD}
            value={draft.q}
            onChange={set("q")}
          />
        </label>
        <button
          type="submit"
          disabled={!rangeOk}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={14} />
          Apply
        </button>
        <button type="button" onClick={clear} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
          Clear
        </button>
        {!rangeOk && (
          <p role="alert" className="w-full text-xs font-semibold text-red-600">
            The start date must not be after the end date.
          </p>
        )}
      </form>

      {isPending ? (
        <LoadingState message="Loading activity..." />
      ) : isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          Couldn&apos;t load the activity logs.{" "}
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            Try again
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No activity matches these filters.
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border border-gray-200 bg-white ${isFetching ? "opacity-70" : ""}`}>
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">When</th>
                <th scope="col" className="px-4 py-3">Who</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">What happened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatLogTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{log.actorEmail}</div>
                    <div className="text-xs text-gray-500">{log.actorRole}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{categoryLabel(log.action)}</td>
                  <td className="px-4 py-3 text-gray-800">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isError && !isPending && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {data?.total ?? 0} entr{data?.total === 1 ? "y" : "ies"} · Page {page} of {pages}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight size={14} />
            </button>
          </span>
        </nav>
      )}
    </div>
  );
}
