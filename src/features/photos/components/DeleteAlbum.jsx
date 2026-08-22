import { Trash2 } from "lucide-react";
import Modal from "@components/ui/Modal.jsx";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button.jsx";

export default function DeleteAlbum({ album, onClose, onConfirm }) {
  if (!album) {
    return null;
  }

  return (
    <Modal onClose={onClose} labelledBy="delete-album-title">
      <div className="p-5">
        <div className="flex gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2
              id="delete-album-title"
              className="text-lg font-bold text-gray-800"
            >
              Delete Album?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This will delete "{album.name}" from the album list. Confirm
              deletion?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton label="Cancel" onClick={onClose} />

          <PrimaryButton
            label="Hide Album"
            onClick={() => onConfirm(album.id)}
          />
        </div>
      </div>
    </Modal>
  );
}
