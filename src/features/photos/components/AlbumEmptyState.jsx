import { Folder, Plus } from "lucide-react";
import { PrimaryButton } from "@components/ui/Button";

export default function AlbumEmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
      <div className="mb-4 rounded-full bg-orange-50 p-4 text-[#C2570C]">
        <Folder size={36} />
      </div>

      <h2 className="text-xl font-bold text-gray-800">No Albums Yet</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Create an album to organize photos from activities, events, and special
        milestones.
      </p>

      <div className="mt-6">
        <PrimaryButton
          icon={<Plus className="h-5 w-5" />}
          label="Add Album"
          onClick={onCreate}
        />
      </div>
    </div>
  );
}
