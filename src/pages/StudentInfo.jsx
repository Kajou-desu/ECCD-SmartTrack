import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";
import { apiClient } from "../api/client.js";
import { StudentTableSkeleton } from "../components/LoadingSkeleton";
import { getAllStudentsData } from "../data/mockData.js";
import {
  UserRoundPlus,
  SquareArrowRightExit,
  Eye,
  Pencil,
  AlertCircle,
  Search,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const SESSION_OPTIONS = [
  { key: "all", label: "All" },
  { key: "morning", label: "AM" },
  { key: "afternoon", label: "PM" },
];

function calculateAge(birthday) {
  if (!birthday) return "N/A";

  const birthDate = new Date(birthday);

  if (Number.isNaN(birthDate.getTime())) {
    return "N/A";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function normalizeStatus(status) {
  const normalizedStatus = String(status ?? "")
    .trim()
    .toLowerCase();

  return normalizedStatus === "active" ? "active" : "inactive";
}

function normalizeSession(session) {
  const normalizedSession = String(session ?? "")
    .trim()
    .toLowerCase();

  return normalizedSession === "afternoon" ? "afternoon" : "morning";
}

function normalizeStudent(student, guardians = []) {
  const guardian = guardians?.[0];

  return {
    ...student,
    age:
      student.age !== undefined && student.age !== null
        ? student.age
        : calculateAge(student.birthday),
    status: normalizeStatus(student.status),
    session: normalizeSession(student.session),
    guardianName: student.guardianName ?? guardian?.name ?? "N/A",
    guardianPhone: student.guardianPhone ?? guardian?.phone ?? "N/A",
  };
}

const initialStudents = getAllStudentsData().map(({ student, guardians }) =>
  normalizeStudent(student, guardians),
);

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function StudentInfo() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [notice, setNotice] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setLoading(true);
      setNotice("");

      try {
        const data = await apiClient.getStudents();

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setStudents(data.map((student) => normalizeStudent(student)));
        } else if (Array.isArray(data?.students)) {
          setStudents(
            data.students.map((student) => normalizeStudent(student)),
          );
        } else {
          setStudents(initialStudents);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);

        if (!isMounted) return;

        setStudents(initialStudents);
        setNotice(
          "Unable to load live student data. Displaying cached records instead.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesStatus =
        filterStatus === "all" || student.status === filterStatus;

      const matchesSession =
        filterSession === "all" || student.session === filterSession;

      const searchableText = [
        student.name,
        student.id,
        student.guardianName,
        student.guardianPhone,
        student.address,
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSession && matchesSearch;
    });
  }, [students, debouncedSearchTerm, filterStatus, filterSession]);

  const {
    currentPage,
    totalPages,
    currentItems: paginatedStudents,
    goToPage,
  } = usePagination(filteredStudents, ITEMS_PER_PAGE);

  useEffect(() => {
    goToPage(1);
  }, [debouncedSearchTerm, filterStatus, filterSession, goToPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      goToPage(totalPages);
    }
  }, [currentPage, totalPages, goToPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;

      goToPage(page);
    },
    [goToPage, totalPages],
  );

  const handleExport = useCallback(() => {
    if (filteredStudents.length === 0) return;

    try {
      const rows = filteredStudents.map((student) =>
        [
          student.name,
          student.session === "morning" ? "AM" : "PM",
          student.age,
          student.guardianName,
          student.guardianPhone,
          student.address,
          student.status,
        ]
          .map(escapeCsvValue)
          .join(","),
      );

      const csv = [
        "Name,Session,Age,Guardian,Phone,Address,Status",
        ...rows,
      ].join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "students.csv";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export students:", error);
      setNotice("Failed to export student records.");
    }
  }, [filteredStudents]);

  const handleAddStudent = useCallback(() => {
    navigate("/student-add");
  }, [navigate]);

  const handleViewStudent = useCallback(
    (studentId) => {
      navigate(`/student/${studentId}`);
    },
    [navigate],
  );

  const handleEditStudent = useCallback(
    (studentId) => {
      navigate(`/student/${studentId}/edit`);
    },
    [navigate],
  );

  const startItem =
    filteredStudents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem =
    filteredStudents.length === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Student Records
          </h1>

          <section className="flex flex-col rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-800">
              Student Records
            </h2>

            <StudentTableSkeleton />
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Student Records
          </h1>

          <button
            type="button"
            onClick={handleAddStudent}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] p-2.5 font-semibold text-white transition hover:bg-[#a94709] sm:w-auto sm:px-3"
          >
            <UserRoundPlus className="h-5 w-5" />
            <span className="text-sm">Add Student</span>
          </button>
        </header>

        {notice && (
          <ErrorAlert message={notice} onClose={() => setNotice("")} />
        )}

        <section className="flex flex-col rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h2 className="text-lg font-bold text-gray-800">Student Records</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search students..."
                  aria-label="Search students"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#C2570C] focus:ring-2 focus:ring-orange-100"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <FilterGroup
                options={STATUS_OPTIONS}
                selectedValue={filterStatus}
                onChange={setFilterStatus}
                ariaLabel="Filter students by status"
              />

              <FilterGroup
                options={SESSION_OPTIONS}
                selectedValue={filterSession}
                onChange={setFilterSession}
                ariaLabel="Filter students by session"
              />

              <button
                type="button"
                onClick={handleExport}
                disabled={filteredStudents.length === 0}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] p-2.5 font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
              >
                <SquareArrowRightExit className="h-5 w-5" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>

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
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-sm text-gray-500"
                    >
                      No student records found for the selected filter or
                      search.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <StudentListRow
                      key={student.id}
                      {...student}
                      onView={() => handleViewStudent(student.id)}
                      onEdit={() => handleEditStudent(student.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row">
            <p>
              Showing {startItem}-{endItem} of {filteredStudents.length}{" "}
              students
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &lt;
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    aria-label={`Go to page ${page}`}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      currentPage === page
                        ? "bg-[#C2570C] text-white"
                        : "border border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ErrorAlert({ message, onClose }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
    >
      <div className="flex min-w-0 items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss alert"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-orange-600 transition hover:bg-orange-100 hover:text-orange-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterGroup({ options, selectedValue, onChange, ariaLabel }) {
  return (
    <div
      className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
            selectedValue === option.key
              ? "bg-[#C2570C] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StudentListRow({
  name,
  id,
  session,
  age,
  guardianName,
  guardianPhone,
  address,
  status,
  onView,
  onEdit,
}) {
  const studentName = name || "Unknown Student";
  const sessionLabel = session === "afternoon" ? "PM" : "AM";

  return (
    <tr className="border-b border-gray-200 transition hover:bg-orange-50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
            <span className="font-bold text-gray-500">
              {studentName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold text-gray-800">{studentName}</p>
            <p className="text-xs text-gray-500">ID: {id}</p>
          </div>
        </div>
      </td>

      <td className="p-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            session === "afternoon"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {sessionLabel}
        </span>
      </td>

      <td className="p-4">
        <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
          {age === "N/A" ? "N/A" : `${age} years old`}
        </span>
      </td>

      <td className="p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800">{guardianName || "N/A"}</p>
        <p className="text-xs">{guardianPhone || "N/A"}</p>
      </td>

      <td className="p-4 text-sm text-gray-600">{address || "N/A"}</td>

      <td className="p-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status === "active" ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-4 text-[#C2570C]">
          <button
            type="button"
            onClick={onView}
            className="cursor-pointer transition hover:text-orange-800"
            aria-label={`View ${studentName}`}
            title="View student details"
          >
            <Eye className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer transition hover:text-orange-800"
            aria-label={`Edit ${studentName}`}
            title="Edit student information"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
