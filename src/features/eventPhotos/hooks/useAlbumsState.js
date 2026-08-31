import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();
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

            // Optimistic local album so the modal can close immediately; the
            // real id is swapped in once the server responds.
            const optimisticAlbum = {
                id: crypto.randomUUID(),
                title: trimmedTitle,
                category: "Uncategorized",
                description: "",
                createdAt: new Date().toISOString(),
                photos: [],
            };

            setAlbums((current) => [optimisticAlbum, ...current]);
            showToast("success", `"${trimmedTitle}" album was created.`);

            apiClient
                .createAlbum(trimmedTitle) // MOCK_FALLBACK
                .then((saved) => {
                    setAlbums((current) =>
                        current.map((album) =>
                            album.id === optimisticAlbum.id ? { ...optimisticAlbum, ...saved } : album,
                        ),
                    );
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });
                })
                .catch((err) => {
                    console.warn("[MOCK_FALLBACK] createAlbum failed, kept locally:", err);
                    showToast("warning", `"${trimmedTitle}" was created locally (not synced to server).`);
                });

            return { success: true, album: optimisticAlbum };
        },
        [albums, queryClient, showToast],
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

            apiClient
                .deleteAlbum(albumId) // MOCK_FALLBACK
                .then(() => queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] }))
                .catch((err) => {
                    console.warn("[MOCK_FALLBACK] deleteAlbum failed, removed locally only:", err);
                    showToast("warning", `"${album.title}" was deleted locally (not synced to server).`);
                });
        },
        [getAlbumById, queryClient, showToast],
    );

    const addPhotos = useCallback(
        (albumId, files) => {
            const validFiles = files.filter(isImageFile);
            const rejectedCount = files.length - validFiles.length;

            if (validFiles.length === 0) {
                showToast("error", "Please choose image files (PNG, JPG, GIF, or WEBP).");
                return;
            }

            // Optimistic blob-preview photos, swapped for server URLs on success.
            const optimisticPhotos = validFiles.map((file) => {
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
                        ? { ...album, photos: [...album.photos, ...optimisticPhotos] }
                        : album,
                ),
            );

            const message =
                rejectedCount > 0
                    ? `${optimisticPhotos.length} photo(s) added, ${rejectedCount} file(s) skipped (unsupported type).`
                    : `${optimisticPhotos.length} photo(s) added.`;

            showToast(rejectedCount > 0 ? "warning" : "success", message);

            apiClient
                .addAlbumPhotos(albumId, validFiles) // MOCK_FALLBACK
                .then((savedPhotos) => {
                    const savedList = Array.isArray(savedPhotos) ? savedPhotos : savedPhotos?.photos;
                    if (!Array.isArray(savedList) || savedList.length !== optimisticPhotos.length) return;

                    setAlbums((current) =>
                        current.map((album) => {
                            if (String(album.id) !== String(albumId)) return album;

                            return {
                                ...album,
                                photos: album.photos.map((photo) => {
                                    const index = optimisticPhotos.findIndex((p) => p.id === photo.id);
                                    if (index === -1) return photo;

                                    if (isBlobUrl(photo.url)) {
                                        URL.revokeObjectURL(photo.url);
                                        objectUrlsRef.current.delete(photo.url);
                                    }

                                    return { ...photo, ...savedList[index] };
                                }),
                            };
                        }),
                    );
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });
                })
                .catch((err) => {
                    console.warn("[MOCK_FALLBACK] addAlbumPhotos failed, kept locally:", err);
                    showToast("warning", "Photo(s) saved locally (not synced to server).");
                });
        },
        [queryClient, showToast],
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

            apiClient
                .deleteAlbumPhoto(albumId, photoId) // MOCK_FALLBACK
                .then(() => queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] }))
                .catch((err) => {
                    console.warn("[MOCK_FALLBACK] deleteAlbumPhoto failed, removed locally only:", err);
                    showToast("warning", "Photo was deleted locally (not synced to server).");
                });
        },
        [queryClient, showToast],
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