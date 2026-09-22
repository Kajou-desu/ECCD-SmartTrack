import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ErrorMsg from "@components/ui/ErrorMsg";
import { PrimaryButton } from "@components/ui/Button";
import { useStudentBleDevices } from "../hooks/useStudentBleDevices.js";
import { describeTagError, normalizeTagAddress } from "../utils/bleTag.js";

export default function StudentBleDevicesCard({ studentId }) {
  const { devices, isLoading, isError, add, toggle, remove, isBusy } = useStudentBleDevices(studentId);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const handleAdd = async (event) => {
    event.preventDefault();
    const normalized = normalizeTagAddress(address);
    if (!normalized) {
      setError(describeTagError({ status: 400 }));
      return;
    }
    setError("");
    try {
      await add.mutateAsync(normalized);
      setAddress("");
    } catch (err) {
      setError(describeTagError(err));
    }
  };

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(describeTagError(err));
    }
  };

  return (
    <section aria-label="Attendance tag" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-gray-800">Attendance tag</h2>
      <p className="mt-1 max-w-prose text-sm text-gray-600">
        The Bluetooth tag this child carries, for example on their bag. A child is marked present automatically
        when their tag and their face are both seen at the door.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorMsg message={error} onClose={() => setError("")} />
        </div>
      )}
      {isError && !error && (
        <div className="mt-4">
          <ErrorMsg message="Tags couldn't be loaded. Reload the page to try again." onClose={() => {}} />
        </div>
      )}

      {isLoading ? (
        <p role="status" className="mt-6 text-sm text-gray-500">Loading tags…</p>
      ) : devices.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-5 text-sm text-gray-500">
          No tag registered yet. Add the address of the tag this child will carry.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100">
          {devices.map((device) => (
            <li key={device.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-medium text-gray-800">{device.deviceIdentifier}</p>
                <p className="text-xs text-gray-500">{device.enabled ? "Active" : "Paused, not used for attendance"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => run(() => toggle.mutateAsync({ deviceId: device.id, enabled: !device.enabled }))}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {device.enabled ? "Pause" : "Resume"}
                </button>
                {confirmingId === device.id ? (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => run(async () => { await remove.mutateAsync(device.id); setConfirmingId(null); })}
                      className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove tag
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C]"
                    >
                      Keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmingId(device.id)}
                    aria-label={`Remove tag ${device.deviceIdentifier}`}
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor={`tag-address-${studentId}`} className="mb-1 block text-sm font-medium text-gray-700">
            Tag address
          </label>
          <input
            id={`tag-address-${studentId}`}
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="D7:40:47:15:14:90"
            autoComplete="off"
            spellCheck={false}
            maxLength={17}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-800 outline-none focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/30"
          />
        </div>
        <PrimaryButton
          type="submit"
          icon={<Plus className="h-5 w-5" />}
          label="Add tag"
          disabled={isBusy || address.trim() === ""}
          className="sm:mt-6"
        />
      </form>
    </section>
  );
}
