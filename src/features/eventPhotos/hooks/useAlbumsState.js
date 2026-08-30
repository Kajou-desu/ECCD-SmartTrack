import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { PHOTO_ALBUMS_DATA } from "@data/mockData";
import { isBlobUrl, isImageFile } from "@features/eventPhotos/utils/photoValidation";

async function fetchAlbums() {
    const { data } = await withMockFallback(
        () => apiClient.getAlbums(),
        PHOTO_ALBUMS_DATA,
        { label: "useAlbumsState" },
    );
    return data;
}

/**
 * Owns album + photo state for the whole event-photos feature so both the
 * album-management page (EventPhotos) and the photo-browsing page
 * (PhotoGallery) read and write the same data instead of keeping two
 * disconnected copies.
 */
export function useAlbumsState() {
    const objectUrlsRef = useRef(new Set());

    const { data: queryData, isLoading, isError } = useQuery({
        queryKey: ["albums", "teacher"],
        queryFn: fetchAlbums,
    });

    const [albums, setAlbums] = useState([]);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState("");

    if (queryData && !initialized) {
        setInitialized(true);
        setAlbums(queryData);
    }
    if (isError && !initialized && !error) {
        setError("Unable to load photo albums. Please try again.");
    }

    const loading = isLoading;

    const [searchQuery, setSearchQuery] = useState("");

    const [toast, setToast] = useState(null);
    const showToast = useCallback((type, message) => setToast({ type, message }), []);
    const dismissToast = useCallback(() => setToast(null), []);

    const dismissError = useCallback(() => setError(""), []);

    // Revoke every object URL created for uploaded photos when the provider
    // unmounts (i.e. when the person navigates away from event photos).
    useEffect(() => {
        const objectUrls = objectUrlsRef.current;

        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
            objectUrls.clear();
        };
    }, []);

    const filteredAlbums = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return albums;

        return albums.filter((album) =>
            [album.title, album.category, album.description].some((value) =>
                value?.toLowerCase().includes(query),
            ),
        );
    }, [albums, searchQuery]);

    const getAlbumById = useCallback(
        (albumId) => albums.find((album) => String(album.id) === String(albumId)),
        [albums],
    );

    const createAlbum = useCallback(
        (title) => {
            const trimmedTitle = title.trim();

            if (!trimmedTitle) {
                return { success: false, error: "Album name is required." };
            }

            const isDuplicate = albums.some(
                (album) => album.title.toLowerCase() === trimmedTitle.toLowerCase(),
            );

            if (isDuplicate) {
                return { success: false, error: "An album with this name already exists." };
            }

            const newAlbum = {
                id: crypto.randomUUID(),
                title: trimmedTitle,
                category: "Uncategorized",
                description: "",
                createdAt: new Date().toISOString(),
                photos: [],
            };

            setAlbums((current) => [newAlbum, ...current]);
            showToast("success", `"${trimmedTitle}" album was created.`);

            return { success: true, album: newAlbum };
        },
        [albums, showToast],
    );

    const deleteAlbum = useCallback(
        (albumId) => {
            const album = getAlbumById(albumId);

            if (!album) return;

            album.photos.forEach((photo) => {
                if (isBlobUrl(photo.url)) {
                    URL.revokeObjectURL(photo.url);
                    objectUrlsRef.current.delete(photo.url);
                }
            });

            setAlbums((current) =>
                current.filter((current_) => String(current_.id) !== String(albumId)),
            );

            showToast("success", `"${album.title}" album was deleted.`);
        },
        [getAlbumById, showToast],
    );

    const addPhotos = useCallback(
        (albumId, files) => {
            const validFiles = files.filter(isImageFile);
            const rejectedCount = files.length - validFiles.length;

            if (validFiles.length === 0) {
                showToast("error", "Please choose image files (PNG, JPG, GIF, or WEBP).");
                return;
            }

            const newPhotos = validFiles.map((file) => {
                const url = URL.createObjectURL(file);
                objectUrlsRef.current.add(url);

                return {
                    id: crypto.randomUUID(),
                    url,
                    caption: file.name,
                };
            });

            setAlbums((current) =>
                current.map((album) =>
                    String(album.id) === String(albumId)
                        ? { ...album, photos: [...album.photos, ...newPhotos] }
                        : album,
                ),
            );

            const message =
                rejectedCount > 0
                    ? `${newPhotos.length} photo(s) added, ${rejectedCount} file(s) skipped (unsupported type).`
                    : `${newPhotos.length} photo(s) added.`;

            showToast(rejectedCount > 0 ? "warning" : "success", message);
        },
        [showToast],
    );

    const deletePhoto = useCallback(
        (albumId, photoId) => {
            setAlbums((current) =>
                current.map((album) => {
                    if (String(album.id) !== String(albumId)) return album;

                    const photoToRemove = album.photos.find(
                        (photo) => String(photo.id) === String(photoId),
                    );

                    if (photoToRemove && isBlobUrl(photoToRemove.url)) {
                        URL.revokeObjectURL(photoToRemove.url);
                        objectUrlsRef.current.delete(photoToRemove.url);
                    }

                    return {
                        ...album,
                        photos: album.photos.filter(
                            (photo) => String(photo.id) !== String(photoId),
                        ),
                    };
                }),
            );

            showToast("success", "Photo was deleted.");
        },
        [showToast],
    );

    return {
        albums,
        loading,
        error,
        dismissError,
        searchQuery,
        setSearchQuery,
        filteredAlbums,
        getAlbumById,
        createAlbum,
        deleteAlbum,
        addPhotos,
        deletePhoto,
        toast,
        dismissToast,
    };
}

export default useAlbumsState;