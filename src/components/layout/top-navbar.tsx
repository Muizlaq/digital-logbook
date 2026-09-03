"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, PlusCircle, Calendar, Sparkles } from "lucide-react";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { formatDate } from "@/lib/utils";

export function TopNavbar() {
  const pathname = usePathname();
  const { toggleSidebar, isCollapsed } = useSidebarStore();

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Ringkasan";
    if (pathname.startsWith("/logbook/new")) return "Catat Aktivitas Baru";
    if (pathname.includes("/edit")) return "Edit Log Book Aktivitas";
    if (pathname.startsWith("/logbook/")) return "Detail Aktivitas Log Book";
    if (pathname.startsWith("/logbook")) return "Log Book Saya";
    if (pathname.startsWith("/reports")) return "Laporan & Rekapitulasi";
    if (pathname.startsWith("/settings")) return "Kategori & Pengaturan Profil";
    return "Log Book";
  };

  const todayFormatted = formatDate(new Date());

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 px-4 sm:px-6 backdrop-blur-2xl transition-all duration-300 shadow-xs ${
        isCollapsed ? "lg:pl-24" : "lg:pl-68"
      }`}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </Button>

        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" /> Hari ini: {todayFormatted}
          </p>
        </div>
      </div>

      {/* Right: Theme Toggle & Quick Action Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Link href="/logbook/new">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Catat Aktivitas
          </Link>
        </Button>
      </div>
    </header>
  );
}
