import AlbumCard from "@features/eventPhotos/components/AlbumCard";
import AlbumsEmptyState from "@features/eventPhotos/components/AlbumsEmptyState";
import AlbumsNoResults from "@features/eventPhotos/components/AlbumsNoResults";

export default function AlbumsList({
  albums,
  filteredAlbums,
  searchQuery,
  onClearSearch,
  onCreateAlbum,
  onOpenAlbum,
  onDeleteAlbum,
}) {
  if (albums.length === 0) {
    return <AlbumsEmptyState onCreateAlbum={onCreateAlbum} />;
  }

  if (filteredAlbums.length === 0) {
    return (
      <AlbumsNoResults query={searchQuery} onClearSearch={onClearSearch} />
    );
  }

  return (
    <section
      aria-label="Photo albums"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {filteredAlbums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onOpen={onOpenAlbum}
          onDelete={onDeleteAlbum}
        />
      ))}
    </section>
  );
}
