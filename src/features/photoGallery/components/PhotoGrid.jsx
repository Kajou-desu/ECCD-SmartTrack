import PhotoThumbnail from "@features/photoGallery/components/PhotoThumbnail";

export default function PhotoGrid({ photos, albumTitle, onView, onDelete }) {
  return (
    <section
      aria-label={`Photos in ${albumTitle}`}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {photos.map((photo) => (
        <PhotoThumbnail
          key={photo.id}
          photo={photo}
          albumTitle={albumTitle}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
