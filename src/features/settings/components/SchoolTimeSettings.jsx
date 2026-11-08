import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useAuth } from "@hooks/useAuth.js";
import { isAdmin } from "@auth/permissions.js";
import CenterSelect from "@features/centers/components/CenterSelect.jsx";
import { SCHOOL_TIME_FIELDS, formatClock12, pickSchoolTimes, schoolTimesProblem } from "../utils/schoolTimes.js";

const SESSIONS = [
  { title: "Morning session", start: "morningStart", end: "morningEnd" },
  { title: "Afternoon session", start: "afternoonStart", end: "afternoonEnd" },
];
const LABELS = {
  morningStart: "Morning starts",
  morningEnd: "Morning ends",
  afternoonStart: "Afternoon starts",
  afternoonEnd: "Afternoon ends",
};

// School hours for one center. A student counts as late when they arrive after
// the start time of their session. A Teacher edits their own center's times; an
// Admin has no center of their own, so they choose one first. The server decides
// which center a Teacher means (anything sent for it is ignored).
export default function SchoolTimeSettings({ onNotify }) {
  const { user } = useAuth();
  const admin = isAdmin(user?.role);
  const [centerId, setCenterId] = useState("");
  const needsCenter = admin && centerId === "";
  const queryKey = ["schoolTimes", admin ? centerId : "own"];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => apiClient.getSchoolTimes(admin ? Number(centerId) : undefined),
    enabled: !needsCenter,
  });

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Clock aria-hidden="true" className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">School Times</h2>
        </div>
        <p className="text-sm text-gray-600">
          A student is marked late when they arrive after the start time of their session.
        </p>
      </div>

      {admin && <CenterSelect id="school-times-center" value={centerId} onChange={setCenterId} />}

      {needsCenter && <p className="mt-4 text-sm text-gray-500">Choose a center to see its school times.</p>}
      {!needsCenter && isLoading && (
        <p role="status" className="mt-4 text-sm text-gray-500">Loading school times...</p>
      )}
      {!needsCenter && isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">School times couldn't be loaded. Please try again.</p>
      )}
      {data && (
        // Keyed by what the server holds, so the form restarts from it whenever
        // another center is chosen or a save comes back.
        <SchoolTimesForm
          key={`${data.centerId}|${SCHOOL_TIME_FIELDS.map((field) => data[field]).join("|")}`}
          saved={data}
          queryKey={queryKey}
          admin={admin}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

function SchoolTimesForm({ saved, queryKey, admin, onNotify }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => pickSchoolTimes(saved));
  const [problem, setProblem] = useState("");

  const save = useMutation({
    mutationFn: (next) => apiClient.updateSchoolTimes({ ...next, ...(admin ? { centerId: saved.centerId } : {}) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      // Who counts as late depends on these times, so what is already on screen is stale.
      for (const key of ["attendance", "attendanceRange", "dashboardStats"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onNotify?.("success", "School times were saved.");
    },
    onError: (err) => setProblem(getErrorMessage(err, "School times couldn't be saved. Please try again.")),
  });

  const change = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setProblem("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    const found = schoolTimesProblem(values);
    setProblem(found);
    if (!found) save.mutate(values);
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-6">
      {saved.isDefault && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No times have been saved for this center yet, so the standard start times apply: morning at{" "}
          {formatClock12(saved.morningStart)} and afternoon at {formatClock12(saved.afternoonStart)}.
        </p>
      )}

      {SESSIONS.map(({ title, start, end }) => (
        <fieldset key={title} className="min-w-0">
          <legend className="mb-3 text-base font-semibold text-gray-900">{title}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {[start, end].map((field) => (
              <div key={field}>
                <label htmlFor={`school-time-${field}`} className="mb-2 block text-sm font-semibold text-slate-700">
                  {LABELS[field]}
                </label>
                <input
                  id={`school-time-${field}`}
                  type="time"
                  step="60"
                  required
                  value={values[field]}
                  onChange={change(field)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      {problem && <p role="alert" className="text-sm text-red-600">{problem}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a94709] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending && <Loader2 aria-hidden="true" size={15} className="animate-spin" />}
          {save.isPending ? "Saving..." : "Save school times"}
        </button>
      </div>
    </form>
  );
}
