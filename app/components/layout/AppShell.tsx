import { Icon } from "@iconify/react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-lighter">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={
            <>
              WOW <Icon icon="garden:dash-stroke-12" /> Loyalty Points Earn & Burn
            </>
          }
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
