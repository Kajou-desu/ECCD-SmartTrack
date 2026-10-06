import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { useStudentsQuery } from "./useStudentsQuery.js";
import { downloadCsv, csvText } from "@utils/exportCsv.js";
import { toDayKey } from "@utils/dateKeys.js";

const ITEMS_PER_PAGE = 10;

const GENDER_LABELS = {
    male: "Male",
    female: "Female",
    other: "Other",
    prefer_not_to_say: "Prefer not to say",
};

export function useStudents({ itemsPerPage = ITEMS_PER_PAGE } = {}) {
    const { data, isLoading, isError, refetch } = useStudentsQuery();
    const students = useMemo(() => data?.students ?? [], [data]);
    const loading = isLoading;

    const [notice, setNotice] = useState("");
    const [syncedError, setSyncedError] = useState(false);

    if (isError && !syncedError) {
        setSyncedError(true);
        setNotice("Unable to load student data. Please try again.");
    }
    if (!isError && syncedError) {
        setSyncedError(false);
        setNotice("");
    }

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterSession, setFilterSession] = useState("all");

    const debouncedSearchTerm = useDebounce(searchTerm, 350);

    const applyFilters = useCallback(
        (searchValue) => {
            const query = searchValue.trim().toLowerCase();

            return students.filter((student) => {
                const matchesStatus = filterStatus === "all" || student.status === filterStatus;
                const matchesSession = filterSession === "all" || student.session === filterSession;

                const searchableText = [
                    student.name,
                    student.id,
                    student.studentCode,
                    student.guardianName,
                    student.guardianPhone,
                    student.address,
                ]
                    .map((v) => String(v ?? ""))
                    .join(" ")
                    .toLowerCase();

                const matchesSearch = !query || searchableText.includes(query);

                return matchesStatus && matchesSession && matchesSearch;
            });
        },
        [students, filterStatus, filterSession],
    );

    const filteredStudents = useMemo(
        () => applyFilters(debouncedSearchTerm),
        [applyFilters, debouncedSearchTerm],
    );

    const pagination = usePagination(filteredStudents, itemsPerPage);

    const { goToPage } = pagination;

    useEffect(() => {
        goToPage(1);
    }, [debouncedSearchTerm, filterStatus, filterSession, goToPage]);

    const handleExport = useCallback(() => {
        // Filter by what is in the search box NOW, not the debounced value the
        // table is showing: clicking Export within 350 ms of typing used to
        // export the previous filter.
        const toExport = applyFilters(searchTerm);
        if (toExport.length === 0) return;
        try {
            downloadCsv(
                `students-${toDayKey()}.csv`,
                [
                    "Student Code",
                    "Name",
                    "Birthday",
                    "Session",
                    "Gender",
                    "Guardian",
                    "Phone",
                    "Address",
                    "Status",
                ],
                toExport.map((student) => [
                    student.studentCode,
                    student.name,
                    String(student.birthday ?? "").slice(0, 10),
                    student.session === "morning" ? "Morning" : "Afternoon",
                    GENDER_LABELS[student.gender] ?? student.gender,
                    student.guardianName,
                    // csvText keeps the leading 0 of 09171234567 in Excel.
                    csvText(student.guardianPhone),
                    student.address,
                    student.status === "active" ? "Active" : "Inactive",
                ]),
            );
        } catch (err) {
            console.error("Failed to export students:", err);
            setNotice("Failed to export student records.");
        }
    }, [applyFilters, searchTerm]);

    return {
        loading,
        notice,
        setNotice,
        retry: refetch,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterSession,
        setFilterSession,
        filteredStudents,
        paginatedStudents: pagination.currentItems,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        goToPage: pagination.goToPage,
        handleExport,
        refetch,
    };
}

export default useStudents;