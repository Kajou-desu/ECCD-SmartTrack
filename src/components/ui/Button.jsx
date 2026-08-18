export function PrimaryButton({
  icon,
  label,
  onClick,
  disabled = false,
  ariaLabel = "",
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${className}`}
    >
      {icon && <span className="flex shrink-0">{icon}</span>}
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}

export function SecondaryButton({
  icon,
  label,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${className}`}
    >
      {icon && <span className="flex shrink-0">{icon}</span>}
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}
