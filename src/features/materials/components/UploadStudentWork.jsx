import { useState } from "react";
import { getAllStudentsData } from "../../../data/mockData";
import { X, Upload } from "lucide-react";

export default function UploadStudentWork({ material, onClose, onSuccess }) {
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const students = getAllStudentsData();

  const suggestions = students
    .filter((record) => {
      const query = studentQuery.trim().toLowerCase();

      if (!query || selectedStudent) return false;

      const studentName = record.student?.name?.toLowerCase() || "";
      const studentId = record.student?.id?.toLowerCase() || "";

      return studentName.includes(query) || studentId.includes(query);
    })
    .slice(0, 5);

  const handleStudentChange = (event) => {
    setStudentQuery(event.target.value);
    setSelectedStudent(null);
    setShowSuggestions(true);
  };

  const handleSelectStudent = (record) => {
    const student = record.student;

    setSelectedStudent(student);
    setStudentQuery(`${student.name} (${student.id})`);
    setShowSuggestions(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedStudent || !selectedFile) return;

    console.log({
      materialId: material.id,
      materialTitle: material.title,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      file: selectedFile,
    });

    onClose();
    onSuccess(`Work for "${material.title}" was uploaded successfully.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-work-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-dvh w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2
              id="upload-work-title"
              className="text-lg font-bold text-slate-900"
            >
              Upload Student Work
            </h2>

            <p className="mt-1 text-sm text-slate-600">{material.title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload dialog"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="relative">
            <label
              htmlFor={`student-${material.id}`}
              className="block text-sm font-semibold text-slate-800"
            >
              From Student
            </label>

            <input
              id={`student-${material.id}`}
              type="text"
              value={studentQuery}
              onChange={handleStudentChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by student name or ID"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls={`student-suggestions-${material.id}`}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <div
                id={`student-suggestions-${material.id}`}
                role="listbox"
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              >
                {suggestions.map((record) => {
                  const student = record.student;

                  return (
                    <button
                      key={student.id}
                      type="button"
                      role="option"
                      aria-selected={selectedStudent?.id === student.id}
                      onClick={() => handleSelectStudent(record)}
                      className="flex w-full cursor-pointer flex-col px-4 py-3 text-left transition hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {student.name}
                      </span>

                      <span className="mt-0.5 text-xs text-slate-500">
                        Student ID: {student.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {studentQuery && !selectedStudent && !suggestions.length ? (
              <p className="mt-2 text-xs text-red-600">
                No matching student found. Search by name or student ID.
              </p>
            ) : null}

            {selectedStudent ? (
              <p
                role="status"
                className="mt-2 text-xs font-medium text-green-700"
              >
                Selected: {selectedStudent.name}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Select a student from the suggestions.
              </p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor={`student-work-${material.id}`}
              className="block text-sm font-semibold text-slate-800"
            >
              Completed Material
            </label>

            <input
              id={`student-work-${material.id}`}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <p className="mt-2 text-xs text-slate-500">
              Accepted files: PDF, PNG, JPG, and JPEG.
            </p>
          </div>

          {selectedFile ? (
            <div
              role="status"
              className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
            >
              Selected file:{" "}
              <span className="font-semibold">{selectedFile.name}</span>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedStudent || !selectedFile}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} aria-hidden="true" />
              Upload Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
