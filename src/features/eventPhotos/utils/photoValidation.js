// Shared file validation and URL helpers for the event photos feature.

const IMAGE_MIME_PREFIX = "image/";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

// Client-side cap only, for a fast/friendly rejection before an upload
// starts. The server must independently enforce its own size limit.
export const MAX_PHOTO_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function getFileExtension(fileName = "") {
    const lastDot = fileName.lastIndexOf(".");

    if (lastDot === -1) return "";

    return fileName.slice(lastDot).toLowerCase();
}

export function isImageFile(file) {
    if (!file) return false;

    return (
        file.type?.startsWith(IMAGE_MIME_PREFIX) ||
        IMAGE_EXTENSIONS.includes(getFileExtension(file.name))
    );
}

export function isFileSizeValid(file, maxBytes = MAX_PHOTO_FILE_SIZE_BYTES) {
    if (!file) return false;

    return file.size <= maxBytes;
}

export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes)) return "";

    if (bytes < 1024) return `${bytes} B`;

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// Object URLs (from URL.createObjectURL) are the only ones that need to be
// revoked; mock/remote photo URLs should be left alone.
export function isBlobUrl(url = "") {
    return url.startsWith("blob:");
}