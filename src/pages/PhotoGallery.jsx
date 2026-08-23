import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useEventPhotos } from "@features/eventPhotos/hooks/useEventPhotos";
import GalleryHeader from "@features/photoGallery/components/GalleryHeader";
import PhotoGrid from "@features/photoGallery/components/PhotoGrid";
import GalleryEmptyState from "@features/photoGallery/components/GalleryEmptyState";
import GalleryLoadingState from "@features/photoGallery/components/GalleryLoadingState";
import AlbumNotFound from "@features/photoGallery/components/AlbumNotFound";
import PhotoPreviewModal from "@features/photoGallery/components/PhotoPreviewModal";
import DeletePhotoConfirm from "@features/photoGallery/components/DeletePhotoConfirm";
import { Toast } from "@components/ui/NotificationModal";

const GALLERY_MODAL = {
  NONE: null,
  PREVIEW: "preview",
  DELETE: "delete",
};

export default function PhotoGallery() {
  const { albumId } = useParams();
  const fileInputRef = useRef(null);

  const { loading, getAlbumById, addPhotos, deletePhoto, toast, dismissToast } =
    useEventPhotos();

  const album = getAlbumById(albumId);

  const [modalType, setModalType] = useState(GALLERY_MODAL.NONE);
  const [activePhotoId, setActivePhotoId] = useState(null);

  if (loading) {
    return (
      <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
        <GalleryLoadingState />
      </main>
    );
  }

  if (!album) {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9ff] p-4 sm:p-6">
        <AlbumNotFound />
      </main>
    );
  }

  const activeIndex = album.photos.findIndex(
    (photo) => String(photo.id) === String(activePhotoId),
  );
  const activePhoto = activeIndex >= 0 ? album.photos[activeIndex] : null;

  const closeModal = () => {
    setModalType(GALLERY_MODAL.NONE);
    setActivePhotoId(null);
  };

  const handleAddPhotosClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    addPhotos(album.id, files);
  };

  const handleViewPhoto = (photo) => {
    setActivePhotoId(photo.id);
    setModalType(GALLERY_MODAL.PREVIEW);
  };

  const handleRequestDelete = (photo) => {
    setActivePhotoId(photo.id);
    setModalType(GALLERY_MODAL.DELETE);
  };

  const handleConfirmDelete = () => {
    if (!activePhoto) return;
    deletePhoto(album.id, activePhoto.id);
    closeModal();
  };

  const goToOffset = (offset) => {
    const nextIndex = activeIndex + offset;
    if (nextIndex < 0 || nextIndex >= album.photos.length) return;
    setActivePhotoId(album.photos[nextIndex].id);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <GalleryHeader album={album} onAddPhotosClick={handleAddPhotosClick} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {album.photos.length === 0 ? (
        <GalleryEmptyState onAddPhotos={handleAddPhotosClick} />
      ) : (
        <PhotoGrid
          photos={album.photos}
          albumTitle={album.title}
          onView={handleViewPhoto}
          onDelete={handleRequestDelete}
        />
      )}

      {modalType === GALLERY_MODAL.PREVIEW && activePhoto && (
        <PhotoPreviewModal
          photo={activePhoto}
          albumTitle={album.title}
          hasPrevious={activeIndex > 0}
          hasNext={activeIndex < album.photos.length - 1}
          onPrevious={() => goToOffset(-1)}
          onNext={() => goToOffset(1)}
          onClose={closeModal}
          onDelete={handleRequestDelete}
        />
      )}

      {modalType === GALLERY_MODAL.DELETE && activePhoto && (
        <DeletePhotoConfirm
          photo={activePhoto}
          onCancel={closeModal}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toast && <Toast {...toast} onClose={dismissToast} />}
    </main>
  );
}
