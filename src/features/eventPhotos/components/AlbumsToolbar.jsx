import SearchInput from "@components/ui/SearchInput";
import { PrimaryButton } from "@components/ui/Button";
import { Plus } from "lucide-react";

export default function AlbumsToolbar({
  searchQuery,
  onSearchChange,
  onCreateAlbum,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Event Photos
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Organize and browse photo albums from center activities
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <SearchInput
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search albums..."
          ariaLabel="Search photo albums"
        />

        <PrimaryButton
          label="New Album"
          icon={<Plus className="h-5 w-5" aria-hidden="true" />}
          onClick={onCreateAlbum}
          ariaLabel="Create New Album"
        />
      </div>
    </header>
  );
}
