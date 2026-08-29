import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@api/client.js";
import { getSubmissionsForChild } from "@data/mockSubmissionsStore";
import { useParentChild } from "@hooks/useParentChild";
import { useMaterialsQuery } from "./useMaterialsQuery.js";

// Merges a material with this child's submission (if any) into a single
// `completion` field the UI can render directly.
function withCompletion(material, submissions) {
    const submission = submissions.find(
        (s) => String(s.materialId) === String(material.id),
    );

    return {
        ...material,
        completion: submission
            ? {
                status: "completed",
                fileUrl: submission.fileUrl,
                fileName: submission.fileName,
                submittedAt: submission.submittedAt,
            }
            : { status: "not_completed" },
    };
}

export function useParentMaterials() {
    const { selectedChildId } = useParentChild();

    const { data: materialsQueryData, isLoading: materialsLoading } = useMaterialsQuery();

    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [syncedUsedMock, setSyncedUsedMock] = useState(false);

    if (materialsQueryData?.usedMock && !syncedUsedMock) {
        setSyncedUsedMock(true);
        setError("Unable to load live materials. Displaying cached materials instead.");
    }

    useEffect(() => {
        let isMounted = true;

        const loadSubmissions = async () => {
            setSubmissionsLoading(true);

            let submissionsData = [];
            if (selectedChildId) {
                try {
                    const data = await apiClient.getSubmissions(selectedChildId);
                    submissionsData = Array.isArray(data) ? data : [];
                } catch (err) {
                    console.error("useParentMaterials failed to fetch submissions:", err);
                    submissionsData = getSubmissionsForChild(selectedChildId); // MOCK_FALLBACK
                }
            }

            if (!isMounted) return;
            setSubmissions(submissionsData);
            setSubmissionsLoading(false);
        };

        loadSubmissions();

        return () => {
            isMounted = false;
        };
    }, [selectedChildId]);

    const loading = materialsLoading || submissionsLoading;
    const materials = useMemo(
        () => (materialsQueryData?.materials ?? []).map((m) => withCompletion(m, submissions)),
        [materialsQueryData, submissions],
    );

    const filteredMaterials = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return materials;

        return materials.filter((material) =>
            [material.title, material.category, material.description].some(
                (value) => value?.toLowerCase().includes(query),
            ),
        );
    }, [materials, searchQuery]);

    return {
        materials,
        filteredMaterials,
        searchQuery,
        setSearchQuery,
        loading,
        error,
    };
}

export default useParentMaterials;