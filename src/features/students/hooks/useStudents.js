import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { useStudentsQuery } from "./useStudentsQuery.js";

const ITEMS_PER_PAGE = 10;

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

    const filteredStudents = useMemo(() => {
        const query = debouncedSearchTerm.trim().toLowerCase();

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
    }, [students, debouncedSearchTerm, filterStatus, filterSession]);

    const pagination = usePagination(filteredStudents, itemsPerPage);

    const { goToPage } = pagination;

    useEffect(() => {
        goToPage(1);
    }, [debouncedSearchTerm, filterStatus, filterSession, goToPage]);

    const handleExport = useCallback(() => {
        if (!filteredStudents || filteredStudents.length === 0) return;
        try {
            const escapeCsv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
            const rows = filteredStudents.map((student) =>
                [student.name, student.session === "morning" ? "AM" : "PM", student.age, student.guardianName, student.guardianPhone, student.address, student.status]
                    .map(escapeCsv)
                    .join(","),
            );

            const csv = ["Name,Session,Age,Guardian,Phone,Address,Status", ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "students.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export students:", err);
            setNotice("Failed to export student records.");
        }
    }, [filteredStudents]);

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