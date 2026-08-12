import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/ECCDST_Logo.png";
import ProfileBox from "./ProfileBox.jsx";
import { getInitials } from "../utils/user.js";
import { canManageAccounts } from "../auth/permissions.js";

import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  UserSquare,
  Users,
  LibraryBig,
  Images,
  Settings,
  Users2,
  LogOut,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: UserSquare,
    label: "Attendance",
    href: "/attendance",
  },
  {
    icon: Users,
    label: "Students",
    href: "/student-info",
    activePaths: ["/student-info", "/student"],
  },
  {
    icon: LibraryBig,
    label: "Materials",
    href: "/learning-materials",
  },
  {
    icon: Images,
    label: "Events",
    href: "/event-photos",
  },
];

const ADMIN_NAV_ITEMS = [
  {
    icon: Users2,
    label: "Accounts",
    href: "/accounts-management",
  },
];

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sidebarRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const profileMenuRef = useRef(null);

  const adminOnly = canManageAccounts(user?.role);

  const navItems = adminOnly ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  // Close sidebar when navigation links are clicked (via onNavigate callback)

  useEffect(() => {
    if (isMobileOpen) {
      mobileCloseButtonRef.current?.focus();
    }
  }, [isMobileOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      if (isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
        return;
      }

      if (isMobileOpen) {
        onCloseMobile?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen, isMobileOpen, onCloseMobile]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function handlePointerDown(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileMenuOpen]);

  const handleToggleSidebar = () => {
    onToggleCollapse?.();
    setIsProfileMenuOpen(false);
  };

  const handleProfileMenu = () => {
    setIsProfileMenuOpen((previous) => !previous);
  };

  const handleSettings = () => {
    setIsProfileMenuOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          aria-label="Close navigation"
          onClick={(e) => {
            e.stopPropagation();
            onCloseMobile?.();
          }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-pointer"
        />
      )}

      <aside
        id="app-sidebar"
        ref={sidebarRef}
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 h-dvh border-r border-slate-200 bg-[#f8f9ff] shadow-md
          transition-[width,transform] duration-300 ease-in-out

          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}

          lg:translate-x-0

          ${collapsed ? "lg:static lg:w-20" : "lg:fixed lg:w-72"}
        `}
      >
        <div className="flex h-full flex-col p-4">
          {/* Sidebar header */}
          <div
            className={`
              flex items-center
              ${
                collapsed && !isMobileOpen
                  ? "justify-center"
                  : "justify-between"
              }
            `}
          >
            {/* Logo */}
            {(!collapsed || isMobileOpen) && (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ECCD SmartTrack"
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <h2 className="text-xl font-bold leading-5 text-[#C2570C]">
                    ECCD
                  </h2>

                  <p className="text-xs font-semibold uppercase text-[#C2570C]/70">
                    SmartTrack
                  </p>
                </div>
              </div>
            )}

            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={handleToggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-[#C2570C] transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 lg:flex cursor-pointer"
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              ref={mobileCloseButtonRef}
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#C2570C] transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 lg:hidden"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="mt-8 flex flex-col gap-2"
          >
            {navItems.map(({ icon: Icon, label, href, activePaths }) => (
              <SidebarLink
                key={href}
                icon={<Icon aria-hidden="true" size={20} />}
                label={label}
                href={href}
                activePaths={activePaths}
                collapsed={isMobileOpen ? false : collapsed}
                onNavigate={onCloseMobile}
              />
            ))}
          </nav>

          {/* Profile */}
          <div className="relative mt-auto" ref={profileMenuRef}>
            <ProfileBox
              collapsed={isMobileOpen ? false : collapsed}
              name={user?.name}
              role={user?.role}
              avatarUrl={user?.avatarUrl}
              onClick={handleProfileMenu}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
            />

            {isProfileMenuOpen && (
              <div
                role="menu"
                aria-label="Profile menu"
                className={`
                  absolute z-60
                  rounded-3xl
                  border border-slate-200
                  bg-white
                  p-4
                  shadow-xl

                  ${
                    collapsed && !isMobileOpen
                      ? "bottom-0 left-full ml-3 w-72"
                      : "bottom-20 left-0 right-0"
                  }
                `}
              >
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <div
                    aria-hidden="true"
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-full
                      bg-orange-100
                      text-lg font-semibold
                      text-[#C2570C]
                    "
                  >
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.name ?? "User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.role ?? "Member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSettings}
                  className="
                    flex min-h-11 w-full
                    items-center gap-3
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    px-4 py-3
                    text-left text-sm font-semibold
                    text-slate-800
                    transition
                    hover:border-orange-300
                    hover:bg-orange-50
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C2570C]
                    cursor-pointer
                  "
                >
                  <Settings aria-hidden="true" size={18} />
                  Settings
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="
                    mt-3
                    flex min-h-11 w-full
                    items-center gap-3
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    text-left text-sm font-semibold
                    text-slate-800
                    transition
                    hover:border-red-300
                    hover:bg-red-50
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                    cursor-pointer
                  "
                >
                  <LogOut aria-hidden="true" size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  icon,
  label,
  href,
  collapsed,
  activePaths = [href],
  onNavigate,
}) {
  const location = useLocation();

  const isActive = activePaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  return (
    <Link
      to={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`
        group
        flex min-h-11 w-full
        items-center
        rounded-lg
        p-3
        transition-colors duration-200

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#C2570C]
        focus-visible:ring-offset-2

        ${
          isActive
            ? "bg-[#C2570C] text-white shadow-md"
            : "text-gray-700 hover:bg-orange-800 hover:text-white"
        }

        ${collapsed ? "justify-center" : "gap-3"}
      `}
    >
      <span className="shrink-0">{icon}</span>

      {!collapsed && (
        <span className="whitespace-nowrap font-medium">{label}</span>
      )}
    </Link>
  );
}
