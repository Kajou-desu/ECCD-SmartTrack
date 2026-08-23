import { Images, Plus } from "lucide-react";

export default function AlbumsEmptyState({ onCreateAlbum }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Images size={32} className="text-slate-400" aria-hidden="true" />

      <h2 className="mt-4 text-lg font-bold text-slate-900">No albums yet</h2>

      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Create your first album to start organizing photos from center
        activities and events.
      </p>

      <button
        type="button"
        onClick={onCreateAlbum}
        className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a94709]"
      >
        <Plus size={18} aria-hidden="true" />
        New Album
      </button>
    </div>
  );
}
