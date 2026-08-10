import { useState } from "react";
import Button from "../Components/Button";

async function uploadPhotos(files, onProgress) {
  return new Promise((resolve, reject) => {
    if (!files || files.length === 0) {
      reject(new Error("Please select at least one image."));
      return;
    }

    let completed = 0;
    const totalSteps = 10;
    const intervalId = window.setInterval(() => {
      completed += 1;
      const percent = Math.min(100, Math.round((completed / totalSteps) * 100));
      onProgress(percent);

      if (completed >= totalSteps) {
        window.clearInterval(intervalId);
        setTimeout(() => resolve(files), 200);
      }
    }, 120);
  });
}

export default function EventPhotos() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleAddAlbum = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";

    input.onchange = async (event) => {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) {
        setUploadError("No files selected.");
        return;
      }

      setIsUploading(true);
      setUploadError("");
      setUploadProgress(0);

      try {
        await uploadPhotos(files, setUploadProgress);
        setUploadedFiles(files.map((file) => file.name));
      } catch (error) {
        setUploadError(error.message || "Upload failed.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    input.click();
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Event Photos</h1>
      </div>
      <div className="grow border-2 border-dashed border-gray-300 bg-white rounded-3xl flex flex-col items-center justify-center p-12 text-center min-h-100">
        <div className="bg-orange-50 text-orange-600 p-4 rounded-full text-3xl mb-4">
          🖼️
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Upload More Memories
        </h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Keep parents engaged by sharing their children's milestones and daily
          activities.
        </p>
        {uploadError ? (
          <p className="mb-4 text-sm text-red-500">{uploadError}</p>
        ) : null}
        {isUploading ? (
          <div className="w-full max-w-md mb-4">
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#C2570C] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Uploading {uploadProgress}%
            </p>
          </div>
        ) : null}
        {uploadedFiles.length > 0 && !isUploading ? (
          <p className="mb-4 text-sm text-gray-600">
            Uploaded {uploadedFiles.length} photo
            {uploadedFiles.length > 1 ? "s" : ""}.
          </p>
        ) : null}
        <Button
          variant="primary"
          onClick={handleAddAlbum}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Add New Album"}
        </Button>
      </div>
    </div>
  );
}
