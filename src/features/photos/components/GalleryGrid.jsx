import PhotoCard from "./PhotoCard.jsx";

export default function GalleryGrid({ photos, onOpen, onDelete }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-gray-800">No Photos Yet</h2>

        <p className="mt-2 text-sm text-gray-500">
          Upload photos to start building this gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
