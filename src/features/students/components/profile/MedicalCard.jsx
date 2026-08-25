export default function MedicalCard({
  icon,
  colorClass,
  title,
  subtitle,
  description,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${colorClass} transition-all hover:shadow-md`}
    >
      <div className="flex gap-3 items-start">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="uppercase text-xs font-bold tracking-wider text-gray-600">
            {title}
          </p>
          <h3 className="font-semibold text-gray-800 mt-1 text-sm sm:text-base">
            {subtitle || "No information available"}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
        {description || "No additional details provided"}
      </p>
    </div>
  );
}
