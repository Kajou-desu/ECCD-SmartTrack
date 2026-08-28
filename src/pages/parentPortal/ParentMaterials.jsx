import useParentMaterials from "@features/materials/hooks/useParentMaterials";
import LoadingScreen from "@components/shared/LoadingScreen";
import ParentMediaGallery from "./ParentMediaGallery";

const FILTER_OPTIONS = [
  { id: "art", label: "Art & Creativity" },
  { id: "math", label: "Mathematics" },
  { id: "language", label: "Language" },
];

export default function ParentMaterials() {
  const { materials, loading } = useParentMaterials();

  if (loading) return <LoadingScreen message="Loading materials..." />;

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
