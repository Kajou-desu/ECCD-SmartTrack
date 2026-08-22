import { useCallback, useMemo, useState } from "react";

function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function useAlbums() {
    const [albums, setAlbums] = useState([]);
    const [hiddenAlbumIds, setHiddenAlbumIds] = useState([]);

    const visibleAlbums = useMemo(
        () =>
            albums.filter(
                (album) => !hiddenAlbumIds.includes(album.id),
            ),
        [albums, hiddenAlbumIds],
    );

    const createAlbum = useCallback((name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return {
                success: false,
                error: "Please enter an album name.",
            };
        }

        const exists = albums.some(
            (album) =>
                album.name.toLowerCase() === trimmedName.toLowerCase(),
        );

        if (exists) {
            return {
                success: false,
                error: "An album with this name already exists.",
            };
        }

        const album = {
            id: createId(),
            name: trimmedName,
            photos: [],
        };

        setAlbums((currentAlbums) => [
            ...currentAlbums,
            album,
        ]);

        return {
            success: true,
            album,
        };
    }, [albums]);

    const hideAlbum = useCallback((albumId) => {
        setHiddenAlbumIds((currentIds) => {
            if (currentIds.includes(albumId)) {
                return currentIds;
            }

            return [...currentIds, albumId];
        });
    }, []);

    return {
        albums: visibleAlbums,
        createAlbum,
        hideAlbum,
    };
}