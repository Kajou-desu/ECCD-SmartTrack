import formatStudentName from "@utils/formatStudentName.js";

// Colour is never the only signal: each state also has a letter (month) or a
// word (week), and a tooltip / accessible label.
const STATES = {
  present: { label: "Present", letter: "P", style: "bg-green-100 text-green-700" },
  late: { label: "Late", letter: "L", style: "bg-purple-100 text-purple-700" },
  absent: { label: "Absent", letter: "A", style: "bg-red-100 text-red-700" },
  excused: { label: "Excused", letter: "E", style: "bg-amber-100 text-amber-700" },
};

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600" aria-label="Legend">
      {Object.values(STATES).map((state) => (
        <li key={state.label} className="flex items-center gap-1.5">
          <span className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${state.style}`} aria-hidden="true">
            {state.letter}
          </span>
          {state.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold text-gray-400" aria-hidden="true">
          –
        </span>
        Not recorded
      </li>
    </ul>
  );
}

function Cell({ state, period }) {
  const info = STATES[state];
  if (!info) {
    return (
      <span className="text-gray-300" title="Not recorded" aria-label="Not recorded">
        –
      </span>
    );
  }
  if (period === "week") {
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${info.style}`}>{info.label}</span>;
  }
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${info.style}`}
      title={info.label}
      aria-label={info.label}
    >
      {info.letter}
    </span>
  );
}

export default function AttendancePeriodTable({ table, period, caption }) {
  const isWeek = period === "week";

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Legend />

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-40 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Student
              </th>
              {table.columns.map((column) => (
                <th
                  key={column.date}
                  scope="col"
                  className={`px-2 py-3 text-center text-xs font-semibold text-gray-600 ${isWeek ? "min-w-24" : "min-w-10"}`}
                >
                  {isWeek ? (
                    <>
                      <span className="block uppercase tracking-wide">{column.weekday}</span>
                      <span className="block font-normal text-gray-500">
                        {new Date(`${column.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block">{column.day}</span>
                      <span className="block font-normal text-gray-500">{column.weekday.charAt(0)}</span>
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {table.rows.map((row) => (
              <tr key={row.studentId} className="hover:bg-gray-50">
                <th
                  scope="row"
                  className="sticky left-0 z-10 max-w-56 truncate bg-white px-4 py-2.5 text-left font-medium text-gray-800"
                >
                  {formatStudentName(row.name) || "Unknown Student"}
                </th>
                {row.cells.map((state, index) => (
                  <td key={table.columns[index].date} className="px-2 py-2.5 text-center">
                    <Cell state={state} period={period} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
