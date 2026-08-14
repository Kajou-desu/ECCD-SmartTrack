import { Eye, Pencil } from "lucide-react";

export default function StudentMobileList({ students = [], onView, onEdit }) {
  if (!students || students.length === 0) {
    return (
      <div className="space-y-3 p-4 text-sm text-gray-500">No students to show.</div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((s) => (
        <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-800">{s.name}</p>
              <p className="mt-1 text-xs text-gray-500">ID: {s.id} • {s.session === "afternoon" ? "PM" : "AM"}</p>
              <p className="mt-2 text-xs text-gray-600">Guardian: {s.guardianName} • {s.guardianPhone}</p>
            </div>

            <div className="flex shrink-0 items-start gap-2">
              <button type="button" onClick={() => onView(s.id)} aria-label={`View ${s.name}`} className="rounded-md p-2 text-[#C2570C] hover:bg-orange-50">
                <Eye className="h-5 w-5" />
              </button>

              <button type="button" onClick={() => onEdit(s.id)} aria-label={`Edit ${s.name}`} className="rounded-md p-2 text-[#C2570C] hover:bg-orange-50">
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
