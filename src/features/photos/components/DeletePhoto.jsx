import { AlertTriangle } from "lucide-react";
import Modal from "@components/ui/Modal.jsx";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button.jsx";

export default function DeletePhoto({ photo, onClose, onConfirm }) {
  if (!photo) {
    return null;
  }

  return (
    <Modal onClose={onClose} labelledBy="delete-photo-title">
      <div className="p-5">
        <div className="flex gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2
              id="delete-photo-title"
              className="text-lg font-bold text-gray-800"
            >
              Hide Photo?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This photo will be hidden from the gallery for now. It will not be
              permanently deleted.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton label="Cancel" onClick={onClose} />

          <PrimaryButton
            label="Hide Photo"
            onClick={() => onConfirm(photo.id)}
          />
        </div>
      </div>
    </Modal>
  );
}
