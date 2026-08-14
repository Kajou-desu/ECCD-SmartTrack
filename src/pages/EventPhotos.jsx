import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import { ArrowLeft, Folder, ImagePlus, Plus, X } from "lucide-react";

export default function EventPhotos() {
  const fileInputRef = useRef(null);

  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumError, setAlbumError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);

  useEffect(() => {
    return () => {
      albums.forEach((album) => {
        album.photos.forEach((photo) => {
          URL.revokeObjectURL(photo.url);
        });
      });
    };
  }, [albums]);

  const handleOpenAlbumModal = () => {
    setAlbumName("");
    setAlbumError("");
    setIsAlbumModalOpen(true);
  };

  const handleCloseAlbumModal = () => {
    setAlbumName("");
    setAlbumError("");
    setIsAlbumModalOpen(false);
  };

  const handleCreateAlbum = (event) => {
    event.preventDefault();

    const trimmedName = albumName.trim();

    if (!trimmedName) {
      setAlbumError("Please enter an album name.");
      return;
    }

    const albumExists = albums.some(
      (album) => album.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (albumExists) {
      setAlbumError("An album with this name already exists.");
      return;
    }

    const newAlbum = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmedName,
      photos: [],
    };

    setAlbums((currentAlbums) => [...currentAlbums, newAlbum]);
    handleCloseAlbumModal();
  };

  const handleOpenAlbum = (albumId) => {
    setSelectedAlbumId(albumId);
    setUploadError("");
  };

  const handleBackToAlbums = () => {
    setSelectedAlbumId(null);
    setUploadError("");
  };

  const handleChoosePhotos = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files ?? []);

    if (!selectedAlbumId || files.length === 0) {
      event.target.value = "";
      return;
    }

    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFiles.length > 0) {
      setUploadError("Only image files can be uploaded.");
    } else {
      setUploadError("");
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    const newPhotos = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setAlbums((currentAlbums) =>
      currentAlbums.map((album) =>
        album.id === selectedAlbumId
          ? {
              ...album,
              photos: [...album.photos, ...newPhotos],
            }
          : album,
      ),
    );

    event.target.value = "";
  };

  const handleDeletePhoto = (photoId) => {
    if (!selectedAlbumId) return;

    setAlbums((currentAlbums) =>
      currentAlbums.map((album) => {
        if (album.id !== selectedAlbumId) return album;

        const photoToDelete = album.photos.find(
          (photo) => photo.id === photoId,
        );

        if (photoToDelete) {
          URL.revokeObjectURL(photoToDelete.url);
        }

        return {
          ...album,
          photos: album.photos.filter((photo) => photo.id !== photoId),
        };
      }),
    );
  };

  const renderAlbums = () => (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Event Photos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize event photos into albums.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAlbumModal}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Add New Album
          </span>
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
          <div className="mb-4 rounded-full bg-orange-50 p-4 text-[#C2570C]">
            <Folder size={36} />
          </div>

          <h2 className="text-xl font-bold text-gray-800">No Albums Yet</h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Create an album to organize photos from activities, events, and
            special milestones.
          </p>

          <div className="mt-6">
            <Button variant="primary" onClick={handleOpenAlbumModal}>
              <span className="flex items-center gap-2">
                <Plus size={18} />
                Add New Album
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => handleOpenAlbum(album.id)}
              className="group cursor-pointer flex min-h-44 flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C2570C]/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl bg-orange-50 p-3 text-[#C2570C]">
                  <Folder size={30} />
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                  {album.photos.length} photo
                  {album.photos.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-auto pt-6">
                <h2 className="truncate text-lg font-bold text-gray-800">
                  {album.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Click to view photos
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );

  const renderSelectedAlbum = () => {
    if (!selectedAlbum) return null;

    return (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleBackToAlbums}
              className="cursor-pointer mt-1 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Back to albums"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                {selectedAlbum.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {selectedAlbum.photos.length} photo
                {selectedAlbum.photos.length === 1 ? "" : "s"} in this album
              </p>
            </div>
          </div>

          <Button variant="primary" onClick={handleChoosePhotos}>
            <span className="flex items-center gap-2">
              <ImagePlus size={18} />
              Add Photos
            </span>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {uploadError ? (
          <p className="text-sm text-red-500">{uploadError}</p>
        ) : null}

        {selectedAlbum.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <div className="mb-4 rounded-full bg-orange-50 p-4 text-[#C2570C]">
              <ImagePlus size={36} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">No Photos Yet</h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Add photos to the {selectedAlbum.name} album.
            </p>

            <div className="mt-6">
              <Button variant="primary" onClick={handleChoosePhotos}>
                <span className="flex items-center gap-2">
                  <ImagePlus size={18} />
                  Upload Photos
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {selectedAlbum.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pb-3 pt-10 opacity-0 transition group-hover:opacity-100">
                  <p className="truncate text-xs text-white">{photo.name}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute cursor-pointer right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-700 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label={`Delete ${photo.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-6">
      <div className="flex w-full flex-col gap-6">
        {selectedAlbumId ? renderSelectedAlbum() : renderAlbums()}
      </div>

      {isAlbumModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={handleCloseAlbumModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="album-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="album-modal-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Create New Album
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter a name for the new photo folder.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAlbumModal}
                className="cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form className="mt-6" onSubmit={handleCreateAlbum}>
              <label
                htmlFor="album-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Album Name
              </label>

              <input
                id="album-name"
                type="text"
                value={albumName}
                autoFocus
                maxLength={80}
                placeholder="Example: Graduation Day 2026"
                onChange={(event) => {
                  setAlbumName(event.target.value);
                  setAlbumError("");
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
              />

              {albumError ? (
                <p className="mt-2 text-sm text-red-500">{albumError}</p>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleCloseAlbumModal}
                >
                  Cancel
                </Button>

                <Button variant="primary" type="submit">
                  Create Album
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
