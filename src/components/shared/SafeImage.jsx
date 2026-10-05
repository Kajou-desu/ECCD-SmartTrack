import { useRef, useState } from "react";
import { ImageOff } from "lucide-react";

// Fired when a file image fails to load. Signed file URLs expire (1 hour on
// the API), and cached API responses keep serving the old URL, so App.jsx
// listens for this and refetches active queries to get fresh URLs.
export const FILE_URL_FAILED_EVENT = "eccd:file-url-failed";

// An <img> for files served through signed URLs. A failed load shows a
// placeholder instead of a pulsing skeleton or a broken-image icon, asks the
// app once for fresh URLs, and tries again when a new `src` arrives.
export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallback = null,
  onLoad,
  onError,
  ...rest
}) {
  // Remember which URL failed rather than a boolean, so a refreshed URL is
  // tried again without an effect.
  const [failedSrc, setFailedSrc] = useState(null);
  const requestedRefresh = useRef(false);
  const failed = !src || failedSrc === src;

  const handleError = (event) => {
    setFailedSrc(src);
    onError?.(event);
    // Only once per image instance, so a file that is really gone cannot
    // trigger a refetch loop.
    if (src && !requestedRefresh.current) {
      requestedRefresh.current = true;
      window.dispatchEvent(new Event(FILE_URL_FAILED_EVENT));
    }
  };

  if (failed) {
    return (
      fallback ?? (
        <div
          role="img"
          aria-label={alt || "Image unavailable"}
          className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
        >
          <ImageOff className="h-1/3 w-1/3 max-h-10 max-w-10" aria-hidden="true" />
        </div>
      )
    );
  }

  return <img src={src} alt={alt} className={className} onLoad={onLoad} onError={handleError} {...rest} />;
}
