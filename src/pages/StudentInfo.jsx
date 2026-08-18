import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StudentTableSkeleton } from "../components/ui/LoadingSkeleton";
import { PrimaryButton } from "../components/ui/Button";
import ErrorMsg from "../components/ui/ErrorMsg";
import { useStudents } from "../features/students/hooks/useStudents";
import StudentFilters from "../features/students/components/StudentFilters";
import StudentTable from "../features/students/components/StudentTable";
import StudentPagination from "../features/students/components/StudentPagination";
import StudentMobileList from "../features/students/components/StudentMobileList";
import { UserRoundPlus } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function StudentInfo() {
  const navigate = useNavigate();

  const {
    loading,
    notice,
    setNotice,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterSession,
    setFilterSession,
    filteredStudents,
    paginatedStudents,
    currentPage,
    totalPages,
    goToPage,
    handleExport,
  } = useStudents();

  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      goToPage(page);
    },
    [goToPage, totalPages],
  );

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Student Records
          </h1>

          <section className="flex flex-col rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-800">
              Student List
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

          <PrimaryButton
            icon={<UserRoundPlus className="h-5 w-5" />}
            label="Add Student"
            ariaLabel="Add New Student"
            onClick={() => navigate("/student-add")}
          />
        </header>

        {notice && (
          <ErrorMsg message={notice} onClose={() => setNotice("")} />
        )}

        <section className="flex flex-col rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h2 className="text-lg font-bold text-gray-800">Student List</h2>

            <StudentFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterSession={filterSession}
              setFilterSession={setFilterSession}
              onExport={handleExport}
              statusOptions={[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "inactive", label: "Inactive" },
              ]}
              sessionOptions={[
                { key: "all", label: "All" },
                { key: "morning", label: "AM" },
                { key: "afternoon", label: "PM" },
              ]}
            />
          </div>

          <div className="block sm:hidden">
            <StudentMobileList
              students={paginatedStudents}
              onView={(id) => navigate(`/student/${id}`)}
              onEdit={(id) => navigate(`/student/${id}/edit`)}
            />
          </div>

          <div className="hidden sm:block">
            <StudentTable
              students={paginatedStudents}
              onView={(id) => navigate(`/student/${id}`)}
              onEdit={(id) => navigate(`/student/${id}/edit`)}
            />
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row">
            <p>
              Showing{" "}
              {paginatedStudents.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}{" "}
              of {filteredStudents.length} students
            </p>

            <StudentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
