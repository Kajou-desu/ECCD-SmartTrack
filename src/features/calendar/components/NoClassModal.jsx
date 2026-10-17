import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@components/ui/Modal";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-4 focus:ring-[#C2570C]/10";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1";

// Marks one day, or a range of days, as "no class". Weekends inside a range
// are skipped by the server (they are not school days anyway).
export default function NoClassModal({ initialDate = "", onCancel, onSaved }) {
  const [from, setFrom] = useState(initialDate);
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const rangeBackwards = Boolean(from && to && to < from);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!from || rangeBackwards || saving) return;

    setSaving(true);
    setError("");
    try {
      const result = await apiClient.createNoClassDays({
        from,
        ...(to ? { to } : {}),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      onSaved(result);
    } catch (err) {
      setError(getErrorMessage(err, "Could not set the no-class days. Please try again."));
      setSaving(false);
    }
  };

  return (
    <Modal onClose={saving ? () => {} : onCancel} labelledBy="no-class-title">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 id="no-class-title" className="text-base font-bold text-gray-900">
          Set No Class
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Mark a day, or a range of days, when there is no class. Saturdays and Sundays are skipped.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="no-class-from" className={labelClass}>
              From <span className="text-red-600">*</span>
            </label>
            <input id="no-class-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="no-class-to" className={labelClass}>
              To (optional)
            </label>
            <input id="no-class-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </div>
        </div>
        {rangeBackwards && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            The last day can&apos;t be before the first day.
          </p>
        )}

        <div className="mt-3">
          <label htmlFor="no-class-reason" className={labelClass}>
            Reason (optional)
          </label>
          <input
            id="no-class-reason"
            type="text"
            value={reason}
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
            placeholder="e.g. Typhoon, teachers' meeting"
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!from || rangeBackwards || saving}
            className="cursor-pointer rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : (
              "Set No Class"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
