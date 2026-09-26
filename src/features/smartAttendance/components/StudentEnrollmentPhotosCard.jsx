import { useEffect, useRef, useState } from "react";
import { ImagePlus, CheckCircle2 } from "lucide-react";
import ErrorMsg from "@components/ui/ErrorMsg";
import { PrimaryButton } from "@components/ui/Button";
import { apiClient, ApiError } from "@api/client.js";

const MAX_PHOTOS = 8;
const RECOMMENDED_MIN = 3;
const RECOMMENDED_MAX = 5;

function describeEnrollmentError(err) {
  if (err instanceof ApiError && err.status === 503) {
    return "Face recognition isn't set up on this server yet.";
  }
  if (err instanceof ApiError && err.status === 502) {
    return "The face recognition service didn't respond. Try again in a moment.";
  }
  if (err instanceof ApiError && err.status === 400) {
    return "Each photo must be a JPEG or PNG image, and at least one is required.";
  }
  return "Couldn't upload the photos. Try again.";
}

// Manages this student's face-recognition enrollment photo set. Uploading
// REPLACES whatever was previously enrolled — it is not additive. This is
// distinct from the profile picture (that's on the main student form); these
// photos are only ever used to teach the recognition service this child's
// face and are never shown anywhere in the app.
export default function StudentEnrollmentPhotosCard({ studentId }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // Object URLs must be revoked or they leak for the life of the tab.
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleSelect = (event) => {
    const selected = Array.from(event.target.files ?? []);
    setResult(null);
    if (selected.length === 0) return;
    if (selected.length > MAX_PHOTOS) {
      setError(`Choose at most ${MAX_PHOTOS} photos.`);
      return;
    }
    setError("");
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
  };

  const reset = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const response = await apiClient.uploadEnrollmentPhotos(studentId, files);
      setResult(response);
      reset();
    } catch (err) {
      setError(describeEnrollmentError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section
      aria-label="Face recognition enrollment"
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-bold text-gray-800">Face recognition enrollment</h2>
      <p className="mt-1 max-w-prose text-sm text-gray-600">
        {RECOMMENDED_MIN}–{RECOMMENDED_MAX} clear, well-lit photos of this child, each with only their face in
        frame. Uploading replaces any photos already enrolled for them. Only enroll a child once you have the
        guardian's consent — this system doesn't track that for you.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorMsg message={error} onClose={() => setError("")} />
        </div>
      )}

      {result && !error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            {result.enrolled
              ? `Enrolled from ${result.photosReceived} photo${result.photosReceived === 1 ? "" : "s"}.`
              : `${result.photosReceived} photo${result.photosReceived === 1 ? "" : "s"} received, but none had a single clear face — try different photos.`}
          </span>
        </div>
      )}

      {previews.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-3">
          {previews.map((url, index) => (
            <li key={url} className="h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
              <img src={url} alt={`Selected enrollment photo ${index + 1}`} className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto">
          <ImagePlus className="h-5 w-5" />
          {files.length > 0 ? `${files.length} photo${files.length === 1 ? "" : "s"} selected` : "Choose photos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleSelect}
            className="sr-only"
          />
        </label>
        <PrimaryButton
          label={uploading ? "Uploading…" : "Replace enrollment photos"}
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        />
      </div>
    </section>
  );
}
