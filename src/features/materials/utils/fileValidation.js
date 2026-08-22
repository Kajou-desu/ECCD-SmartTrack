// Shared file validation and file metadata helpers for the Materials feature.
// Centralizing these checks avoids duplicating "is this a valid PDF/image"
// logic across AddMaterial, EditMaterial, and UploadStudentWork.

const PDF_MIME_TYPE = "application/pdf";
const PDF_EXTENSION = ".pdf";

const STUDENT_WORK_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const STUDENT_WORK_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

export function getFileExtension(fileName = "") {
    const lastDot = fileName.lastIndexOf(".");

    if (lastDot === -1) return "";

    return fileName.slice(lastDot).toLowerCase();
}

export function isPdfFile(file) {
    if (!file) return false;

    return (
        file.type === PDF_MIME_TYPE ||
        getFileExtension(file.name) === PDF_EXTENSION
    );
}

export function isAllowedStudentWorkFile(file) {
    if (!file) return false;

    return (
        STUDENT_WORK_MIME_TYPES.includes(file.type) ||
        STUDENT_WORK_EXTENSIONS.includes(getFileExtension(file.name))
    );
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