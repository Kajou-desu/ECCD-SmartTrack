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
    colorClasses = "bg-[#C2570C] hover:bg-orange-800 text-white";
  } else if (variant === "secondary") {
    colorClasses = "bg-orange-100 hover:bg-orange-200 text-orange-900 text-sm";
  }

  return (
    <button
      type="submit"
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