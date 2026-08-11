import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const mobileMenuButtonRef = useRef(null);

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);

    requestAnimationFrame(() => {
      mobileMenuButtonRef.current?.focus();
    });
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          isSideBarOpen={isMobileSidebarOpen}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          mobileMenuButtonRef={mobileMenuButtonRef}
        />

        <main
          id="main-content"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-gray-100"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
