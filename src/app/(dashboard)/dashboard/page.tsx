"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Flame,
  Target,
  Trophy,
  Activity,
  Boxes,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Gagal mengambil data statistik");
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const profile = data?.profile || {};
  const todayProgress = data?.todayProgress || {
    hours: 0,
    targetHours: 8,
    percentage: 0,
    remainingHours: "8.0",
    count: 0,
  };
  const categoryStats = data?.categoryStats || [];
  const recentActivities = data?.recentActivities || [];

  // Radial progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, todayProgress.percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;
  const isGoalReached = todayProgress.percentage >= 100;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Fintech SaaS Hero Section (Wolfpixel Style with Perfect Light & Dark Support) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black dark:from-[#111219] dark:via-[#0c0d14] dark:to-[#08080c] border border-slate-800 dark:border-white/[0.08] p-6 sm:p-10 text-white shadow-2xl shadow-slate-950/30 group">
        {/* Ambient Fiery Glow Beams */}
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-orange-600/30 via-amber-500/15 to-transparent blur-[90px] pointer-events-none group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/20 blur-[100px] pointer-events-none" />

        {/* 3D Geometric Isometric Wireframe */}
        <div className="absolute right-6 sm:right-12 bottom-6 sm:bottom-8 opacity-25 dark:opacity-30 pointer-events-none hidden md:block transform group-hover:rotate-6 transition-transform duration-700">
          <svg width="220" height="220" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="50,20 80,37 80,63 50,80 20,63 20,37" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="37" x2="80" y2="63" stroke="currentColor" strokeWidth="1.5" />
            <line x1="80" y1="37" x2="20" y2="63" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="currentColor" className="animate-pulse" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 max-w-2xl">
          {/* Tag Pill with Glowing Orange Dot */}
          <div className="inline-flex items-center gap-2.5 rounded-full bg-black/60 dark:bg-zinc-900/90 border border-white/20 dark:border-zinc-700/80 px-4 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-xl w-fit shadow-md">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <span>Personal Digital Log Book Protocol. Real-time.</span>
          </div>

          {/* Headline (Fintech Typography) */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
              One Activity Layer. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-white via-zinc-200 to-orange-400 bg-clip-text text-transparent">
                Every Milestone.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-400 font-normal leading-relaxed max-w-xl">
              Platform pencatatan presensi, rincian aktivitas harian, serta visualisasi target kerja dengan standar modern.
            </p>
          </div>

          {/* Action Capsule Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black shadow-xl shadow-orange-500/30 rounded-full cursor-pointer hover:scale-105 transition-all text-xs h-11 px-6 border border-orange-400/40"
            >
              <Link href="/logbook/new">
                <PlusCircle className="h-4 w-4 mr-2" /> Catat Aktivitas Baru
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/20 dark:border-zinc-700/90 bg-white/10 dark:bg-zinc-900/80 text-white hover:bg-white/20 dark:hover:bg-zinc-800 backdrop-blur-md rounded-full font-bold text-xs h-11 px-6 hover:scale-105 transition-all shadow-md"
            >
              <Link href="/reports">
                <TrendingUp className="h-4 w-4 mr-2 text-orange-400" /> Resume & Laporan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Today's Target Highlight Banner (Fiery Glow Card with Adaptive Light & Dark Support) */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#141620] dark:via-[#101118] dark:to-[#0c0d14] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/50 group">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-orange-500/10 dark:bg-orange-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={`absolute w-24 h-24 rounded-full blur-xl transition-all duration-700 ${
                  isGoalReached
                    ? "bg-emerald-500/25"
                    : todayProgress.hours > 0
                    ? "bg-orange-500/30"
                    : "bg-slate-300/30 dark:bg-zinc-700/20"
                }`}
              />

              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-zinc-800/80"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${
                    isGoalReached ? "stroke-emerald-500" : "stroke-orange-500"
                  }`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {clampedPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Target
                </span>
              </div>
            </div>

            {/* Target Description */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/25 px-3 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>Target Harian: 8.0 Jam Kerja</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isGoalReached ? "Target Harian Tercapai! 🏆" : `Tercatat ${todayProgress.hours} Jam Hari Ini`}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md font-medium">
                {isGoalReached
                  ? "Luar biasa! Seluruh target jam kerja hari ini telah tuntas tercatat."
                  : todayProgress.hours > 0
                  ? `Kurang ${todayProgress.remainingHours} jam lagi untuk menyelesaikan target harian.`
                  : "Belum ada catatan aktivitas hari ini. Mulai catat pekerjaan Anda sekarang!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black rounded-full text-xs h-10 px-5 shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Link href="/logbook/new">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5 text-orange-500" /> Tambah Entri
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. 4 Obsidian Metric Cards (Wolfpixel Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Jam Kerja */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Jam Kerja
            </span>
            <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-2.5 text-orange-600 dark:text-orange-400 shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              {metrics.totalHours || "0.0"} <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Jam</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Akumulasi durasi seluruh log book</p>
          </div>
        </div>

        {/* Card 2: Kehadiran & Aktivitas */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Catatan
            </span>
            <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-2.5 text-orange-600 dark:text-orange-400 shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              {metrics.totalEntries || 0} <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Entri</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Total seluruh laporan tersimpan</p>
          </div>
        </div>

        {/* Card 3: Selesai / Disetujui */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Status Selesai
            </span>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              {metrics.completed || 0} <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Entri</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Pekerjaan berstatus tuntas</p>
          </div>
        </div>

        {/* Card 4: Dalam Proses / Draf */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              In Progress / Draf
            </span>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              {(metrics.inProgress || 0) + (metrics.draft || 0)} <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Entri</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Dalam proses pengerjaan</p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Aktivitas Terbaru & Distribusi Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru (2 Kolom) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Aktivitas Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                Daftar pencatatan log book dan presensi terakhir Anda
              </p>
            </div>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-500/10 rounded-full"
            >
              <Link href="/logbook">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Belum ada aktivitas yang dicatat.</p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold">
                  <Link href="/logbook/new">Catat Aktivitas Sekarang</Link>
                </Button>
              </div>
            ) : (
              recentActivities.slice(0, 5).map((act: any) => (
                <Link
                  key={act.id}
                  href={`/logbook/${act.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:border-orange-500/40 transition-all group cursor-pointer"
                >
                  <div className="space-y-1 truncate pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                        {act.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{formatDate(act.activityDate)}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{formatTime(act.startTime)} - {formatTime(act.endTime)}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={act.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Distribusi Kategori (1 Kolom) */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-white/[0.08] pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-orange-500" />
              Distribusi Kategori
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              Pembagian waktu kerja berdasarkan bidang
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-6">Belum ada data kategori.</p>
            ) : (
              categoryStats.map((cat: any) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: cat.colorHex || "#f97316" }}
                      />
                      <span className="font-bold text-slate-800 dark:text-white">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{cat.hours} jam</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(8, (cat.hours / (metrics.totalHours || 1)) * 100))}%`,
                        backgroundColor: cat.colorHex,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
