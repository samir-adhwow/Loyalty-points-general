"use client";

import { Icon } from "@iconify/react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-lighter">
      {/* Sidebar: always visible on desktop, toggled on mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={
            <>
              WOW <Icon icon="garden:dash-stroke-12" /> Loyalty Points Earn &
              Burn
            </>
          }
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
