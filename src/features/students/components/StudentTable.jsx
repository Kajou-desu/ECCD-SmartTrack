import { Eye, Pencil } from "lucide-react";

export default function StudentTable({ students, onView, onEdit }) {
  if (!students || students.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">No student records found.</div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-272 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-500">
            <th className="p-4">Student Name</th>
            <th className="p-4">Session</th>
            <th className="p-4">Age</th>
            <th className="p-4">Guardian Contact</th>
            <th className="p-4">Address</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-gray-200 transition hover:bg-orange-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="font-bold text-gray-500">{(student.name || "").charAt(0).toUpperCase()}</span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                  </div>
                </div>
              </td>

              <td className="p-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.session === "afternoon" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {student.session === "afternoon" ? "PM" : "AM"}
                </span>
              </td>

              <td className="p-4">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">{student.age === "N/A" ? "N/A" : `${student.age} years old`}</span>
              </td>

              <td className="p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{student.guardianName || "N/A"}</p>
                <p className="text-xs">{student.guardianPhone || "N/A"}</p>
              </td>

              <td className="p-4 text-sm text-gray-600">{student.address || "N/A"}</td>

              <td className="p-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {student.status === "active" ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-4">
                <div className="flex items-center gap-4 text-[#C2570C]">
                  <button type="button" onClick={() => onView(student.id)} className="cursor-pointer transition hover:text-orange-800" aria-label={`View ${student.name}`} title="View student details"><Eye className="h-5 w-5" /></button>
                  <button type="button" onClick={() => onEdit(student.id)} className="cursor-pointer transition hover:text-orange-800" aria-label={`Edit ${student.name}`} title="Edit student information"><Pencil className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
