import { useNavigate } from "react-router-dom";
import { useParentEventPhotos } from "@features/eventPhotos/hooks/useParentEventPhotos";
import AlbumsToolbar from "@features/eventPhotos/components/AlbumsToolbar";
import AlbumsList from "@features/eventPhotos/components/AlbumsList";
import AlbumsLoadingState from "@features/eventPhotos/components/AlbumsLoadingState";
import ErrorMsg from "@components/ui/ErrorMsg";

export default function ParentEventPhotos() {
  const navigate = useNavigate();

  const {
    albums,
    loading,
    error,
    dismissError,
    searchQuery,
    setSearchQuery,
    filteredAlbums,
  } = useParentEventPhotos();

  const handleOpenAlbum = (album) => {
    navigate(`/parent/photo-gallery/${album.id}`);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <AlbumsToolbar
        title="Photo Gallery"
        subtitle="Photos and memories from school events and activities"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
          onOpenAlbum={handleOpenAlbum}
        />
      )}
    </main>
  );
}
