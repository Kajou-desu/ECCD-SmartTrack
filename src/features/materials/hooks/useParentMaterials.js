import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@api/client.js";
import { MATERIALS_DATA } from "@data/mockParentData";
import { getSubmissionsForChild } from "@data/mockSubmissionsStore";
import { useParentChild } from "@hooks/useParentChild";

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

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            setError("");

            let materialsData;
            try {
                const data = await apiClient.getMaterials();
                materialsData = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.materials)
                        ? data.materials
                        : MATERIALS_DATA;
            } catch (err) {
                console.error("useParentMaterials failed to fetch materials:", err);
                materialsData = MATERIALS_DATA;
                setError("Unable to load live materials. Displaying cached materials instead.");
            }

            let submissionsData = [];
            if (selectedChildId) {
                try {
                    const data = await apiClient.getSubmissions(selectedChildId);
                    submissionsData = Array.isArray(data) ? data : [];
                } catch (err) {
                    console.error("useParentMaterials failed to fetch submissions:", err);
                    submissionsData = getSubmissionsForChild(selectedChildId);
                }
            }

            if (!isMounted) return;
            setMaterials(materialsData.map((m) => withCompletion(m, submissionsData)));
            setLoading(false);
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [selectedChildId]);

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