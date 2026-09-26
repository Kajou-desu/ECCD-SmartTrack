import { useRef, useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { Plus } from "lucide-react";

// Resolving the target album by title (rather than the id captured at
// selection time) sidesteps a race: a brand-new album is added to state
// with a temporary optimistic id, which gets swapped for the real server id
// once the create request resolves. The OS file picker can easily stay open
// longer than that round trip, so by the time files are chosen the id we
// captured earlier may no longer match anything. The title doesn't change
// during that swap, so looking it up at upload time is reliable.
export default function AddPhotoModal({ albums, createAlbum, addPhotos, onClose }) {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState(albums.length > 0 ? "select" : "new");
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id ?? "");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [error, setError] = useState("");
  const pendingTitleRef = useRef(null);

  const handleChoosePhotos = () => {
    setError("");

    if (mode === "new") {
      const trimmedName = newAlbumName.trim();

      if (!trimmedName) {
        setError("Album name is required.");
        return;
      }

      const result = createAlbum(trimmedName);

      if (!result.success) {
        setError(result.error);
        return;
      }

      pendingTitleRef.current = trimmedName;
    } else {
      if (!selectedAlbumId) {
        setError("Please select an album.");
        return;
      }

      pendingTitleRef.current = null;
    }

    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    const targetAlbumId = pendingTitleRef.current
      ? (albums.find(
          (album) => album.title.toLowerCase() === pendingTitleRef.current.toLowerCase(),
        )?.id ?? selectedAlbumId)
      : selectedAlbumId;

    addPhotos(targetAlbumId, files);
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="add-photo-title"
      className="w-full max-w-sm max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 p-5">
          <h2 id="add-photo-title" className="text-lg font-bold text-slate-900">
            Add Photo
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose an album, then pick photos to upload to it.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {albums.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Existing album
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
                {albums.map((album) => (
                  <label
                    key={album.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition ${
                      mode === "select" && selectedAlbumId === album.id
                        ? "bg-orange-50 text-orange-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="add-photo-album"
                      checked={mode === "select" && selectedAlbumId === album.id}
                      onChange={() => {
                        setMode("select");
                        setSelectedAlbumId(album.id);
                        setError("");
                      }}
                      className="shrink-0 accent-[#C2570C]"
                    />
                    <span className="line-clamp-1">{album.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label
            className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold transition ${
              mode === "new" ? "bg-orange-50 text-orange-800" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="add-photo-album"
              checked={mode === "new"}
              onChange={() => {
                setMode("new");
                setError("");
              }}
              className="shrink-0 accent-[#C2570C]"
            />
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Create new album</span>
          </label>

          {mode === "new" && (
            <input
              type="text"
              value={newAlbumName}
              onChange={(event) => {
                setNewAlbumName(event.target.value);
                setError("");
              }}
              placeholder="e.g. Field Trip 2026"
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          )}

          {error && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onClose} />
          <PrimaryButton label="Choose Photos" type="button" onClick={handleChoosePhotos} />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
    </Modal>
  );
}
