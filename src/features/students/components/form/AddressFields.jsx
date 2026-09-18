export default function AddressFields({
  label = "Address",
  purokName,
  barangayName,
  purokValue,
  barangayValue,
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
        <input
          id={purokName}
          name={purokName}
          value={purokValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Purok"
          aria-label={`${label} — Purok`}
          className={inputClass}
        />

        <input
          id={barangayName}
          name={barangayName}
          value={barangayValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Barangay"
          aria-label={`${label} — Barangay`}
          className={inputClass}
        />
      </div>

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
