import { getInitials } from "../utils/user.js";

export default function ProfileBox({
  name = "User",
  role = "Member",
  avatarUrl,
  collapsed = false,
  onClick,
  className = "",
  ...buttonProps
}) {
  const displayName = name || "User";
  const displayRole = role || "Member";
  const initials = getInitials(displayName);

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? displayName : undefined}
      aria-label={collapsed ? `${displayName}, ${displayRole}` : undefined}
      className={`
        flex min-h-16 w-full items-center rounded-2xl
        border border-slate-200 bg-white p-3
        text-left shadow-sm transition
        hover:border-orange-300 hover:bg-orange-50
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#C2570C]
        focus-visible:ring-offset-2
        cursor-pointer
        ${collapsed ? "justify-center" : "gap-3"}
        ${className}
      `}
      {...buttonProps}
    >
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="
              h-11 w-11 rounded-full
              border border-orange-100
              object-cover
            "
          />
        ) : (
          <div
            aria-hidden="true"
            className="
              flex h-11 w-11 items-center justify-center
              rounded-full bg-orange-100
              text-sm font-semibold text-[#C2570C]
            "
          >
            {initials}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>

          <p className="truncate text-xs text-slate-500">{displayRole}</p>
        </div>
      )}
    </button>
  );
}
