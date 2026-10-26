import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

// Which center a new material or album goes to. Only an Admin sees it: they have
// no center of their own, so they must choose. A Teacher's is always their own
// center, decided by the server (anything sent for it is ignored), so no field.
export default function CenterSelect({ value, onChange, id = "content-center" }) {
  const { data: centers = [], isLoading } = useQuery({
    queryKey: ["centers"],
    queryFn: () => apiClient.getCenters(),
  });

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        Center
        <span className="text-red-600"> *</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        disabled={isLoading || centers.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-500"
      >
        <option value="">
          {isLoading ? "Loading centers..." : centers.length === 0 ? "No centers available" : "Select a center"}
        </option>
        {centers.map((center) => (
          <option key={center.id} value={String(center.id)}>
            {center.name}
          </option>
        ))}
      </select>
    </div>
  );
}
