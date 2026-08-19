import { Plus, FileText } from "lucide-react";

export default function EmptyMaterialsState({ onAddMaterial }) {
  return (
    <section className="flex min-h-96 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
        aria-hidden="true"
      >
        <FileText size={32} className="text-orange-600" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No learning materials yet
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Start building your resource library by adding your first learning
        material.
      </p>

      <button
        type="button"
        onClick={onAddMaterial}
        className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-[#C2570C] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
      >
        <Plus size={18} aria-hidden="true" />
        Add Material
      </button>
    </section>
  );
}
