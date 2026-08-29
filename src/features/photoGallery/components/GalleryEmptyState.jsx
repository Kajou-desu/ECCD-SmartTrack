import { ImagePlus } from "lucide-react";

export default function GalleryEmptyState({ onAddPhotos }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <ImagePlus size={32} className="text-slate-400" aria-hidden="true" />

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No photos in this album yet
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-600">
        {onAddPhotos
          ? "Add photos from this event to start building the album."
          : "Photos from this event will appear here once shared."}
      </p>

      {onAddPhotos && (
        <button
          type="button"
          onClick={onAddPhotos}
          className="mt-5 cursor-pointer rounded-lg bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a94709]"
        >
          Add Photos
        </button>
      )}
    </div>
  );
}
