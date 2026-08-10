import { useEffect, useState } from "react";
import ParentMediaGallery from "./parentMediaGallery";
import { MATERIALS_DATA } from "../../data/mockParentData";

const FILTER_OPTIONS = [
  { id: "art", label: "Art & Creativity" },
  { id: "math", label: "Mathematics" },
  { id: "language", label: "Language" },
];

export default function ParentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading materials
    const timer = window.setTimeout(() => {
      setMaterials(MATERIALS_DATA);
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6 text-gray-600">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p>Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <ParentMediaGallery
      type="materials"
      title="Learning Materials"
      subtitle="Educational resources shared by your child's teacher"
      items={materials}
      actionLabel="See Work"
      showFilters={true}
      filterOptions={FILTER_OPTIONS}
      showChildFilter={false}
    />
  );
}
