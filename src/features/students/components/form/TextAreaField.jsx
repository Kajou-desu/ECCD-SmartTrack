export default function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>

      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        rows={4}
        className={`w-full resize-y rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
        }`}
      />

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
