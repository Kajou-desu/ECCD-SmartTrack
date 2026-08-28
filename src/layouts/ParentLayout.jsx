import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import ParentHeader from "@components/navigation/ParentHeader";
import ParentSidebar from "@components/navigation/ParentSidebar";
import { ParentChildProvider } from "@context/ParentChildContext";

export default function ParentLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const mobileMenuButtonRef = useRef(null);

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);

    requestAnimationFrame(() => {
      mobileMenuButtonRef.current?.focus();
    });
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobileSidebarOpen]);

  return (
    <ParentChildProvider>
      <div className="flex h-dvh w-full overflow-hidden">
        <ParentSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ParentHeader
            reminder="Welcome to your parent portal. Stay updated on your child's progress."
            isSidebarOpen={isMobileSidebarOpen}
            onOpenSidebar={openMobileSidebar}
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
    </ParentChildProvider>
  );
}
