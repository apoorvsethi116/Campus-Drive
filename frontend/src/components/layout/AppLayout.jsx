import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { MobileSidebar } from "./MobileSidebar.jsx";
import { Navbar } from "./Navbar.jsx";

/**
 * Shared shell for every authenticated page: a fixed dark sidebar on
 * desktop (collapsing to a slide-over drawer on mobile), a top navbar,
 * and the routed page content in between. Individual dashboard/list
 * pages (Phase 7+) render inside the Outlet and don't need to know
 * anything about the surrounding chrome.
 */
export function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 flex-shrink-0 bg-slate-950 md:block">
        <div className="flex h-16 items-center px-5">
          <span className="font-display text-lg font-semibold text-white">CampusDrive AI</span>
        </div>
        <Sidebar />
      </aside>

      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
