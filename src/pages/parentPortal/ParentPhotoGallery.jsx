import { useState } from "react";
import { useParams } from "react-router-dom";
import { useParentEventPhotos } from "@features/eventPhotos/hooks/useParentEventPhotos";
import GalleryHeader from "@features/photoGallery/components/GalleryHeader";
import PhotoGrid from "@features/photoGallery/components/PhotoGrid";
import GalleryEmptyState from "@features/photoGallery/components/GalleryEmptyState";
import GalleryLoadingState from "@features/photoGallery/components/GalleryLoadingState";
import AlbumNotFound from "@features/photoGallery/components/AlbumNotFound";
import PhotoPreviewModal from "@features/photoGallery/components/PhotoPreviewModal";

const BACK_TO = "/parent/photo-gallery";
const BACK_LABEL = "Back to Photo Gallery";

export default function ParentPhotoGallery() {
  const { albumId } = useParams();

  const { loading, getAlbumById } = useParentEventPhotos();

  const album = getAlbumById(albumId);

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
        <AlbumNotFound backTo={BACK_TO} backLabel={BACK_LABEL} />
      </main>
    );
  }

  const activeIndex = album.photos.findIndex(
    (photo) => String(photo.id) === String(activePhotoId),
  );
  const activePhoto = activeIndex >= 0 ? album.photos[activeIndex] : null;

  const closeModal = () => setActivePhotoId(null);

  const handleViewPhoto = (photo) => setActivePhotoId(photo.id);

  const goToOffset = (offset) => {
    const nextIndex = activeIndex + offset;
    if (nextIndex < 0 || nextIndex >= album.photos.length) return;
    setActivePhotoId(album.photos[nextIndex].id);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <GalleryHeader album={album} backTo={BACK_TO} backLabel={BACK_LABEL} />

      {album.photos.length === 0 ? (
        <GalleryEmptyState />
      ) : (
        <PhotoGrid
          photos={album.photos}
          albumTitle={album.title}
          onView={handleViewPhoto}
        />
      )}

      {activePhoto && (
        <PhotoPreviewModal
          photo={activePhoto}
          albumTitle={album.title}
          hasPrevious={activeIndex > 0}
          hasNext={activeIndex < album.photos.length - 1}
          onPrevious={() => goToOffset(-1)}
          onNext={() => goToOffset(1)}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
