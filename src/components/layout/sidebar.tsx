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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container with Frosted Crystal Glassmorphism */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl transition-all duration-300 select-none shadow-xl shadow-slate-900/5",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100/80 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent">
                  DIGITAL LOG BOOK
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Personal Edition
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Quick Info */}
        <div className={cn("p-4 border-b border-slate-100/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20", isCollapsed && "px-2 py-3 text-center")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 ring-2 ring-white dark:ring-slate-800">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{profile.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">{profile.jobTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links with 3D Pill Hover & Active Glow */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                />
                {!isCollapsed && <span className="flex-1 truncate tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100/80 dark:border-slate-800/80 text-[10px] text-slate-400 text-center font-mono">
            Digital Log Book &bull; 3D Glass UI
          </div>
        )}
      </aside>
    </>
  );
}
