import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@api/client.js";
import { PHOTO_ALBUMS_DATA } from "@data/mockParentData";
import { useParentChild } from "@hooks/useParentChild";

/**
 * Read-only counterpart to `useAlbumsState` for the parent portal. Shares the
 * same album shape (id, title, category, description, createdAt, photos[])
 * so `ParentEventPhotos`/`ParentPhotoGallery` can reuse the admin
 * AlbumsList/PhotoGrid components, but never mutates data and pre-filters
 * albums to the currently selected child.
 */
export function useParentAlbumsState() {
    const { selectedChildId } = useParentChild();

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const dismissError = useCallback(() => setError(""), []);

    useEffect(() => {
        let isMounted = true;

        const loadAlbums = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await apiClient.getAlbums();
                if (!isMounted) return;

                if (Array.isArray(data)) {
                    setAlbums(data);
                } else if (Array.isArray(data?.albums)) {
                    setAlbums(data.albums);
                } else {
                    setAlbums(PHOTO_ALBUMS_DATA);
                }
            } catch (err) {
                console.error("useParentAlbumsState failed to fetch albums:", err);
                if (!isMounted) return;
                setAlbums(PHOTO_ALBUMS_DATA);
                setError("Unable to load live photos. Displaying cached photos instead.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadAlbums();

        return () => {
            isMounted = false;
        };
    }, []);

    // Only show albums that include the currently selected child.
    const childAlbums = useMemo(() => {
        if (!selectedChildId) return albums;
        return albums.filter((album) => album.childIds?.includes(selectedChildId));
    }, [albums, selectedChildId]);

    const filteredAlbums = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return childAlbums;

        return childAlbums.filter((album) =>
            [album.title, album.category, album.description].some((value) =>
                value?.toLowerCase().includes(query),
            ),
        );
    }, [childAlbums, searchQuery]);

    const getAlbumById = useCallback(
        (albumId) =>
            childAlbums.find((album) => String(album.id) === String(albumId)),
        [childAlbums],
    );

    return {
        albums: childAlbums,
        loading,
        error,
        dismissError,
        searchQuery,
        setSearchQuery,
        filteredAlbums,
        getAlbumById,
    };
}

export default useParentAlbumsState;
