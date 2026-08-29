import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import Modal from "@components/ui/Modal";

export default function PhotoPreviewModal({
  photo,
  albumTitle,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onClose,
  onDelete,
}) {
  const altText = photo.caption || `Photo from ${albumTitle}`;

  return (
    <Modal
      onClose={onClose}
      labelledBy="photo-preview-title"
      overlayClassName="items-center justify-center bg-black/90 p-4"
      className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-transparent shadow-none"
    >
      <div className="flex shrink-0 items-center justify-between pb-3">
        <h2
          id="photo-preview-title"
          className="truncate text-sm font-medium text-white"
        >
          {altText}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(photo)}
              aria-label="Delete this photo"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo preview"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {hasPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous photo"
            className="absolute left-0 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        )}

        <img
          src={photo.url}
          alt={altText}
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        {hasNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next photo"
            className="absolute right-0 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>
    </Modal>
  );
}
