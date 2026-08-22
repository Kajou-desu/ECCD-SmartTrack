import { Folder, Trash2 } from "lucide-react";

export default function AlbumCard({ album, onOpen, onDelete }) {
  return (
    <article className="group flex min-h-44 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#C2570C]/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => onOpen(album.id)}
          className="rounded-xl bg-orange-50 p-3 text-[#C2570C]"
          aria-label={`Open ${album.name}`}
        >
          <Folder size={30} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(album)}
          className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Hide ${album.name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(album.id)}
        className="mt-auto pt-6 text-left"
      >
        <h2 className="truncate text-lg font-bold text-gray-800">
          {album.name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {album.photos.length} photo
          {album.photos.length === 1 ? "" : "s"}
        </p>
      </button>
    </article>
  );
}
