import { useState } from "react";
import formatStudentName from "@utils/formatStudentName.js";

function getInitials(student) {
  const nameParts = formatStudentName(student).split(/\s+/).filter(Boolean);
  const firstInitial = nameParts[0]?.[0] ?? "";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

export default function StudentAvatar({ student }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-bold text-orange-800"
      aria-hidden="true"
    >
      {student.photo && !photoFailed ? (
        <img
          src={student.photo}
          alt=""
          onError={() => setPhotoFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(student)
      )}
    </div>
  );
}
