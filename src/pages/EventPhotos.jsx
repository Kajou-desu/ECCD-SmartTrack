import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventPhotos } from "@features/eventPhotos/hooks/useEventPhotos";
import AlbumsToolbar from "@features/eventPhotos/components/AlbumsToolbar";
import AlbumsList from "@features/eventPhotos/components/AlbumsList";
import AlbumsLoadingState from "@features/eventPhotos/components/AlbumsLoadingState";
import CreateAlbumModal from "@features/eventPhotos/components/CreateAlbumModal";
import EditAlbumModal from "@features/eventPhotos/components/EditAlbumModal";
import DeleteAlbumConfirm from "@features/eventPhotos/components/DeleteAlbumConfirm";
import ErrorMsg from "@components/ui/ErrorMsg";
import { Toast } from "@components/ui/Toast";

const ALBUM_MODAL = {
  NONE: null,
  CREATE: "create",
  DELETE: "delete",
  EDIT: "edit",
};

export default function EventPhotos() {
  const navigate = useNavigate();

  const {
    albums,
    loading,
    error,
    dismissError,
    searchQuery,
    setSearchQuery,
    filteredAlbums,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    toast,
    dismissToast,
  } = useEventPhotos();

  const [modalType, setModalType] = useState(ALBUM_MODAL.NONE);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const closeModal = () => {
    setModalType(ALBUM_MODAL.NONE);
    setSelectedAlbum(null);
  };

  const handleOpenAlbum = (album) => {
    navigate(`/event-photos/${album.id}`);
  };

  const handleCreateAlbum = (name) => {
    const result = createAlbum(name);

    if (result.success) {
      closeModal();
    }

    return result;
  };

  const handleEditAlbum = (album) => {
    setSelectedAlbum(album);
    setModalType(ALBUM_MODAL.EDIT);
  };

  const handleConfirmEdit = async (data) => {
    if (!selectedAlbum) return;
    const result = await updateAlbum(selectedAlbum.id, data);
    if (result?.success !== false) closeModal();
    return result;
  };

  const handleConfirmDelete = () => {
    if (!selectedAlbum) return;
    deleteAlbum(selectedAlbum.id);
    closeModal();
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <AlbumsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateAlbum={() => setModalType(ALBUM_MODAL.CREATE)}
      />

      {error && <ErrorMsg message={error} onClose={dismissError} />}

      {loading ? (
        <AlbumsLoadingState />
      ) : (
        <AlbumsList
          albums={albums}
          filteredAlbums={filteredAlbums}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          onCreateAlbum={() => setModalType(ALBUM_MODAL.CREATE)}
          onOpenAlbum={handleOpenAlbum}
          onEditAlbum={handleEditAlbum}
          onDeleteAlbum={(album) => {
            setSelectedAlbum(album);
            setModalType(ALBUM_MODAL.DELETE);
          }}
        />
      )}

      {modalType === ALBUM_MODAL.CREATE && (
        <CreateAlbumModal onCancel={closeModal} onConfirm={handleCreateAlbum} />
      )}

      {modalType === ALBUM_MODAL.EDIT && selectedAlbum && (
        <EditAlbumModal
          album={selectedAlbum}
          onCancel={closeModal}
          onConfirm={handleConfirmEdit}
        />
      )}

      {modalType === ALBUM_MODAL.DELETE && selectedAlbum && (
        <DeleteAlbumConfirm
          album={selectedAlbum}
          onCancel={closeModal}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toast && <Toast {...toast} onClose={dismissToast} />}
    </main>
  );
}
