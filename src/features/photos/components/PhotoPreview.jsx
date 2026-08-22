import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import Modal from "@components/ui/Modal.jsx";

export default function PhotoPreview({
  photo,
  index,
  total,
  onClose,
  onPrevious,
  onNext,
  onDelete,
}) {
  if (!photo) {
    return null;
  }

  return (
    <Modal onClose={onClose} labelledBy="photo-preview-title">
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
          <div className="min-w-0">
            <h2
              id="photo-preview-title"
              className="truncate font-semibold text-gray-800"
            >
              {photo.name || "Photo Preview"}
            </h2>

            <p className="text-sm text-gray-500">
              {index + 1} of {total}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(photo)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Hide photo"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-gray-950">
          <img
            src={photo.url}
            alt={photo.name || `Photo ${index + 1}`}
            className="max-h-[70vh] max-w-full object-contain"
          />

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={onPrevious}
                className="absolute left-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={onNext}
                className="absolute right-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
