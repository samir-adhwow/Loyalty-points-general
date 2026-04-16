"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const menu = [
  { label: "Dashboard", href: "/dashboard" },

  {
    label: "Rules",
    children: [
      { label: "All Rules", href: "/rules" },
      { label: "Create / Edit / View", disabled: true },
    ],
  },

  { label: "Point Details", href: "/loyalty-point-details" },
  { label: "Account Mappings", href: "/account-mappings" },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // ---------------- ROUTE CHECKS ----------------
  const isRulesRoute = pathname.startsWith("/rules");

  const isAllRulesActive = pathname === "/rules";

  const isCreateEditActive =
    pathname === "/rules/create" ||
    /^\/rules\/\d+\/(edit|view)$/.test(pathname);

  const isActive = (href?: string) => href && pathname.startsWith(href);

  // ---------------- AUTO OPEN ----------------
  useEffect(() => {
    const index = menu.findIndex((item) =>
      item.children?.some((child) =>
        child.href ? pathname.startsWith(child.href) : false,
      ),
    );

    setOpenIndex(index !== -1 ? index : null);
  }, [pathname]);

  // Responsive sidebar classes
  const sidebarClass = [
    "fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-primary/40 shadow-lg transform transition-transform duration-200",
    open ? "translate-x-0" : "-translate-x-full",
    "sm:static sm:z-auto sm:inset-0 sm:w-60 sm:translate-x-0 sm:shadow-sm"
  ].join(" ");

  return (
    <aside className={sidebarClass} style={{ minWidth: open ? 240 : undefined }}>
      {/* Close button for mobile */}
      <div className="flex py-4 items-center justify-between sm:justify-start sm:px-5 border-b border-primary/40">
        <Image src="/mainLogo.svg" alt="Logo" width={160} height={80} />
        {open && onClose && (
          <button
            className="sm:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <Icon icon="heroicons:x-mark" width={24} />
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="p-2 mt-4 space-y-1">
        {menu.map((item, i) => {
          // ---------------- SIMPLE LINK ----------------
          if (!item.children) {
            return (
              <Link
                key={i}
                href={item.href!}
                className={`flex items-center rounded-lg px-3 py-2 text-base font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary shadow-sm border-l-4 border-primary"
                    : "text-dark hover:bg-lighter"
                }`}
              >
                {item.label}
              </Link>
            );
          }

          // ---------------- RULES LOGIC ----------------
          const isOpen = openIndex === i;

          return (
            <div key={i}>
              <button
                onClick={() => {
                  setOpenIndex(isOpen ? null : i);
                  router.push("/rules"); // always go to All Rules
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium transition-all ${
                  isRulesRoute
                    ? "bg-primary/10 text-primary shadow-sm border-l-4 border-primary"
                    : "text-dark hover:bg-lighter"
                }`}
              >
                {item.label}
                <span
                  className={`transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  <Icon icon="heroicons:chevron-right-solid" width={16} />
                </span>
              </button>

              {/* CHILDREN */}
              {isOpen && (
                <div className="ml-3 mt-1 space-y-1">
                  {/* ALL RULES */}
                  <Link
                    href="/rules"
                    className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
                      isAllRulesActive
                        ? "text-primary font-semibold"
                        : "text-dark hover:bg-lighter"
                    }`}
                  >
                    <Icon
                      icon="ph:dot-fill"
                      width={24}
                      className={
                        isAllRulesActive ? "text-primary" : "text-dark"
                      }
                    />
                    All Rules
                  </Link>

                  {/* CREATE / EDIT / VIEW */}
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
                      isCreateEditActive
                        ? "text-primary font-semibold"
                        : "text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <Icon
                      icon="ph:dot-fill"
                      width={24}
                      className={`inline-block ${isCreateEditActive ? "text-primary" : "text-slate-500"}`}
                    />
                    Create / Edit / View
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
