import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PHOTO_ALBUMS_DATA } from "../data/mockData";
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PhotoGallery() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'lightbox'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const found = PHOTO_ALBUMS_DATA.find((a) => a.id === Number(albumId));
      setAlbum(found || PHOTO_ALBUMS_DATA[0]);
      setSelectedPhotoIndex(0); // Reset to first photo when album changes
      setViewMode("grid"); // Reset to grid view when album changes
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [albumId]);

  const handleNextPhoto = () => {
    if (album && selectedPhotoIndex < album.photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleDownloadPhoto = () => {
    // Implement download logic
    alert("Download functionality would be implemented here");
  };

  const handleSharePhoto = () => {
    // Implement share logic
    alert("Share functionality would be implemented here");
  };

  const handleDeletePhoto = (photoId) => {
    if (album) {
      const updatedPhotos = album.photos.filter((p) => p.id !== photoId);
      const updatedAlbum = {
        ...album,
        photos: updatedPhotos,
      };
      setAlbum(updatedAlbum);

      // Adjust selectedPhotoIndex if it's now out of bounds
      if (
        selectedPhotoIndex >= updatedPhotos.length &&
        updatedPhotos.length > 0
      ) {
        setSelectedPhotoIndex(updatedPhotos.length - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6 text-gray-600">
        Loading gallery...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6 text-gray-600">
        Album not found.
      </div>
    );
  }

  const currentPhoto = album.photos[selectedPhotoIndex];

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/event-photos")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition cursor-pointer mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Albums</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{album.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {album.date} • {album.photos.length} photos • {album.category}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode("grid")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === "grid"
              ? "bg-[#C2570C] text-white"
              : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewMode("lightbox")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === "lightbox"
              ? "bg-[#C2570C] text-white"
              : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
          }`}
        >
          Lightbox View
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {album.photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedPhotoIndex(index);
                setViewMode("lightbox");
              }}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold">View Full Size</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-medium truncate">
                  {photo.caption}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                title="Delete photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : !currentPhoto ? (
        /* Fallback if photo no longer exists */
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <button
            onClick={() => setViewMode("grid")}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            title="Close"
          >
            <span className="text-3xl">✕</span>
          </button>
          <div className="text-center text-white">
            <p className="text-lg font-semibold">Photo not available</p>
            <button
              onClick={() => setViewMode("grid")}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      ) : (
        /* Lightbox View */
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <button
            onClick={() => setViewMode("grid")}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            title="Close"
          >
            <span className="text-3xl">✕</span>
          </button>

          {/* Main Image */}
          <div className="flex flex-col items-center gap-4 max-w-4xl w-full">
            <div className="relative w-full">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="w-full max-h-96 object-contain rounded-xl"
              />
            </div>

            {/* Photo Info */}
            <div className="w-full text-white text-center">
              <p className="text-lg font-semibold">{currentPhoto.caption}</p>
              <p className="text-sm text-gray-400 mt-2">
                {selectedPhotoIndex + 1} of {album.photos.length}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={handlePrevPhoto}
                disabled={selectedPhotoIndex === 0}
                className="p-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition"
                title="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleDownloadPhoto}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                title="Download photo"
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={handleSharePhoto}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                title="Share photo"
              >
                <Share2 className="h-5 w-5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => handleDeletePhoto(currentPhoto.id)}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                title="Delete photo"
              >
                <Trash2 className="h-6 w-6" />
              </button>

              <button
                onClick={handleNextPhoto}
                disabled={selectedPhotoIndex === album.photos.length - 1}
                className="p-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition"
                title="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto w-full pb-2 mt-4">
              {album.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    index === selectedPhotoIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
