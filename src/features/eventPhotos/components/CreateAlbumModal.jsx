import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";

export default function CreateAlbumModal({ onCancel, onConfirm }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = onConfirm(name);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <Modal
      onClose={onCancel}
      labelledBy="create-album-title"
      className="w-full max-w-sm max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="shrink-0 p-5">
          <h2
            id="create-album-title"
            className="text-lg font-bold text-slate-900"
          >
            New Album
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Give this album a name to start adding photos.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <label
            htmlFor="album-name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Album Name
            <span className="text-red-600"> *</span>
          </label>

          <input
            id="album-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Field Trip 2026"
            autoFocus
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          {error && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Create Album" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
