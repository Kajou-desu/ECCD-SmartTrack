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
  { icon: Users2, label: "Accounts", href: "/accounts-management" },
];

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const isCollapsed =
    typeof collapsed === "boolean" ? collapsed : internalCollapsed;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const toggleSidebar = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((prev) => !prev);
    setIsProfileMenuOpen(false);
  };

  const closeProfileMenu = () => setIsProfileMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSettings = () => {
    closeProfileMenu();
    navigate("/settings");
  };

  // Close mobile sidebar whenever the route changes
  useEffect(() => {
    onCloseMobile?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isProfileMenuOpen]);

  const adminOnly = canManageAccounts(user?.role);
  const navItems = adminOnly ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <>
      {/* Mobile backdrop — click to close */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          h-full bg-[#f8f9ff] shadow-md border-r border-slate-200
          transition-[width,transform] duration-300 ease-in-out

          ${
            isCollapsed
              ? "lg:static lg:w-20"
              : "lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72"
          }
      
          fixed inset-y-0 left-0 z-50
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
      
          ${isMobileOpen ? "w-72" : isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex h-full flex-col p-4">
          {/* Header */}
          <div
            className={`flex items-center ${isMobileOpen || !isCollapsed ? "justify-between" : "justify-center"}`}
          >
            {(isMobileOpen || !isCollapsed) && (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ECCD SmartTrack Logo"
                  className="h-12 w-12 rounded-full object-cover drop-shadow-xl"
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

            {/* Desktop collapse toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block cursor-pointer p-2 text-[#C2570C] transition hover:drop-shadow-md"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden cursor-pointer p-2 text-[#C2570C]"
              aria-label="Close sidebar"
            >
              <X />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map(({ icon: Icon, label, href, activePaths }) => (
              <SidebarLink
                key={href}
                icon={<Icon size={20} />}
                label={label}
                href={href}
                activePaths={activePaths}
                collapsed={isMobileOpen ? false : isCollapsed}
              />
            ))}
          </nav>

          {/* Footer profile box */}
          <div className="mt-auto relative" ref={profileMenuRef}>
            <ProfileBox
              collapsed={isMobileOpen ? false : isCollapsed}
              name={user?.name}
              role={user?.role}
              avatarUrl={user?.avatarUrl}
              onClick={toggleProfileMenu}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            />

            {isProfileMenuOpen && (isMobileOpen || !isCollapsed) && (
              <div className="absolute bottom-20 left-0 right-0 z-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-[#C2570C]">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.role ?? "Member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSettings}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <Settings size={18} />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50"
                >
                  <LogOut size={18} />
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

function SidebarLink({ icon, label, href, collapsed, activePaths = [href] }) {
  const location = useLocation();

  const isActive = activePaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  return (
    <Link
      to={href}
      className={`
        group
        flex w-full items-center rounded-lg p-3
        transition-all duration-200
        cursor-pointer
        ${
          isActive
            ? "bg-[#C2570C] text-white shadow-md"
            : "text-gray-700 hover:bg-orange-800 hover:text-white"
        }
        ${collapsed ? "justify-center" : "gap-3"}
      `}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>

      {!collapsed && (
        <span className="font-medium whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}
