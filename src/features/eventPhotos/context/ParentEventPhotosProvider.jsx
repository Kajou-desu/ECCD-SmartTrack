import { Outlet } from "react-router-dom";
import { ParentEventPhotosContext } from "./parentEventPhotosContextObject";
import { useParentAlbumsState } from "@features/eventPhotos/hooks/useParentAlbumsState";

/**
 * Wraps the `/parent/photo-gallery` and `/parent/photo-gallery/:albumId`
 * routes so the album list page and the photo-browsing page read the same
 * (read-only) albums state, mirroring `EventPhotosProvider` on the admin side.
 */
export function ParentEventPhotosProvider() {
  const albumsState = useParentAlbumsState();

  return (
    <ParentEventPhotosContext.Provider value={albumsState}>
      <Outlet />
    </ParentEventPhotosContext.Provider>
  );
}

export default ParentEventPhotosProvider;
