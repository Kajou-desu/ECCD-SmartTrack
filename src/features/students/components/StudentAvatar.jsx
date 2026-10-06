import { useState } from "react";
import formatStudentName from "@utils/formatStudentName.js";

function getInitials(student) {
  const nameParts = formatStudentName(student).split(/\s+/).filter(Boolean);
  const firstInitial = nameParts[0]?.[0] ?? "";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

export default function StudentAvatar({ student }) {
  // Remember WHICH url failed, not just that one did: a new photo (after an
  // upload or a refreshed signed URL) is then tried again. A boolean stayed
  // true for the life of the component. Same approach as shared/Avatar.jsx.
  const [failedSrc, setFailedSrc] = useState(null);
  const showPhoto = Boolean(student.photo) && failedSrc !== student.photo;

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-bold text-orange-800"
      aria-hidden="true"
    >
      {showPhoto ? (
        <img
          src={student.photo}
          alt=""
          onError={() => setFailedSrc(student.photo)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(student)
      )}
    </div>
  );
}
