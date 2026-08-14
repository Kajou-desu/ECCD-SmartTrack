export default function SessionOption({ label, description, value, checked, onChange }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${checked ? "border-[#C2570C] bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <input type="radio" name="session" value={value} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#C2570C]" />

      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}
