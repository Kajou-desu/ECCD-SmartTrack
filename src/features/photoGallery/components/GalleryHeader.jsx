import { Link } from "react-router-dom";
import formatDate from "@utils/formatDate";
import { PrimaryButton } from "@components/ui/Button";
import { ArrowLeft, Upload } from "lucide-react";

export default function GalleryHeader({ album, onAddPhotosClick }) {
  return (
    <header className="flex flex-col gap-4">
      <Link
        to="/event-photos"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Event Photos
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* Mobile-first priority: category badge, title, and date are
              shown before the secondary "Add Photos" action. */}
          <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold tracking-wider text-orange-700">
            {album.category}
          </span>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {album.title}
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            {formatDate(album.createdAt)} &middot; {album.photos.length} photo
            {album.photos.length === 1 ? "" : "s"}
          </p>
        </div>

        <PrimaryButton
          label="Add Photos"
          icon={<Upload className="h-5 w-5" aria-hidden="true" />}
          onClick={onAddPhotosClick}
          ariaLabel="Add photos to this album"
        />
      </div>
    </header>
  );
}
