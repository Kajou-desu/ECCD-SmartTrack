import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function PhotoThumbnail({
  photo,
  albumTitle,
  onView,
  onDelete,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const altText = photo.caption || `Photo from ${albumTitle}`;

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(photo);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView(photo);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(photo)}
      onKeyDown={handleKeyDown}
      aria-label={`View photo: ${altText}`}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {/* Loading placeholder prevents the image's natural dimensions from
          shifting layout or expanding the page while it loads. */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      )}

      <img
        src={photo.url}
        alt={altText}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className="h-full w-full object-cover"
      />

      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label={`Delete photo: ${altText}`}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-slate-700 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 group-hover:opacity-100"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
