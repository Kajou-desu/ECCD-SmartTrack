export default function SettingToggle({
  id,
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-4
        transition hover:bg-gray-100"
    >
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block cursor-pointer font-medium text-gray-800"
        >
          {label}
        </label>

        <p id={`${id}-description`} className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <label
        htmlFor={id}
        className="relative flex h-6 w-12 shrink-0 cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          aria-describedby={`${id}-description`}
          className="peer sr-only"
        />

        <span
          className="absolute inset-0 rounded-full bg-gray-300 transition
            peer-checked:bg-[#C2570C] peer-focus-visible:ring-2
            peer-focus-visible:ring-[#C2570C] peer-focus-visible:ring-offset-2"
        />

        <span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white
            shadow-md transition-transform peer-checked:translate-x-6"
        />
      </label>
    </div>
  );
}
