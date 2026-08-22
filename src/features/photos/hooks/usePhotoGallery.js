import { useCallback, useMemo, useState } from "react";

export default function usePhotoGallery(album) {
    const [hiddenPhotoIds, setHiddenPhotoIds] = useState([]);
    const [selectedPhotoId, setSelectedPhotoId] = useState(null);

    const photos = useMemo(
        () =>
            (album?.photos ?? []).filter(
                (photo) => !hiddenPhotoIds.includes(photo.id),
            ),
        [album?.photos, hiddenPhotoIds],
    );

    const selectedPhotoIndex = useMemo(
        () => photos.findIndex((photo) => photo.id === selectedPhotoId),
        [photos, selectedPhotoId],
    );

    const selectedPhoto =
        selectedPhotoIndex >= 0
            ? photos[selectedPhotoIndex]
            : null;

    const openPhoto = useCallback((photoId) => {
        setSelectedPhotoId(photoId);
    }, []);

    const closePhoto = useCallback(() => {
        setSelectedPhotoId(null);
    }, []);

    const showPrevious = useCallback(() => {
        if (photos.length === 0) {
            return;
        }

        setSelectedPhotoId((currentId) => {
            const currentIndex = photos.findIndex(
                (photo) => photo.id === currentId,
            );

            const previousIndex =
                currentIndex <= 0
                    ? photos.length - 1
                    : currentIndex - 1;

            return photos[previousIndex].id;
        });
    }, [photos]);

    const showNext = useCallback(() => {
        if (photos.length === 0) {
            return;
        }

        setSelectedPhotoId((currentId) => {
            const currentIndex = photos.findIndex(
                (photo) => photo.id === currentId,
            );

            const nextIndex =
                currentIndex === -1 ||
                    currentIndex === photos.length - 1
                    ? 0
                    : currentIndex + 1;

            return photos[nextIndex].id;
        });
    }, [photos]);

    const hidePhoto = useCallback((photoId) => {
        setHiddenPhotoIds((currentIds) => {
            if (currentIds.includes(photoId)) {
                return currentIds;
            }

            return [...currentIds, photoId];
        });

        setSelectedPhotoId((currentId) =>
            currentId === photoId ? null : currentId,
        );
    }, []);

    return {
        photos,
        selectedPhoto,
        selectedPhotoIndex,
        openPhoto,
        closePhoto,
        showPrevious,
        showNext,
        hidePhoto,
    };
}