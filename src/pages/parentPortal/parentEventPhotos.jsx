import ParentMediaGallery from "./ParentMediaGallery";

const EVENT_PHOTOS_DATA = [
  {
    id: 1,
    title: "Field Day 2024",
    description: "Great day at the playground!",
    category: "Field Trip",
    createdBy: "Mrs. Sarah Johnson",
    date: "Dec 10, 2024",
    thumbnail: "https://placehold.co/300x200",
    childIds: ["leo-miller"], // Only show to parents of Leo
    url: "/events/1",
  },
  // ... more events
];

const FILTER_OPTIONS = [
  { id: "event", label: "Events" },
  { id: "trip", label: "Field Trips" },
  { id: "activity", label: "Activities" },
];

export default function ParentEventPhotos() {
  const childId = "leo-miller"; // From auth/context

  const handlePhotoClick = (event) => {
    console.log("View photos:", event);
    // Navigate to photo gallery detail view
  };

  // Pre-filter to only show events where child is present
  const visibleEvents = EVENT_PHOTOS_DATA.filter((event) =>
    event.childIds?.includes(childId),
  );

  return (
    <ParentMediaGallery
      type="eventPhotos"
      title="Event Photos"
      subtitle="Photos and memories from school events and activities"
      items={visibleEvents}
      actionLabel="View Photos"
      onActionClick={handlePhotoClick}
      showFilters={true}
      filterOptions={FILTER_OPTIONS}
      showChildFilter={false} // Pre-filtered already
    />
  );
}
