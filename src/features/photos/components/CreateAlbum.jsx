import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";

export default function CreateAlbum({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = onCreate(name);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  return (
    <Modal onClose={handleClose} labelledBy="create-album-title">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h2
            id="create-album-title"
            className="text-xl font-bold text-gray-800"
          >
            Create New Album
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter a name for the new photo album.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-5">
        <div>
          <label
            htmlFor="album-name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Album Name
          </label>

          <input
            id="album-name"
            type="text"
            value={name}
            maxLength={80}
            autoFocus
            placeholder="Example: Graduation Day 2026"
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
          />

          {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton label="Cancel" onClick={handleClose} />

          <PrimaryButton
            type="submit"
            icon={<Plus className="h-5 w-5" />}
            label="Add Album"
          />
        </div>
      </form>
    </Modal>
  );
}
