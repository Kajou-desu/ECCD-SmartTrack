import { useState } from "react";
import { ImageOff, Trash2 } from "lucide-react";

export default function PhotoCard({ photo, index, onOpen, onDelete }) {
  const [hasError, setHasError] = useState(false);

  return (
    <article className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
      {hasError ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          <ImageOff className="h-8 w-8" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(photo.id)}
          className="h-full w-full"
          aria-label={`Open photo ${index + 1}`}
        >
          <img
            src={photo.url}
            alt={photo.name || `Photo ${index + 1}`}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(photo)}
        className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
        aria-label={`Hide ${photo.name || `photo ${index + 1}`}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  );
}
