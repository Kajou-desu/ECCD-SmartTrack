import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

export default function AlbumAssociationSelect({ value, onChange }) {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["albumAssociationOptions", "events"],
    queryFn: () => apiClient.getEventOptions(),
  });
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: () => apiClient.getMaterials(),
  });

  const options = value.type === "event" ? events : activities;
  const isLoading = value.type === "event" ? eventsLoading : activitiesLoading;
  const selected = options.find((option) => String(option.id) === String(value.id));

  const handleTypeChange = (type) => {
    onChange({ type, id: "", name: "" });
  };

  const handleOptionChange = (id) => {
    const option = options.find((item) => String(item.id) === id);
    onChange({ type: value.type, id, name: option?.title ?? "" });
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Connect album to
        </span>
        <select
          value={value.type}
          onChange={(event) => handleTypeChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="event">Event</option>
          <option value="activity">Activity</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          {value.type === "event" ? "Select event" : "Select activity"}
          <span className="text-red-600"> *</span>
        </span>
        <select
          value={value.id}
          onChange={(event) => handleOptionChange(event.target.value)}
          required
          disabled={isLoading || options.length === 0}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-500"
        >
          <option value="">
            {isLoading
              ? `Loading ${value.type}s...`
              : options.length === 0
                ? `No ${value.type}s available`
                : `Choose ${value.type}`}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
              {option.dateKey ? ` (${option.dateKey})` : ""}
            </option>
          ))}
        </select>
        {selected?.dateKey && (
          <span className="mt-1 block text-xs text-slate-500">{selected.dateKey}</span>
        )}
      </label>
    </div>
  );
}