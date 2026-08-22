import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DeletePhoto from "@features/photos/components/DeletePhoto.jsx";
import GalleryGrid from "@features/photos/components/GalleryGrid.jsx";
import PhotoPreview from "@features/photos/components/PhotoPreview.jsx";
import UploadPhotos from "@features/photos/components/UploadPhotos.jsx";
import usePhotoGallery from "@features/photos/hooks/usePhotoGallery.js";

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { albumId } = useParams();

  const {
    album,
    photos,
    loading,
    error,
    selectedPhoto,
    selectedPhotoIndex,
    openPhoto,
    closePhoto,
    showPrevious,
    showNext,
    addPhotos,
    hidePhoto,
  } = usePhotoGallery(albumId);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleUploadPhotos = (files) => {
    addPhotos(files);
  };

  const handleConfirmDelete = (photoId) => {
    hidePhoto(photoId);
    setDeleteTarget(null);
  };

  const handleDeleteFromPreview = (photo) => {
    closePhoto();
    setDeleteTarget(photo);
  };

  if (loading) {
    return (
      <main className="min-h-0 flex-1 bg-[#f8f9ff] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="space-y-6">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-0 flex-1 bg-[#f8f9ff] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h1 className="text-lg font-bold text-red-800">
              Unable to load gallery
            </h1>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => navigate("/event-photos")}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Back to Albums
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="min-h-0 flex-1 bg-[#f8f9ff] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-lg font-bold text-gray-800">Album not found</h1>

            <p className="mt-2 text-sm text-gray-500">
              The album may have been removed or is no longer available.
            </p>

            <button
              type="button"
              onClick={() => navigate("/event-photos")}
              className="mt-4 rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a9480a]"
            >
              Back to Albums
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 bg-[#f8f9ff] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/event-photos")}
              className="mt-1 rounded-lg p-2 text-gray-600 transition hover:bg-white"
              aria-label="Back to albums"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-800 sm:text-3xl">
                {album.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {photos.length} photo
                {photos.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <UploadPhotos onUpload={handleUploadPhotos} />
        </header>

        <GalleryGrid
          photos={photos}
          onOpen={openPhoto}
          onDelete={setDeleteTarget}
        />
      </div>

      <PhotoPreview
        photo={selectedPhoto}
        index={selectedPhotoIndex}
        total={photos.length}
        onClose={closePhoto}
        onPrevious={showPrevious}
        onNext={showNext}
        onDelete={handleDeleteFromPreview}
      />

      <DeletePhoto
        photo={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
