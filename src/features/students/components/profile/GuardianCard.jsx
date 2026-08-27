import { Phone, Mail, MapPin, User } from "lucide-react";

export default function GuardianCard({ guardian }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
          <User size={18} className="text-[#C2570C]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {guardian.type || "Guardian"}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold text-gray-800 sm:text-base">
            {guardian.name || "No name provided"}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-700">
        {guardian.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{guardian.phone}</span>
          </div>
        )}
        {guardian.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{guardian.email}</span>
          </div>
        )}
        {guardian.address && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{guardian.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
