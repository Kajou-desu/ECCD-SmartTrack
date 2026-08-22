import { PHOTO_ALBUMS_DATA } from "@data/mockData";

const STORAGE_KEY = "eccd-smarttrack-photo-albums";

function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStoredAlbums() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return null;
        }

        const albums = JSON.parse(stored);

        return Array.isArray(albums) ? albums : null;
    } catch {
        return null;
    }
}

function saveAlbums(albums) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

export function getAlbums() {
    const storedAlbums = getStoredAlbums();

    if (storedAlbums) {
        return storedAlbums;
    }

    const initialAlbums = PHOTO_ALBUMS_DATA.map((album) => ({
        ...album,
        photos: album.photos.map((photo) => ({
            ...photo,
            name: photo.caption,
        })),
    }));

    saveAlbums(initialAlbums);

    return initialAlbums;
}

export function getAlbumById(albumId) {
    const albums = getAlbums();

    return albums.find((album) => String(album.id) === String(albumId)) ?? null;
}

export function createAlbum(name) {
    const albums = getAlbums();
    const trimmedName = name.trim();

    const exists = albums.some(
        (album) => album.title.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (exists) {
        throw new Error("An album with this name already exists.");
    }

    const album = {
        id: createId(),
        title: trimmedName,
        date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        description: "",
        category: "Events",
        photos: [],
    };

    saveAlbums([...albums, album]);

    return album;
}

export function addPhotos(albumId, photos) {
    const albums = getAlbums();

    const updatedAlbums = albums.map((album) => {
        if (String(album.id) !== String(albumId)) {
            return album;
        }

        return {
            ...album,
            photos: [...album.photos, ...photos],
        };
    });

    saveAlbums(updatedAlbums);

    return getAlbumById(albumId);
}

export function deletePhoto(albumId, photoId) {
    const albums = getAlbums();

    const updatedAlbums = albums.map((album) => {
        if (String(album.id) !== String(albumId)) {
            return album;
        }

        return {
            ...album,
            photos: album.photos.filter(
                (photo) => String(photo.id) !== String(photoId),
            ),
        };
    });

    saveAlbums(updatedAlbums);

    return getAlbumById(albumId);
}