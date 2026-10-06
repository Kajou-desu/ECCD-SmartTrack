import { address } from "@constants/address.js";

const fields = [
  { suffix: "Province", label: "Province", options: address.Province },
  {
    suffix: "Municipality",
    label: "Municipality / City",
    options: Object.values(address.City).flat(),
  },
  { suffix: "Barangay", label: "Barangay" },
  { suffix: "Details", label: "Purok / House # / Street" },
];

export default function AddressFields({
  label = "Address",
  baseKey,
  values,
  onChange,
  onBlur,
  error,
  required = false,
}) {
  const inputClass = `w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
  }`;

  return (
    <div>
      <p className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ suffix, label: fieldLabel, options }) => {
          const name = `${baseKey}${suffix}`;
          const listId = `${name}-options`;
          return (
            <div key={suffix}>
              <label htmlFor={name} className="mb-1 block text-xs font-semibold text-slate-600">
                {fieldLabel}
                {required && suffix !== "Details" && <span className="text-red-500"> *</span>}
              </label>
              <input
                id={name}
                name={name}
                value={values[name] || ""}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={`Select or enter ${fieldLabel.toLowerCase()}`}
                aria-label={`${label} — ${fieldLabel}`}
                list={options?.length ? listId : undefined}
                required={required && suffix !== "Details"}
                className={inputClass}
              />
              {options?.length ? (
                <datalist id={listId}>
                  {options.map((option) => <option key={option} value={option} />)}
                </datalist>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
