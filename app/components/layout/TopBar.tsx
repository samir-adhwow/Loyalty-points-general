import { Icon } from "@iconify/react";

export default function TopBar({ title, onMenuClick }: { title: React.ReactNode; onMenuClick?: () => void }) {
  return (
    <header className="flex items-center border-b border-primary/20 px-4 sm:px-6 bg-white py-6">
      {/* Hamburger for mobile */}
      {onMenuClick && (
        <button
          className="sm:hidden mr-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Icon icon="heroicons:bars-3" width={28} />
        </button>
      )}
      <h1 className="flex items-center gap-2 text-2xl font-bold text-dark border-l-4 border-primary px-4">
        {title}
      </h1>
    </header>
  );
}
