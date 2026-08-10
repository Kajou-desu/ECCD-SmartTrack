export default function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
}) {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition whitespace-nowrap";
  let colorClasses = "";

  if (variant === "primary") {
    colorClasses = "bg-amber-700 hover:bg-amber-800 text-white";
  } else if (variant === "secondary") {
    colorClasses = "bg-orange-100 hover:bg-orange-200 text-orange-900 text-sm";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses} ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      {children}
    </button>
  );
}