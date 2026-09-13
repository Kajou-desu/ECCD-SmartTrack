import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useParentChild } from "@hooks/useParentChild";

async function fetchParentAlbums() {
    const data = await apiClient.getAlbums();
    if (Array.isArray(data)) return { albums: data };
    if (Array.isArray(data?.albums)) return { albums: data.albums };
    return { albums: [] };
}

/**
 * Read-only counterpart to `useAlbumsState` for the parent portal. Shares the
 * same album shape (id, title, category, description, createdAt, photos[])
 * so `ParentEventPhotos`/`ParentPhotoGallery` can reuse the admin
 * AlbumsList/PhotoGrid components, but never mutates data and pre-filters
 * albums to the currently selected child.
 */
export function useParentAlbumsState() {
    const { selectedChildId } = useParentChild();

    const { data: queryData, isLoading, isError } = useQuery({
        queryKey: ["albums", "parent"],
        queryFn: fetchParentAlbums,
    });

    const albums = useMemo(() => queryData?.albums ?? [], [queryData]);
    const loading = isLoading;
    const [dismissed, setDismissed] = useState(false);
    const error = isError && !dismissed
        ? "Unable to load photos. Please try again."
        : "";

    const [searchQuery, setSearchQuery] = useState("");

    const dismissError = useCallback(() => setDismissed(true), []);

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