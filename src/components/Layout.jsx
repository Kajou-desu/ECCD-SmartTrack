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
  };

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          isSidebarOpen={isMobileSidebarOpen}
          onOpenSidebar={openMobileSidebar}
          mobileMenuButtonRef={mobileMenuButtonRef}
          reminder="No reminder for today."
        />

        <main
          id="main-content"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-gray-100"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
