import { useEffect, useState } from "react";
import { PHOTO_ALBUMS_DATA } from "@data/mockParentData";
import ParentMediaGallery from "./parentMediaGallery";

const FILTER_OPTIONS = [
  { id: "event", label: "Events" },
  { id: "trip", label: "Field Trips" },
  { id: "activity", label: "Activities" },
  { id: "music", label: "Music & Movement" },
  { id: "art", label: "Art & Crafts" },
];

export default function ParentPhotoGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading albums
    const timer = window.setTimeout(() => {
      setAlbums(PHOTO_ALBUMS_DATA);
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const handleViewPhotos = (album) => {
    console.log("View photos:", album);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6 text-gray-600">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p>Loading photo gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <ParentMediaGallery
      type="eventPhotos"
      title="Photo Gallery"
      subtitle="View photos and memories from school events and activities"
      items={albums}
      actionLabel="View Photos"
      onActionClick={handleViewPhotos}
      showFilters={true}
      filterOptions={FILTER_OPTIONS}
      showChildFilter={false}
    />
  );
}
