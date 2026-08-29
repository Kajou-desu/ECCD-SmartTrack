import { useState } from "react";
import formatDate from "@utils/formatDate";
import { Images, Trash2 } from "lucide-react";

export default function AlbumCard({ album, onOpen, onDelete }) {
  const [isCoverLoaded, setIsCoverLoaded] = useState(false);
  const coverPhoto = album.photos[0];

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(album);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(album);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(album)}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${album.title} album`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        {coverPhoto ? (
          <>
            {!isCoverLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-200" />
            )}
            <img
              src={coverPhoto.url}
              alt={`Cover photo for ${album.title}`}
              onLoad={() => setIsCoverLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                isCoverLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Images size={40} aria-hidden="true" />
          </div>
        )}

        {/* Category badge is the first identifying detail shown, ahead of
            the secondary delete control. */}
        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {album.category}
        </span>

        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label={`Delete ${album.title} album`}
            className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4">
        <h2 className="line-clamp-1 text-base font-bold text-slate-900">
          {album.title}
        </h2>

        <p className="text-xs text-slate-500">
          {formatDate(album.createdAt)} &middot; {album.photos.length} photo
          {album.photos.length === 1 ? "" : "s"}
        </p>

        {album.description && (
          <p className="mt-1 line-clamp-2 hidden text-sm text-slate-600 sm:block">
            {album.description}
          </p>
        )}
      </div>
    </article>
  );
}
