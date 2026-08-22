import SearchInput from "@components/ui/SearchInput";
import { PrimaryButton } from "@components/ui/Button";
import { Plus } from "lucide-react";

export default function MaterialsToolbar({
  searchQuery,
  onSearchChange,
  onAddMaterial,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Learning Materials
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Access PDF resources and study materials
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <SearchInput
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search materials..."
          ariaLabel="Search learning materials"
        />

        <PrimaryButton
          label="Add Material"
          icon={<Plus className="h-5 w-5" />}
          onClick={onAddMaterial}
          ariaLabel="Add New Material"
        />
      </div>
    </header>
  );
}
