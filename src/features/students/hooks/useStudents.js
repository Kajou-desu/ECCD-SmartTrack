import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePagination } from "../../../hooks/usePagination";
import { apiClient } from "../../../api/client.js";
import { getAllStudentsData } from "../../../data/mockData.js";

const ITEMS_PER_PAGE = 10;

function calculateAge(birthday) {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return age;
}

function normalizeStatus(status) {
    const normalized = String(status ?? "").trim().toLowerCase();
    return normalized === "active" ? "active" : "inactive";
}

function normalizeSession(session) {
    const normalized = String(session ?? "").trim().toLowerCase();
    return normalized === "afternoon" ? "afternoon" : "morning";
}

function normalizeStudent(student, guardians = []) {
    const guardian = guardians?.[0];
    return {
        ...student,
        age: student.age ?? calculateAge(student.birthday),
        status: normalizeStatus(student.status),
        session: normalizeSession(student.session),
        guardianName: student.guardianName ?? guardian?.name ?? "N/A",
        guardianPhone: student.guardianPhone ?? guardian?.phone ?? "N/A",
    };
}

export function useStudents({ itemsPerPage = ITEMS_PER_PAGE } = {}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterSession, setFilterSession] = useState("all");

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
                    setStudents(data.map((s) => normalizeStudent(s)));
                } else if (Array.isArray(data?.students)) {
                    setStudents(data.students.map((s) => normalizeStudent(s)));
                } else {
                    setStudents(getAllStudentsData().map(({ student, guardians }) => normalizeStudent(student, guardians)));
                }
            } catch (err) {
                console.error("useStudents failed to fetch:", err);
                if (!isMounted) return;
                setStudents(getAllStudentsData().map(({ student, guardians }) => normalizeStudent(student, guardians)));
                setNotice("Unable to load live student data. Displaying cached records instead.");
            } finally {
                if (isMounted) setLoading(false);
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
            const matchesStatus = filterStatus === "all" || student.status === filterStatus;
            const matchesSession = filterSession === "all" || student.session === filterSession;

            const searchableText = [
                student.name,
                student.id,
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
    };
}

export default useStudents;
