// Shared file validation and URL helpers for the event photos feature.

const IMAGE_MIME_PREFIX = "image/";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

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

// Object URLs (from URL.createObjectURL) are the only ones that need to be
// revoked; mock/remote photo URLs should be left alone.
export function isBlobUrl(url = "") {
    return url.startsWith("blob:");
}