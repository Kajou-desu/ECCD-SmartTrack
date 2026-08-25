import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";

export default function RecentPhotosCard({ albums }) {
  const recent = (albums ?? []).slice(0, 3);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Photos</h2>
        <Link
          to="/parent/photo-gallery"
          className="text-sm font-semibold text-[#C2570C] hover:text-orange-700"
        >
          View Gallery →
        </Link>
      </div>

      {recent.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {recent.map((album) => (
            <Link
              key={album.id}
              to={album.url || "/parent/photo-gallery"}
              className="group block overflow-hidden rounded-xl border border-gray-200 hover:border-orange-300 transition"
            >
              <img
                src={album.thumbnail}
                alt={album.title}
                className="h-24 w-full object-cover transition group-hover:scale-105"
              />
              <p className="truncate px-2 py-1.5 text-xs font-medium text-gray-700">
                {album.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <ImageOff size={28} className="text-gray-400 shrink-0" />
          <p className="text-sm text-gray-500">No photos available yet.</p>
        </div>
      )}
    </div>
  );
}
