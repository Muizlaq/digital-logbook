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
  Layers,
  Sparkles,
  Timer,
  FileText,
  Calendar,
  Flame,
  Target,
  Trophy,
  Zap,
  Activity,
  HeartPulse,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
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
    <div className="space-y-8">
      {/* 1. 3D Holographic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 dark:from-blue-950 dark:via-indigo-950 dark:to-slate-900 p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/20 dark:shadow-indigo-950/50 border border-white/20 dark:border-blue-500/20 group">
        {/* Animated Aurora Light Shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-indigo-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-blue-500/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/25 dark:border-blue-400/30 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200 animate-pulse" />
              <span>Personal 3D Digital Log Book</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              Halo, {profile.name || "Sobat Log Book"}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-200/90 leading-relaxed">
              Catat setiap milestone pekerjaan, jam kerja harian, dan presensi Anda secara teratur dengan visualisasi 3D analitik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:text-white dark:hover:from-blue-500 dark:hover:to-indigo-500 font-extrabold shadow-xl shadow-black/15 rounded-2xl cursor-pointer hover:scale-105 transition-all text-xs h-10 px-5"
            >
              <Link href="/logbook/new">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Catat Aktivitas
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-white/10 dark:border-slate-700/80 text-white hover:bg-white/20 dark:hover:bg-slate-800/80 backdrop-blur-md rounded-2xl font-bold text-xs h-10 px-4 hover:scale-105 transition-all"
            >
              <Link href="/reports">
                <TrendingUp className="h-4 w-4 mr-1.5 text-cyan-300" /> Resume Laporan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Target Jam Harian (3D Progress Ring Sphere) + Quick 3D Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Glowing Progress Ring Sphere Card */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Target Jam Kerja Hari Ini
            </span>
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-300 dark:border-emerald-800">
                <Trophy className="h-3 w-3" /> Tercapai 🎉
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                <Flame className="h-3 w-3 text-amber-500" /> Target {todayProgress.targetHours} Jam
              </span>
            )}
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* 3D Glowing Radial Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer Glow Halo */}
              <div
                className={`absolute w-24 h-24 rounded-full blur-xl transition-all duration-700 ${
                  isGoalReached
                    ? "bg-emerald-500/30"
                    : todayProgress.hours > 0
                    ? "bg-blue-500/30"
                    : "bg-slate-400/10"
                }`}
              />

              <svg className="w-32 h-32 transform -rotate-90">
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="ringGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-200/60 dark:stroke-slate-800"
                  strokeWidth="9"
                  fill="transparent"
                />

                {/* Progress */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={isGoalReached ? "url(#ringGoalGradient)" : "url(#ringGradient)"}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>

              {/* Inner Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {todayProgress.percentage}%
                </span>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                  Tercapai
                </span>
              </div>
            </div>

            {/* Target Description */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {todayProgress.hours} <span className="text-xs font-semibold text-slate-400">/ {todayProgress.targetHours} Jam</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isGoalReached
                    ? "Target harian telah terpenuhi dengan sempurna hari ini!"
                    : todayProgress.hours > 0
                    ? `Kurang ${todayProgress.remainingHours} jam lagi untuk mencapai target.`
                    : "Belum ada aktivitas dicatat hari ini. Yuk mulai!"}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <Button
                  asChild
                  size="sm"
                  className="h-8 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  <Link href="/logbook/new">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Catat Sekarang
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl dark:border-slate-800"
                >
                  <Link href="/settings">Ubah Target</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Isometric KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Jam Kerja */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Total Jam Kerja
              </span>
              <div className="rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 p-2.5 text-indigo-700 dark:text-indigo-300 shadow-md shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                <Timer className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-3">
              <div className="text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
                {metrics.totalHours || "0"} <span className="text-xs font-semibold text-indigo-400">Jam</span>
              </div>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-1">Akumulasi seluruh waktu kerja</p>
            </div>
          </div>

          {/* Aktivitas Selesai */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Terselesaikan
              </span>
              <div className="rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 p-2.5 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-3">
              <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                {metrics.completed || 0} <span className="text-xs font-semibold text-emerald-400">Entri</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">Pekerjaan berstatus tuntas</p>
            </div>
          </div>

          {/* Dalam Proses / Draf */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                In Progress / Draf
              </span>
              <div className="rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 p-2.5 text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-3">
              <div className="text-3xl font-black text-amber-950 dark:text-amber-100 tracking-tight">
                {(metrics.inProgress || 0) + (metrics.draft || 0)} <span className="text-xs font-semibold text-amber-400">Entri</span>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">Dalam proses pengerjaan</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Recent Activity Glass Feed & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden shadow-xs">
            <div className="flex flex-row items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Aktivitas & Presensi Terbaru
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Entri pencatatan terakhir yang baru saja Anda rekam
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold">
                <Link href="/logbook">
                  Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada log book yang dicatat. Klik &quot;Catat Aktivitas Baru&quot; untuk memulai!
                </div>
              ) : (
                recentActivities.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/80 dark:to-indigo-950/80 p-2.5 text-blue-600 dark:text-blue-400 mt-0.5 shadow-xs border border-blue-100/60 dark:border-blue-900/40">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/logbook/${item.id}`}
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.categoryColor || "#3b82f6" }}
                            />
                            {item.categoryName}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formatDate(item.activityDate)}
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono text-[10px]">
                            {item.status === "SICK" || item.status === "PERMISSION" || item.status === "HOLIDAY"
                              ? "Presensi"
                              : `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <StatusBadge status={item.status} />
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs rounded-xl dark:border-slate-800">
                        <Link href={`/logbook/${item.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Distribusi Kategori Pekerjaan
            </h3>
            <div className="space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada kategori yang digunakan.</p>
              ) : (
                categoryStats.map((cat: any) => (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{cat.name}</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{cat.count} entri</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: cat.colorHex || "#3b82f6",
                          width: `${Math.min(100, (cat.count / (metrics.totalLogBooks || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tip Card with Holographic Gradient */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/40 shadow-xs space-y-2">
            <div className="text-xs font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Tips Produktivitas Harian
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Jaga konsistensi catatan harian Anda untuk melihat tren jam kerja di halaman <strong>Resume Mingguan</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
