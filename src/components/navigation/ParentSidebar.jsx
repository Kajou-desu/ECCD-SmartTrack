import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/ECCDST_Logo.png";
import ProfileBox from "../shared/ProfileBox";

import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  UserRound,
  Calendar,
  Images,
  BookOpen,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const PARENT_NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/parent/dashboard",
  },
  {
    icon: UserRound,
    label: "Profile",
    href: "/parent/studentprofile",
    activePaths: ["/parent/studentprofile"],
  },
  {
    icon: Calendar,
    label: "Attendance",
    href: "/parent/attendance",
    activePaths: ["/parent/attendance"],
  },
  {
    icon: BookOpen,
    label: "Materials",
    href: "/parent/materials",
    activePaths: ["/parent/materials"],
  },
  {
    icon: Images,
    label: "Photo Gallery",
    href: "/parent/photo-gallery",
    activePaths: ["/parent/photo-gallery"],
  },
];

export default function ParentSidebar({
  isMobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isCollapsed =
    typeof collapsed === "boolean" ? collapsed : internalCollapsed;

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const profileMenuRef = useRef(null);
  const closeButtonRef = useRef(null);

  /*
   * Toggle desktop sidebar.
   */
  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }

    setIsProfileMenuOpen(false);
  };

  /*
   * Profile menu.
   */
  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  /*
   * Logout.
   */
  const handleLogout = () => {
    closeProfileMenu();
    logout();
    navigate("/login", { replace: true });
  };

  /*
   * Settings.
   */
  const handleSettings = () => {
    closeProfileMenu();
    navigate("/parent/settings");
  };

  /*
   * Close mobile sidebar whenever route changes.
   */
  useEffect(() => {
    onCloseMobile?.();
  }, [location.pathname, onCloseMobile]);

  /*
   * Focus close button when mobile sidebar opens.
   */
  useEffect(() => {
    if (isMobileOpen) {
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [isMobileOpen]);

  /*
   * Keyboard handling.
   *
   * Escape:
   * 1. Close profile menu first.
   * 2. Otherwise close mobile sidebar.
   */
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (isProfileMenuOpen) {
        closeProfileMenu();
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

  /*
   * Close profile menu when clicking outside.
   */
  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileMenuOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="
            fixed inset-0 z-40
            bg-black/50
            lg:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        id="parent-sidebar"
        aria-label="Parent navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          h-dvh
          bg-[#f8f9ff]
          shadow-md
          border-r border-slate-200

          transition-[width,transform]
          duration-300
          ease-in-out

          ${
            isCollapsed
              ? "lg:static lg:w-20"
              : "lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72"
          }

          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col p-4">
          {/* Header */}
          <div
            className={`
              flex items-center
              ${
                isMobileOpen || !isCollapsed
                  ? "justify-between"
                  : "justify-center"
              }
            `}
          >
            {/* Logo */}
            {(isMobileOpen || !isCollapsed) && (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ECCD SmartTrack"
                  className="
                    h-12 w-12
                    rounded-full
                    object-cover
                    drop-shadow-xl
                  "
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

            {/* Desktop collapse */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              className="
                hidden
                min-h-11 min-w-11
                items-center justify-center
                rounded-lg
                text-[#C2570C]
                transition
                hover:bg-orange-50

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#C2570C]
                focus-visible:ring-offset-2

                lg:flex
              "
            >
              {isCollapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            {/* Mobile close */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="
                flex
                min-h-11 min-w-11
                items-center justify-center
                rounded-lg
                text-[#C2570C]
                transition
                hover:bg-orange-50

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#C2570C]
                focus-visible:ring-offset-2

                lg:hidden
              "
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Parent navigation"
            className="mt-8 flex flex-col gap-2"
          >
            {PARENT_NAV_ITEMS.map(
              ({ icon: Icon, label, href, activePaths }) => (
                <SidebarLink
                  key={href}
                  icon={<Icon aria-hidden="true" size={20} />}
                  label={label}
                  href={href}
                  activePaths={activePaths}
                  collapsed={isMobileOpen ? false : isCollapsed}
                  onNavigate={onCloseMobile}
                />
              ),
            )}
          </nav>

          {/* Profile */}
          <div className="relative mt-auto" ref={profileMenuRef}>
            <ProfileBox
              collapsed={isMobileOpen ? false : isCollapsed}
              name={user?.name}
              role="Parent/Guardian"
              avatarUrl={user?.avatarUrl}
              onClick={toggleProfileMenu}
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
                    isCollapsed && !isMobileOpen
                      ? "bottom-0 left-full ml-3 w-72"
                      : "bottom-20 left-0 right-0"
                  }
                `}
              >
                {/* User information */}
                <ProfileBox
                  name={user?.name}
                  role="Parent/Guardian"
                  avatarUrl={user?.avatarUrl}
                  onClick={() => {}}
                  className="
    mb-4 cursor-default
    border-0 bg-slate-50 shadow-none
    hover:border-0 hover:bg-slate-50
  "
                  aria-hidden="true"
                  tabIndex={-1}
                />

                {/* Settings */}
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
                    text-left
                    text-sm font-semibold
                    text-slate-800
                    transition
                    hover:border-orange-300
                    hover:bg-orange-50

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C2570C]
                    focus-visible:ring-offset-2
                  "
                >
                  <Settings aria-hidden="true" size={18} />
                  Settings
                </button>

                {/* Logout */}
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
                    text-left
                    text-sm font-semibold
                    text-slate-800
                    transition
                    hover:border-red-300
                    hover:bg-red-50

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                    focus-visible:ring-offset-2
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
      aria-label={collapsed ? label : undefined}
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
