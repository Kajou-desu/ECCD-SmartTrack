import { PrimaryButton } from "@components/ui/Button";
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

      <PrimaryButton
        icon={<Plus className="h-5 w-5" aria-hidden="true" />}
        label="Add Material"
        onClick={onAddMaterial}
      />
    </section>
  );
}
