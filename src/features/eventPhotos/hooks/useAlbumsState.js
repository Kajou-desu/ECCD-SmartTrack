import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import {
    isBlobUrl,
    isImageFile,
    isFileSizeValid,
    MAX_PHOTO_FILE_SIZE_BYTES,
    formatFileSize,
} from "@features/eventPhotos/utils/photoValidation";

async function fetchAlbums() {
    const data = await apiClient.getAlbums();
    return Array.isArray(data) ? data : Array.isArray(data?.albums) ? data.albums : [];
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

            apiClient
                .createAlbum(trimmedTitle)
                .then((saved) => {
                    setAlbums((current) =>
                        current.map((album) =>
                            album.id === optimisticAlbum.id ? { ...optimisticAlbum, ...saved } : album,
                        ),
                    );
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });
                    showToast("success", `"${trimmedTitle}" album was created.`);
                })
                .catch((err) => {
                    setAlbums((current) => current.filter((album) => album.id !== optimisticAlbum.id));
                    showToast("error", err.message || `Failed to create "${trimmedTitle}". Please try again.`);
                });

            return { success: true, album: optimisticAlbum };
        },
        [albums, queryClient, showToast],
    );

    const deleteAlbum = useCallback(
        (albumId) => {
            const album = getAlbumById(albumId);
            const originalIndex = albums.findIndex(
                (current_) => String(current_.id) === String(albumId),
            );

            if (!album) return;

            setAlbums((current) =>
                current.filter((current_) => String(current_.id) !== String(albumId)),
            );

            apiClient
                .deleteAlbum(albumId)
                .then(() => {
                    album.photos.forEach((photo) => {
                        if (isBlobUrl(photo.url)) {
                            URL.revokeObjectURL(photo.url);
                            objectUrlsRef.current.delete(photo.url);
                        }
                    });
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });
                    showToast("success", `"${album.title}" album was deleted.`);
                })
                .catch((err) => {
                    setAlbums((current) => {
                        const restored = [...current];
                        restored.splice(Math.min(originalIndex, restored.length), 0, album);
                        return restored;
                    });
                    showToast("error", err.message || `Failed to delete "${album.title}". Please try again.`);
                });
        },
        [albums, getAlbumById, queryClient, showToast],
    );

    const addPhotos = useCallback(
        (albumId, files) => {
            const validFiles = files.filter(
                (file) => isImageFile(file) && isFileSizeValid(file, MAX_PHOTO_FILE_SIZE_BYTES),
            );
            const rejectedCount = files.length - validFiles.length;

            if (validFiles.length === 0) {
                showToast(
                    "error",
                    `Please choose image files (PNG, JPG, GIF, or WEBP) under ${formatFileSize(MAX_PHOTO_FILE_SIZE_BYTES)}.`,
                );
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

            apiClient
                .addAlbumPhotos(albumId, validFiles)
                .then((savedPhotos) => {
                    const savedList = Array.isArray(savedPhotos) ? savedPhotos : savedPhotos?.photos;
                    if (Array.isArray(savedList) && savedList.length === optimisticPhotos.length) {
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
                    }
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });

                    const message =
                        rejectedCount > 0
                            ? `${optimisticPhotos.length} photo(s) added, ${rejectedCount} file(s) skipped (unsupported type or too large).`
                            : `${optimisticPhotos.length} photo(s) added.`;
                    showToast(rejectedCount > 0 ? "warning" : "success", message);
                })
                .catch((err) => {
                    setAlbums((current) =>
                        current.map((album) => {
                            if (String(album.id) !== String(albumId)) return album;

                            return {
                                ...album,
                                photos: album.photos.filter(
                                    (photo) => !optimisticPhotos.some((p) => p.id === photo.id),
                                ),
                            };
                        }),
                    );
                    optimisticPhotos.forEach((photo) => {
                        URL.revokeObjectURL(photo.url);
                        objectUrlsRef.current.delete(photo.url);
                    });
                    showToast("error", err.message || "Failed to upload photo(s). Please try again.");
                });
        },
        [queryClient, showToast],
    );

    const deletePhoto = useCallback(
        (albumId, photoId) => {
            let removedPhoto;
            let removedIndex = -1;

            setAlbums((current) =>
                current.map((album) => {
                    if (String(album.id) !== String(albumId)) return album;

                    removedIndex = album.photos.findIndex(
                        (photo) => String(photo.id) === String(photoId),
                    );
                    removedPhoto = album.photos[removedIndex];

                    return {
                        ...album,
                        photos: album.photos.filter(
                            (photo) => String(photo.id) !== String(photoId),
                        ),
                    };
                }),
            );

            apiClient
                .deleteAlbumPhoto(albumId, photoId)
                .then(() => {
                    if (removedPhoto && isBlobUrl(removedPhoto.url)) {
                        URL.revokeObjectURL(removedPhoto.url);
                        objectUrlsRef.current.delete(removedPhoto.url);
                    }
                    queryClient.invalidateQueries({ queryKey: ["albums", "teacher"] });
                    showToast("success", "Photo was deleted.");
                })
                .catch((err) => {
                    if (removedPhoto) {
                        setAlbums((current) =>
                            current.map((album) => {
                                if (String(album.id) !== String(albumId)) return album;

                                const photos = [...album.photos];
                                photos.splice(Math.min(removedIndex, photos.length), 0, removedPhoto);
                                return { ...album, photos };
                            }),
                        );
                    }
                    showToast("error", err.message || "Failed to delete photo. Please try again.");
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