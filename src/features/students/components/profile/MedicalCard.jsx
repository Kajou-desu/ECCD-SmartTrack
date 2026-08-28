export default function MedicalCard({ icon, colorClass, title, items = [] }) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${colorClass}
        transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
            {title}
          </p>

          {items.length > 0 ? (
            <ul
              className="mt-2 list-disc space-y-1 pl-5 text-sm
                leading-relaxed text-gray-700"
            >
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No information available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
