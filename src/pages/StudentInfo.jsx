import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";
import { apiClient } from "../api/client.js";
import { StudentTableSkeleton } from "../components/LoadingSkeleton";
import { initialStudents } from "../data/mockData.js";
import {
  UserRoundPlus,
  SquareArrowRightExit,
  ListFilter,
  Eye,
  Pencil,
  AlertCircle,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function StudentInfo() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [notice, setNotice] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  const filteredStudents = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesStatus =
        filterRole === "all" || student.status === filterRole;
      const matchesSearch =
        !query ||
        [student.name, student.id, student.guardianName, student.address]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [students, debouncedSearchTerm, filterRole]);

  const {
    currentPage,
    totalPages,
    currentItems: paginatedStudents,
    goToPage,
  } = usePagination(filteredStudents, ITEMS_PER_PAGE);

  // Load students on mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setNotice("");
      }
    });

    apiClient
      .getStudents()
      .then((data) => {
        if (!isMounted) return;
        const results = Array.isArray(data) ? data : initialStudents;
        setStudents(results);
      })
      .catch((error) => {
        console.error(error);
        if (!isMounted) return;
        setStudents(initialStudents);
        setNotice(
          "Unable to load live student data. Displaying cached records instead.",
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    goToPage(1);
  }, [debouncedSearchTerm, filterRole, goToPage]);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      goToPage(1);
    }
  }, [currentPage, totalPages, goToPage]);

  const handlePageChange = useCallback(
    (page) => {
      goToPage(page);
    },
    [goToPage],
  );

  const toggleFilter = useCallback(() => {
    setFilterRole((current) => {
      if (current === "all") return "active";
      if (current === "active") return "inactive";
      return "all";
    });
  }, []);

  const escapeCsv = useCallback((value) => {
    const stringValue = String(value ?? "");
    const escaped = stringValue.replace(/"/g, '""');
    return /[",\n]/.test(stringValue) ? `"${escaped}"` : stringValue;
  }, []);

  const handleExport = useCallback(() => {
    const rows = filteredStudents.map((student) =>
      [
        escapeCsv(student.name),
        escapeCsv(student.age),
        escapeCsv(student.birthday),
        escapeCsv(student.guardianName),
        escapeCsv(student.guardianPhone),
        escapeCsv(student.address),
      ].join(","),
    );

    const csv = [
      ["Name", "Age", "Birthday", "Guardian", "Phone", "Address"].join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  }, [filteredStudents, escapeCsv]);

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
        <div className="w-full flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Records</h1>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6">Student Records</h3>
            <StudentTableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div className="w-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Student Records</h1>
          <button
            type="button"
            onClick={handleAddStudent}
            className="flex shrink-0 items-center gap-2 rounded-lg p-2.5 font-semibold text-white bg-[#C2570C] transition sm:px-3 sm:gap-2 cursor-pointer"
          >
            <UserRoundPlus className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Add Student</span>
          </button>
        </div>

        {notice ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-orange-600 hover:text-orange-800 transition font-bold"
            >
              ✕
            </button>
          </div>
        ) : null}

        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col min-h-125">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <h3 className="text-lg font-bold">Student Records</h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search students"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="button"
                onClick={toggleFilter}
                className="flex shrink-0 items-center gap-2 rounded-lg p-2.5 font-semibold text-white bg-[#C2570C] transition sm:px-3 sm:gap-2 cursor-pointer"
              >
                <ListFilter className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">
                  {filterRole === "all" ? "Filter" : `Filter: ${filterRole}`}
                </span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex shrink-0 items-center gap-2 rounded-lg p-2.5 font-semibold text-white bg-[#C2570C] transition sm:px-3 sm:gap-2 cursor-pointer"
              >
                <SquareArrowRightExit className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto grow mt-4">
            <table className="w-full text-left border-collapse min-w-250">
              <thead>
                <tr className="text-gray-500 text-xs font-bold border-b-2 border-gray-300 uppercase tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Age</th>
                  <th className="p-4">Birthday</th>
                  <th className="p-4">Guardian Contact</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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

          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>
              Showing{" "}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                filteredStudents.length,
              )}
              -{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}{" "}
              of {filteredStudents.length} students
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? "bg-amber-700 text-white" : "bg-white border border-gray-200 hover:bg-gray-50 transition"}`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentListRow({
  name,
  id,
  age,
  birthday,
  guardianName,
  guardianPhone,
  address,
  status,
  onView,
  onEdit,
}) {
  return (
    <tr
      className={`border-b border-gray-200 transition ${status === "active" ? "bg-green-50 border-green-200" : "hover:bg-orange-100"}`}
    >
      <td className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div>
          <p className="font-bold text-gray-800">{name}</p>
          <p className="text-xs text-gray-500">ID: {id}</p>
        </div>
      </td>

      <td className="p-4">
        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
          {age}
        </span>
      </td>

      <td className="p-4 text-sm text-gray-600">{birthday}</td>

      <td className="p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800">{guardianName}</p>
        <p className="text-xs">{guardianPhone}</p>
      </td>

      <td className="p-4 text-sm text-gray-600">{address}</td>

      <td className="flex items-center gap-4 p-4 text-[#C2570C]">
        <button
          type="button"
          onClick={onView}
          className="hover:text-orange-800 transition cursor-pointer"
          aria-label={`View ${name}`}
          title="View student details"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="hover:text-orange-800 transition cursor-pointer"
          aria-label={`Edit ${name}`}
          title="Edit student information"
        >
          <Pencil className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}
