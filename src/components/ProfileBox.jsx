import { getInitials } from "../utils/user";

export default function ProfileBox({
  collapsed = false,
  name = "John Doe",
  role = "Day Care Worker",
  avatarUrl,
  onClick,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? `${name} · ${role}` : undefined}
      className={`
          group
          flex w-full items-center gap-3
          rounded-xl
          p-2
          transition-all duration-200
          hover:bg-orange-800
          cursor-pointer
          ${collapsed ? "justify-center" : "justify-start"}
        `}
      {...rest}
    >
      {/* Avatar — shows the image if we have one, otherwise falls back to initials */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-lg font-semibold text-orange-800 transition-colors group-hover:bg-white group-hover:text-orange-800">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-white">
            {name}
          </p>

          <p className="truncate text-xs text-gray-500 transition-colors group-hover:text-orange-100">
            {role}
          </p>
        </div>
      )}
    </button>
  );
}
