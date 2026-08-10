import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((s) => !s)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          reminder="You're all caught up, No reminder for today."
          isSideBarOpen={isMobileSidebarOpen || !isSidebarCollapsed}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
