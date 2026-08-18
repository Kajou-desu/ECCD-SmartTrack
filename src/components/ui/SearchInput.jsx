import { Search } from "lucide-react";

export default function SearchInput({
  id,
  value,
  onChange,
  placeholder = "",
  ariaLabel = "Search",
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-55 sm:flex-none">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/20 sm:w-55"
      />
    </div>
  );
}
