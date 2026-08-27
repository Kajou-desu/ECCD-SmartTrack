import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { X } from "lucide-react";

export default function EditMedicalModal({
  medical,
  onCancel,
  onSave,
  hideAccommodations = false,
}) {
  const [form, setForm] = useState({
    allergies: medical.allergies || "",
    allergiesDetail: medical.allergiesDetail || "",
    dietary: medical.dietary || "",
    dietaryDetail: medical.dietaryDetail || "",
    accommodations: medical.accommodations || "",
    accommodationsDetail: medical.accommodationsDetail || "",
  });

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <Modal onClose={onCancel} labelledBy="edit-medical-title">
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="edit-medical-title"
              className="text-lg font-bold text-slate-900"
            >
              Edit Medical & Special Notes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {hideAccommodations
                ? "Keep allergy and dietary details up to date."
                : "Keep allergy, dietary, and accommodation details up to date."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">
              Allergies (summary)
              <input
                type="text"
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
                placeholder="e.g. None, Peanuts"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Dietary Notes (summary)
              <input
                type="text"
                value={form.dietary}
                onChange={(e) => update("dietary", e.target.value)}
                placeholder="e.g. Regular Diet"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-600">
            Allergies (details)
            <textarea
              value={form.allergiesDetail}
              onChange={(e) => update("allergiesDetail", e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-600">
            Dietary Notes (details)
            <textarea
              value={form.dietaryDetail}
              onChange={(e) => update("dietaryDetail", e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {!hideAccommodations && (
            <>
              <label className="block text-xs font-semibold text-slate-600">
                Learning Accommodations (summary)
                <input
                  type="text"
                  value={form.accommodations}
                  onChange={(e) => update("accommodations", e.target.value)}
                  placeholder="e.g. Standard Classroom"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Learning Accommodations (details)
                <textarea
                  value={form.accommodationsDetail}
                  onChange={(e) =>
                    update("accommodationsDetail", e.target.value)
                  }
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Changes" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
