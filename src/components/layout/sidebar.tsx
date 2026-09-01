"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useQuery } from "@tanstack/react-query";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isOpen, setIsOpen } = useSidebarStore();

  const { data } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  const profile = data?.profile || {
    name: "Pengguna Log Book",
    jobTitle: "Software Developer",
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Log Book Saya",
      href: "/logbook",
      icon: BookOpen,
    },
    {
      name: "Laporan & Ekspor",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Kategori & Profil",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 select-none",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  DIGITAL LOG BOOK
                </span>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Personal Edition
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Quick Info */}
        <div className={cn("p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30", isCollapsed && "px-2 py-3 text-center")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 font-semibold text-blue-700 dark:text-blue-300 border-2 border-white dark:border-slate-700 shadow-xs">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{profile.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.jobTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  )}
                />
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Digital Log Book &bull; Personal Edition
          </div>
        )}
      </aside>
    </>
  );
}
