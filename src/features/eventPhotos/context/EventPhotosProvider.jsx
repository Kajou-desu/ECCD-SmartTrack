import { Outlet } from "react-router-dom";
import { EventPhotosContext } from "./eventPhotosContextObject";
import { useAlbumsState } from "@features/eventPhotos/hooks/useAlbumsState";

/**
 * Wraps the `/event-photos` and `/event-photos/:albumId` routes so the
 * album-management page and the photo-browsing page read and write the same
 * albums/photos state instead of each keeping its own disconnected copy.
 */
export function EventPhotosProvider() {
  const albumsState = useAlbumsState();

  return (
    <EventPhotosContext.Provider value={albumsState}>
      <Outlet />
    </EventPhotosContext.Provider>
  );
}

export default EventPhotosProvider;
