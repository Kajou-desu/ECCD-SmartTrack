export default function PageHeader({ title, subtitle, className = "" }) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
