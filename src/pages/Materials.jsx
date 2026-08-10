import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MATERIALS_DATA } from "../data/mockData";

export default function Materials() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  // Load materials on mount and when URL parameters change
  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams(location.search);
    const selectedId = Number(params.get("material"));

    // Defer updating selectedMaterialId to avoid synchronous setState
    Promise.resolve().then(() => {
      if (!isMounted) return;
      if (selectedId && selectedId > 0) {
        setSelectedMaterialId(selectedId);
      } else {
        setSelectedMaterialId(null);
      }
    });

    // Simulate loading materials
    const timer = window.setTimeout(() => {
      if (!isMounted) return;
      setMaterials(MATERIALS_DATA);
      setLoading(false);
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [location.search]);

  const handleViewMaterial = useCallback(
    (materialId) => {
      setSelectedMaterialId(materialId);
      navigate(`/learning-materials?material=${materialId}`);
    },
    [navigate],
  );

  const handleMenuClick = useCallback((event, materialId) => {
    event.stopPropagation();
    setOpenMenu((current) => (current === materialId ? null : materialId));
  }, []);

  const handleDelete = useCallback((materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      setMaterials((current) =>
        current.filter((material) => material.id !== materialId),
      );
      setOpenMenu(null);

      // Clear selection if the deleted material was selected
      setSelectedMaterialId((current) =>
        current === materialId ? null : current,
      );
    }
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

  const selectedMaterial = materials.find(
    (material) => material.id === selectedMaterialId,
  );

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Learning Materials</h1>
      </div>
      {selectedMaterial ? (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <p className="font-semibold">Selected Material</p>
          <p>{selectedMaterial.title}</p>
          <p className="mt-1 text-orange-700">{selectedMaterial.description}</p>
        </div>
      ) : null}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {materials.map((material) => (
            <LearningMaterialCard
              key={material.id}
              {...material}
              onView={() => handleViewMaterial(material.id)}
              onMenuClick={(event) => handleMenuClick(event, material.id)}
              onDelete={() => handleDelete(material.id)}
              isMenuOpen={openMenu === material.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningMaterialCard({
  title,
  category,
  description,
  bgColor,
  icon,
  onView,
  onMenuClick,
  onDelete,
  isMenuOpen,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative">
      <div
        className={`w-full h-40 ${bgColor} rounded-2xl mb-4 flex items-center justify-center text-4xl`}
      >
        {icon}
      </div>
      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full w-max mb-3 uppercase tracking-wider">
        {category}
      </span>
      <h3 className="font-bold text-lg mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 grow">{description}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="grow bg-[#C2570C] hover:bg-orange-800 text-white py-2 rounded-lg font-bold transition cursor-pointer"
        >
          View
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={onMenuClick}
            className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold transition hover:bg-orange-800 hover:text-white cursor-pointer"
          >
            ⋮
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-12 z-10 rounded-xl border border-gray-200 bg-white p-2 shadow-md">
              <button
                type="button"
                onClick={onDelete}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
