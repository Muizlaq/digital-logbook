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
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
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
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, todayProgress.percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;
  const isGoalReached = todayProgress.percentage >= 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-indigo-950 dark:to-slate-900 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10 dark:shadow-black/40 border border-blue-600/30 dark:border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-blue-500/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-200" /> Personal Activity Log Book
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Halo, {profile.name || "Sobat Log Book"}! 👋
            </h2>
            <p className="text-sm text-blue-100 dark:text-blue-200">
              Catat setiap capaian, jam kerja, dan milestone proyek harian Anda secara teratur dan rapi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 font-bold shadow-md shadow-black/10 rounded-xl cursor-pointer"
            >
              <Link href="/logbook/new">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Catat Aktivitas Baru
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-white/10 dark:border-slate-700 text-white hover:bg-white/20 dark:hover:bg-slate-800 rounded-xl font-semibold"
            >
              <Link href="/reports">
                <TrendingUp className="h-4 w-4 mr-1.5" /> Rekap Laporan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Target Jam Harian (Progress Ring Card) + Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring Widget */}
        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-slate-900 shadow-xs relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Target Jam Kerja Hari Ini
              </span>
              {isGoalReached ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  <Trophy className="h-3 w-3" /> Tercapai 🎉
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                  <Flame className="h-3 w-3 text-amber-500" /> Target {todayProgress.targetHours} Jam
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${
                    isGoalReached
                      ? "stroke-emerald-500 dark:stroke-emerald-400"
                      : "stroke-blue-600 dark:stroke-blue-400"
                  }`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {todayProgress.percentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tercapai
                </span>
              </div>
            </div>

            {/* Target Description & Details */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {todayProgress.hours} <span className="text-sm font-semibold text-slate-400">/ {todayProgress.targetHours} Jam</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isGoalReached
                    ? "Luar biasa! Target jam kerja harian Anda telah terpenuhi hari ini."
                    : todayProgress.hours > 0
                    ? `Kurang ${todayProgress.remainingHours} jam lagi untuk mencapai target.`
                    : "Belum ada aktivitas dicatat hari ini. Yuk mulai mencatat!"}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <Button
                  asChild
                  size="sm"
                  className="h-8 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  <Link href="/logbook/new">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Catat Hari Ini
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
          </CardContent>
        </Card>

        {/* Total Aktivitas & Total Jam */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Jam Kerja */}
          <Card className="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Total Jam Kerja
              </CardTitle>
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/50 p-2 text-indigo-700 dark:text-indigo-300">
                <Timer className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{metrics.totalHours || "0"} Jam</div>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400 mt-1">Akumulasi seluruh waktu kerja</p>
            </CardContent>
          </Card>

          {/* Selesai */}
          <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Aktivitas Selesai
              </CardTitle>
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{metrics.completed || 0}</div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1">Pekerjaan terselesaikan</p>
            </CardContent>
          </Card>

          {/* In Progress / Draf */}
          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                In Progress / Draf
              </CardTitle>
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 p-2 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {(metrics.inProgress || 0) + (metrics.draft || 0)}
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-1">Dalam proses pengerjaan</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid: Recent Activities & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Aktivitas Terbaru Anda
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Entri pencatatan terakhir yang baru saja Anda tambahkan
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                <Link href="/logbook">
                  Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Belum ada log book yang dicatat. Klik &quot;Catat Aktivitas Baru&quot; untuk memulai!
                </div>
              ) : (
                recentActivities.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-2 text-blue-600 dark:text-blue-400 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/logbook/${item.id}`}
                          className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.categoryColor || "#3b82f6" }}
                            />
                            {item.categoryName}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formatDate(item.activityDate)}
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono text-[11px]">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <StatusBadge status={item.status} />
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-lg dark:border-slate-800">
                        <Link href={`/logbook/${item.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Category Distribution */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Distribusi Kategori Pekerjaan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada kategori yang digunakan.</p>
              ) : (
                categoryStats.map((cat: any) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{cat.name}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{cat.count} entri</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
            </CardContent>
          </Card>

          {/* Quick Tip Card */}
          <Card className="border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                💡 Tips Log Book Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Capai target jam harian Anda secara bertahap. Anda dapat mengatur target jam kerja harian di menu Pengaturan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
