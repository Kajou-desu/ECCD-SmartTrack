import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { Trash2, X } from "lucide-react";

export default function DeleteAlbumConfirm({ album, onCancel, onConfirm }) {
  return (
    <Modal
      onClose={onCancel}
      labelledBy="delete-album-title"
      className="w-full max-w-sm max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <div className="flex items-start gap-4 p-5">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100"
        >
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            id="delete-album-title"
            className="text-base font-bold text-slate-900"
          >
            Delete Album
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Delete "{album.title}" and all {album.photos.length} photo
            {album.photos.length === 1 ? "" : "s"} inside it? This action cannot
            be undone.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close modal"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
        <SecondaryButton label="Cancel" onClick={onCancel} />
        <PrimaryButton label="Delete Album" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
