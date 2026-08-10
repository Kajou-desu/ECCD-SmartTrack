import { useState } from "react";
import { Outlet } from "react-router-dom";
import ParentHeader from "./parentHeader";
import ParentSidebar from "./parentSidebar";

export default function ParentLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ParentSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((s) => !s)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <ParentHeader
          reminder="Welcome to your parent portal. Stay updated on your child's progress."
          isSideBarOpen={isMobileSidebarOpen || !isSidebarCollapsed}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
