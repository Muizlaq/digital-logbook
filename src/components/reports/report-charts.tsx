"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Clock,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ReportChartsProps {
  rows: any[];
  summary: {
    total: number;
    totalHours: string;
    completed: number;
    inProgress: number;
    draft: number;
  };
  categories?: any[];
}

export function ReportCharts({ rows, summary, categories = [] }: ReportChartsProps) {
  const [hoveredDay, setHoveredDay] = useState<any>(null);

  // Group working hours and count by date
  const dateMap: { [date: string]: { totalMinutes: number; count: number; titles: string[] } } = {};

  rows.forEach((r) => {
    if (!r.activityDate) return;
    if (!dateMap[r.activityDate]) {
      dateMap[r.activityDate] = { totalMinutes: 0, count: 0, titles: [] };
    }
    dateMap[r.activityDate].count += 1;
    if (r.title) dateMap[r.activityDate].titles.push(r.title);

    try {
      const [h1, m1] = (r.startTime || "00:00").split(":").map(Number);
      const [h2, m2] = (r.endTime || "00:00").split(":").map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      if (diff > 0) dateMap[r.activityDate].totalMinutes += diff;
    } catch {
      // ignore
    }
  });

  // Convert to sorted day array (last 7 recorded days)
  const chartDays = Object.keys(dateMap)
    .sort()
    .slice(-7)
    .map((dateStr) => {
      const hours = parseFloat((dateMap[dateStr].totalMinutes / 60).toFixed(1));
      const d = new Date(dateStr + "T00:00:00");
      const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d);
      const formattedDate = formatDate(dateStr);

      return {
        dateStr,
        dayName,
        formattedDate,
        hours,
        count: dateMap[dateStr].count,
        titles: dateMap[dateStr].titles,
      };
    });

  // Calculate maximum hours for vertical scale (minimum 8 hours ceiling)
  const maxRecorded = Math.max(...chartDays.map((d) => d.hours), 0);
  const maxScale = Math.max(Math.ceil(maxRecorded * 1.25), 8);

  // Category breakdown stats
  const categoryCountMap: { [cat: string]: { count: number; minutes: number } } = {};
  rows.forEach((r) => {
    const cat = r.category || "Umum";
    if (!categoryCountMap[cat]) {
      categoryCountMap[cat] = { count: 0, minutes: 0 };
    }
    categoryCountMap[cat].count += 1;
    try {
      const [h1, m1] = (r.startTime || "00:00").split(":").map(Number);
      const [h2, m2] = (r.endTime || "00:00").split(":").map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      if (diff > 0) categoryCountMap[cat].minutes += diff;
    } catch {
      // ignore
    }
  });

  const categoryBreakdown = Object.keys(categoryCountMap).map((catName) => {
    const matchedCategory = categories.find((c) => c.name === catName);
    const colorHex = matchedCategory?.colorHex || "#3b82f6";
    const hours = (categoryCountMap[catName].minutes / 60).toFixed(1);
    const percentage = summary.total > 0 ? Math.round((categoryCountMap[catName].count / summary.total) * 100) : 0;

    return {
      name: catName,
      count: categoryCountMap[catName].count,
      hours,
      percentage,
      colorHex,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Bar Chart: Jam Kerja Harian */}
      <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Grafik Durasi Jam Kerja Harian
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Visualisasi diagram batang akumulasi jam kerja Anda per tanggal aktivitas
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <Clock className="h-3.5 w-3.5" /> Total: {summary.totalHours} Jam
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {chartDays.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada data aktivitas untuk divisualisasikan.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chart Visual with Y-Axis & Bars */}
              <div className="flex items-stretch gap-3">
                {/* Y-Axis scale labels */}
                <div className="flex flex-col justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 py-1 select-none pr-1">
                  <span>{maxScale}j</span>
                  <span>{Math.round(maxScale * 0.66)}j</span>
                  <span>{Math.round(maxScale * 0.33)}j</span>
                  <span>0j</span>
                </div>

                {/* Bars Area */}
                <div className="relative flex-1 flex items-end justify-around gap-4 sm:gap-8 h-48 border-b border-slate-200 dark:border-slate-800 pb-1">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                    <div className="w-full" />
                  </div>

                  {chartDays.map((day) => {
                    const barHeightPx = Math.max(12, Math.round((day.hours / maxScale) * 165));
                    const isHovered = hoveredDay?.dateStr === day.dateStr;

                    return (
                      <div
                        key={day.dateStr}
                        className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer max-w-[64px]"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {/* Tooltip on Hover */}
                        {isHovered && (
                          <div className="absolute -top-12 z-30 whitespace-nowrap rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-bold shadow-xl shadow-black/30 animate-in fade-in zoom-in-95">
                            <div>{day.hours} Jam ({day.count} Aktivitas)</div>
                            <div className="text-[10px] opacity-75 font-normal">{day.formattedDate}</div>
                          </div>
                        )}

                        {/* Exact Value Tag on top of Bar */}
                        <span className={`text-[11px] font-bold mb-1 transition-colors ${isHovered ? "text-blue-600 dark:text-blue-400 scale-105" : "text-slate-600 dark:text-slate-400"}`}>
                          {day.hours}j
                        </span>

                        {/* The Bar Column */}
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 shadow-sm ${
                            isHovered
                              ? "bg-gradient-to-t from-blue-700 via-indigo-600 to-blue-500 shadow-lg shadow-blue-500/30 scale-105"
                              : "bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
                          }`}
                          style={{ height: `${barHeightPx}px` }}
                        />

                        {/* Day & Date Label */}
                        <div className="mt-2 text-center select-none">
                          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            {day.dayName}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {day.dateStr.slice(8, 10)}/{day.dateStr.slice(5, 7)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Legend & Average */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-medium">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500" />
                  <span>Durasi Jam Kerja Harian</span>
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Rata-rata: {(parseFloat(summary.totalHours) / (chartDays.length || 1)).toFixed(1)} Jam / Hari Kerja
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Distribusi Kategori Pekerjaan */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Distribusi Kategori
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan porsi aktivitas berdasarkan jenis pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada kategori yang tercatat.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[160px]">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{cat.count} entri</span>
                      <span className="text-[11px] text-slate-400">({cat.percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: cat.colorHex,
                        width: `${cat.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
