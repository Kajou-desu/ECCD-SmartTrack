import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@api/client.js";
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

    const {
        data: materialsQueryData,
        isLoading: materialsLoading,
        isError: materialsError,
        refetch: refetchMaterials,
    } = useMaterialsQuery();

    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [submissionsError, setSubmissionsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadSubmissions = async () => {
            setSubmissionsLoading(true);

            if (!selectedChildId) {
                if (isMounted) {
                    setSubmissions([]);
                    setSubmissionsError(false);
                    setSubmissionsLoading(false);
                }
                return;
            }

            try {
                const data = await apiClient.getSubmissions(selectedChildId);
                if (!isMounted) return;
                setSubmissions(Array.isArray(data) ? data : []);
                setSubmissionsError(false);
            } catch (err) {
                console.error("useParentMaterials failed to fetch submissions:", err);
                if (!isMounted) return;
                setSubmissions([]);
                setSubmissionsError(true);
            } finally {
                if (isMounted) setSubmissionsLoading(false);
            }
        };

        loadSubmissions();

        return () => {
            isMounted = false;
        };
    }, [selectedChildId, reloadToken]);

    const loading = materialsLoading || submissionsLoading;
    const isError = materialsError || submissionsError;
    const error = isError ? "Unable to load materials. Tap the X to try again." : "";

    const retry = () => {
        refetchMaterials();
        setReloadToken((n) => n + 1);
    };

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
        retry,
    };
}

export default useParentMaterials;