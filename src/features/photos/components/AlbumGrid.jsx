import AlbumCard from "./AlbumCard.jsx";

export default function AlbumGrid({ albums, onOpen, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
