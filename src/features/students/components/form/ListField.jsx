import { Plus, Trash2 } from "lucide-react";

export default function ListField({ title, items, placeholder, onChange, onRemove, onAdd, addLabel }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((value, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={placeholder}
                rows={2}
                aria-label={`${title} entry ${index + 1}`}
                className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
              />

              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${title.toLowerCase()} entry ${index + 1}`}
                className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition hover:border-[#C2570C]/60 hover:text-[#C2570C]"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
  );
}
