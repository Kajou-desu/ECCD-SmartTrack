import { useState } from "react";
import { UserRound } from "lucide-react";
import { getInitials } from "@utils/user.js";

// Shows a person's photo when there is one, and a placeholder (their initials,
// or a generic silhouette when there is no name either) when there isn't or
// when the image fails to load — e.g. an expired signed URL or a deleted file.
// Size, shape and text size come from `className`; pass `alt` only when the
// person's name isn't already shown next to the avatar.
export default function Avatar({
  src,
  name,
  alt = "",
  className = "h-10 w-10 rounded-full text-sm",
}) {
  // Remember which URL failed rather than a boolean, so a new photo (after an
  // upload or a refreshed signed URL) is tried again without an effect.
  const [failedSrc, setFailedSrc] = useState(null);
  const showPhoto = Boolean(src) && failedSrc !== src;
  const initials = getInitials(name);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-orange-100 font-semibold text-orange-800 ${className}`}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": "true" })}
    >
      {showPhoto ? (
        <img
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
      )}
    </div>
  );
}
