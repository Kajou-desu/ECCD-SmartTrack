import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@components/ui/Button.jsx";
import AlbumEmptyState from "@features/photos/components/AlbumEmptyState.jsx";
import AlbumGrid from "@features/photos/components/AlbumGrid.jsx";
import CreateAlbum from "@features/photos/components/CreateAlbum.jsx";
import DeleteAlbum from "@features/photos/components/DeleteAlbum.jsx";
import useAlbums from "@features/photos/hooks/useAlbums.js";

export default function EventPhotos() {
  const navigate = useNavigate();

  const { albums, createAlbum, hideAlbum } = useAlbums();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenAlbum = (albumId) => {
    navigate(`/event-photos/${albumId}`);
  };

  const handleConfirmDelete = (albumId) => {
    hideAlbum(albumId);
    setDeleteTarget(null);
  };

  return (
    <main className="min-h-0 flex-1 bg-[#f8f9ff] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Event Photos
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Organize event photos into albums.
            </p>
          </div>

          <PrimaryButton
            icon={<Plus className="h-5 w-5" />}
            label="Add Album"
            onClick={() => setIsCreateOpen(true)}
          />
        </header>

        {albums.length === 0 ? (
          <AlbumEmptyState onCreate={() => setIsCreateOpen(true)} />
        ) : (
          <AlbumGrid
            albums={albums}
            onOpen={handleOpenAlbum}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <CreateAlbum
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createAlbum}
      />

      <DeleteAlbum
        album={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
