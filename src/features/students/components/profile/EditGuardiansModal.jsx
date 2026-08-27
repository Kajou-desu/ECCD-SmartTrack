import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { X, Trash2, Plus } from "lucide-react";

function splitAddress(address) {
  if (!address) return { street: "", barangay: "" };
  const [street = "", ...rest] = address.split(",");
  return { street: street.trim(), barangay: rest.join(",").trim() };
}

function toFormGuardian(guardian) {
  const { street, barangay } = splitAddress(guardian.address);
  return {
    ...guardian,
    street: guardian.street ?? street,
    barangay: guardian.barangay ?? barangay,
  };
}

function makeEmptyGuardian() {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "",
    name: "",
    phone: "",
    email: "",
    street: "",
    barangay: "",
    isPrimary: false,
  };
}

const PARENT_TYPES = ["Mother", "Father"];
const LEGAL_GUARDIAN_TYPE = "Legal Guardian";
const MAX_PARENTS = 2;
const MAX_LEGAL_GUARDIANS = 2;
const MAX_TOTAL_GUARDIANS = MAX_PARENTS + MAX_LEGAL_GUARDIANS;

export default function EditGuardiansModal({ guardians, onCancel, onSave }) {
  const [rows, setRows] = useState(() =>
    guardians && guardians.length > 0
      ? guardians.map(toFormGuardian)
      : [makeEmptyGuardian()],
  );
  const [formError, setFormError] = useState("");

  const updateRow = (index, field, value) => {
    if (field === "type") {
      const otherRows = rows.filter((_, i) => i !== index);
      const parentCount = otherRows.filter((row) =>
        PARENT_TYPES.includes(row.type),
      ).length;
      const legalCount = otherRows.filter(
        (row) => row.type === LEGAL_GUARDIAN_TYPE,
      ).length;

      if (PARENT_TYPES.includes(value) && parentCount >= MAX_PARENTS) {
        setFormError(
          "Only up to 2 parents (Mother/Father) can be added per student.",
        );
        return;
      }

      if (value === LEGAL_GUARDIAN_TYPE && legalCount >= MAX_LEGAL_GUARDIANS) {
        setFormError("Only up to 2 legal guardians can be added per student.");
        return;
      }

      setFormError("");
    }

    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const setPrimary = (index) => {
    setRows((current) =>
      current.map((row, i) => ({ ...row, isPrimary: i === index })),
    );
  };

  const removeRow = (index) => {
    setFormError("");
    setRows((current) => current.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (rows.length >= MAX_TOTAL_GUARDIANS) {
      setFormError(
        `You can only add up to ${MAX_TOTAL_GUARDIANS} guardians (2 parents and 2 legal guardians).`,
      );
      return;
    }
    setFormError("");
    setRows((current) => [...current, makeEmptyGuardian()]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(
      rows
        .filter((row) => row.name.trim())
        .map(({ street, barangay, ...row }) => ({
          ...row,
          name: row.name.trim(),
          address: [street.trim(), barangay.trim()].filter(Boolean).join(", "),
        })),
    );
  };

  return (
    <Modal
      onClose={onCancel}
      labelledBy="edit-guardians-title"
      className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="edit-guardians-title"
              className="text-lg font-bold text-slate-900"
            >
              Edit Guardian Details
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Update contact information for this student's guardians.
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {formError}
            </p>
          )}

          {rows.map((row, index) => (
            <fieldset
              key={row.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <legend className="px-1 text-sm font-semibold text-slate-700">
                  Guardian {index + 1}
                </legend>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label={`Remove guardian ${index + 1}`}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Relationship <span className="text-red-500">*</span>
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(index, "type", e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="" disabled>
                      Select relationship
                    </option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Full Name <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(index, "name", e.target.value)}
                    required
                    placeholder="Full name"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Phone <span className="text-red-500">*</span>
                  <input
                    type="tel"
                    value={row.phone}
                    onChange={(e) => updateRow(index, "phone", e.target.value)}
                    required
                    placeholder="09XX-XXX-XXXX"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Email
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(index, "email", e.target.value)}
                    placeholder="name@email.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Street/Purok <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={row.street}
                    onChange={(e) => updateRow(index, "street", e.target.value)}
                    required
                    placeholder="e.g. Purok 1"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Barangay <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={row.barangay}
                    onChange={(e) =>
                      updateRow(index, "barangay", e.target.value)
                    }
                    required
                    placeholder="e.g. Poblacion"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              </div>

              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="radio"
                  name="primary-guardian"
                  checked={row.isPrimary === true}
                  onChange={() => setPrimary(index)}
                  className="h-4 w-4 accent-[#C2570C]"
                />
                Primary guardian
              </label>
            </fieldset>
          ))}

          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_TOTAL_GUARDIANS}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition hover:border-orange-400 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
          >
            <Plus size={16} />
            {rows.length >= MAX_TOTAL_GUARDIANS
              ? "Maximum guardians reached (2 parents, 2 legal guardians)"
              : "Add another guardian"}
          </button>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Changes" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
