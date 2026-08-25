import { AlertCircle, Pencil, Utensils, Accessibility } from "lucide-react";
import MedicalCard from "./MedicalCard";

export default function MedicalNotesCard({ medical, onEdit }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Medical & Special Notes
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 cursor-pointer text-[#C2570C] hover:text-orange-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Edit Medical Notes"
        >
          <Pencil size={18} />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <MedicalCard
          icon={<AlertCircle size={20} className="text-red-600" />}
          colorClass="border-red-200 bg-red-50"
          title="Allergies"
          subtitle={medical.allergies}
          description={medical.allergiesDetail}
        />
        <MedicalCard
          icon={<Utensils size={20} className="text-blue-600" />}
          colorClass="border-blue-200 bg-blue-50"
          title="Dietary Notes"
          subtitle={medical.dietary}
          description={medical.dietaryDetail}
        />
        <MedicalCard
          icon={<Accessibility size={20} className="text-purple-600" />}
          colorClass="border-purple-200 bg-purple-50"
          title="Learning Accommodations"
          subtitle={medical.accommodations}
          description={medical.accommodationsDetail}
        />
      </div>
    </div>
  );
}
