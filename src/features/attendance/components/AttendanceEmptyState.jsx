import { UsersRound } from "lucide-react";

export default function AttendanceEmptyState({ searchQuery }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-8 text-center">
      <UsersRound className="mx-auto mb-4 h-16 w-16 text-gray-300" />

      <h3 className="mb-2 text-lg font-semibold text-gray-600">No Attendance Records</h3>

      <p className="text-sm text-gray-500">
        {searchQuery
          ? `No students found matching "${searchQuery}".`
          : "No records match the selected filters."}
      </p>
    </div>
  );
}
