import { useState } from "react";
import { Download, ChevronRight } from "lucide-react";

export default function ParentMediaGallery({
  type = "materials", // "materials" | "eventPhotos"
  title = "Materials",
  subtitle = "Educational resources",
  items = [],
  actionLabel = "See Work", // "See Work" | "View Photos" | Custom
  onActionClick = () => {},
  onFilterChange = () => {},
  showFilters = true,
  filterOptions = [],
  showChildFilter = true, // Filter by child if present
}) {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedChild] = useState(null);

  // Filter items based on type
  const filteredItems = items.filter((item) => {
    let matches = true;

    if (selectedFilter) {
      const filterValue = selectedFilter.toString().toLowerCase();
      const categoryValue = item.category?.toString().toLowerCase() || "";

      if (filterValue !== "event" && !categoryValue.includes(filterValue)) {
        matches = false;
      }
    }

    // For eventPhotos, only show items where child is present
    if (type === "eventPhotos" && showChildFilter && selectedChild) {
      matches = matches && item.childIds?.includes(selectedChild);
    }

    return matches;
  });

  const getMediaIcon = () => {
    return type === "eventPhotos" ? "📷" : "📄";
  };

  const getEmptyState = () => {
    return type === "eventPhotos"
      ? "No photos available yet"
      : "No materials shared yet";
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedFilter(null);
              onFilterChange(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
              selectedFilter === null
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
            }`}
          >
            All
          </button>
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedFilter(option.id);
                onFilterChange(option.id);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                selectedFilter === option.id
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Preview/Thumbnail */}
              <div className="relative bg-linear-to-br from-gray-100 to-gray-50 h-48 flex items-center justify-center overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-5xl">{getMediaIcon()}</div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  {type === "materials" && (
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                      <Download className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Badge */}
                {item.category && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  {item.createdBy && (
                    <>
                      <span>By {item.createdBy}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{item.date}</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onActionClick(item)}
                  className="w-full py-2 text-center text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {actionLabel}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{getMediaIcon()}</div>
          <p className="text-gray-600 text-lg">{getEmptyState()}</p>
          <p className="text-gray-500 text-sm mt-2">
            {type === "eventPhotos"
              ? "Photos will appear here as teachers upload them"
              : "Materials will appear here as teachers share them"}
          </p>
        </div>
      )}
    </div>
  );
}
