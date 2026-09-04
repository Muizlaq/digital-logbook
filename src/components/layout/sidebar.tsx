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
  Flame,
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container with Obsidian Glass */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-2xl transition-all duration-300 select-none shadow-2xl shadow-black/20",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-white/[0.07]">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-600 text-white shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-black tracking-tight bg-gradient-to-r from-slate-900 via-orange-900 to-amber-900 dark:from-white dark:via-orange-100 dark:to-amber-200 bg-clip-text text-transparent">
                  DIGITAL LOG BOOK
                </span>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                  Fintech Edition
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Quick Info */}
        <div className={cn("p-4 border-b border-slate-100 dark:border-white/[0.07] bg-slate-50/50 dark:bg-white/[0.02]", isCollapsed && "px-2 py-3 text-center")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 font-black text-white shadow-md shadow-orange-500/20 ring-2 ring-white dark:ring-zinc-800">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{profile.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-medium">{profile.jobTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links with Fiery Glow Active State */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white hover:translate-x-1",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 dark:text-zinc-400 group-hover:text-orange-500"
                  )}
                />
                {!isCollapsed && <span className="flex-1 truncate tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-white/[0.07] text-[10px] text-zinc-500 text-center font-mono">
            Digital Log Book &bull; Obsidian UI
          </div>
        )}
      </aside>
    </>
  );
}
