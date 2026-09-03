"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  FileText,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck,
  CalendarDays,
  Target,
  HeartPulse,
  UserCheck,
  Palmtree,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface WeeklyResumeProps {
  logbooks: any[];
  categories: any[];
  profile: any;
}

const DAY_LABELS = [
  { dayIndex: 0, label: "Hari 1 (Senin)", shortName: "Senin" },
  { dayIndex: 1, label: "Hari 2 (Selasa)", shortName: "Selasa" },
  { dayIndex: 2, label: "Hari 3 (Rabu)", shortName: "Rabu" },
  { dayIndex: 3, label: "Hari 4 (Kamis)", shortName: "Kamis" },
  { dayIndex: 4, label: "Hari 5 (Jumat)", shortName: "Jumat" },
  { dayIndex: 5, label: "Hari 6 (Sabtu)", shortName: "Sabtu" },
  { dayIndex: 6, label: "Hari 7 (Minggu)", shortName: "Minggu" },
];

export function WeeklyResume({ logbooks = [], categories = [], profile }: WeeklyResumeProps) {
  // State: Selected reference date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate Monday through Sunday for selected week
  const { mondayDate, sundayDate, weekDates, weekLabel } = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(d.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      dates.push(cur.toISOString().slice(0, 10));
    }

    const mondayStr = monday.toISOString().slice(0, 10);
    const sundayStr = sunday.toISOString().slice(0, 10);

    const weekLabelStr = `${formatDate(mondayStr)} - ${formatDate(sundayStr)}`;

    return {
      mondayDate: monday,
      sundayDate: sunday,
      weekDates: dates,
      weekLabel: weekLabelStr,
    };
  }, [selectedDate]);

  // Navigate weeks
  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  const currentWeek = () => {
    setSelectedDate(new Date());
  };

  // Group logbooks day by day (Day 1 s/d Day 7)
  const mondayStr = mondayDate.toISOString().slice(0, 10);
  const sundayStr = sundayDate.toISOString().slice(0, 10);

  const weekLogbooks = useMemo(() => {
    return logbooks
      .filter((lb) => lb.activityDate >= mondayStr && lb.activityDate <= sundayStr)
      .sort((a, b) => new Date(a.activityDate + "T" + a.startTime).getTime() - new Date(b.activityDate + "T" + b.startTime).getTime());
  }, [logbooks, mondayStr, sundayStr]);

  // Build Day 1 - Day 7 detailed breakdown structures
  const daysBreakdown = useMemo(() => {
    return DAY_LABELS.map((item, idx) => {
      const dateStr = weekDates[idx];
      const dayLogs = weekLogbooks.filter((lb) => lb.activityDate === dateStr);

      let totalMinutes = 0;
      dayLogs.forEach((lb) => {
        // Sick, Permission, Holiday count as 0 working minutes
        if (lb.status === "SICK" || lb.status === "PERMISSION" || lb.status === "HOLIDAY") {
          return;
        }
        try {
          const [h1, m1] = lb.startTime.split(":").map(Number);
          const [h2, m2] = lb.endTime.split(":").map(Number);
          const diff = h2 * 60 + m2 - (h1 * 60 + m1);
          if (diff > 0) totalMinutes += diff;
        } catch {
          // ignore
        }
      });

      const hours = (totalMinutes / 60).toFixed(1);
      const isWeekend = idx >= 5;

      const hasSick = dayLogs.some((l) => l.status === "SICK");
      const hasPermission = dayLogs.some((l) => l.status === "PERMISSION");
      const hasHoliday = dayLogs.some((l) => l.status === "HOLIDAY");

      return {
        ...item,
        dateStr,
        formattedDate: formatDate(dateStr),
        dayLogs,
        totalMinutes,
        hours: parseFloat(hours),
        isWeekend,
        hasActivity: dayLogs.length > 0,
        hasSick,
        hasPermission,
        hasHoliday,
      };
    });
  }, [weekDates, weekLogbooks]);

  // Aggregate Metrics for this week
  const totalWeeklyMinutes = daysBreakdown.reduce((acc, d) => acc + d.totalMinutes, 0);
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);
  const dailyTarget = profile?.dailyTargetHours || 8;
  const weeklyTarget = dailyTarget * 5; // 5 working days
  const weeklyProgressPercent = Math.round((parseFloat(totalWeeklyHours) / weeklyTarget) * 100);

  // Presence counters
  const presentDaysCount = daysBreakdown.filter((d) => !d.isWeekend && d.hasActivity && !d.hasSick && !d.hasPermission && !d.hasHoliday).length;
  const sickDaysCount = daysBreakdown.filter((d) => d.hasSick).length;
  const permissionDaysCount = daysBreakdown.filter((d) => d.hasPermission).length;
  const holidayDaysCount = daysBreakdown.filter((d) => d.hasHoliday).length;

  const avgHoursPerActiveDay = presentDaysCount > 0 ? (parseFloat(totalWeeklyHours) / presentDaysCount).toFixed(1) : "0.0";

  // Category breakdown
  const categoryMinutesMap: { [catId: string]: number } = {};
  weekLogbooks.forEach((lb) => {
    if (lb.status === "SICK" || lb.status === "PERMISSION" || lb.status === "HOLIDAY") return;
    try {
      const [h1, m1] = lb.startTime.split(":").map(Number);
      const [h2, m2] = lb.endTime.split(":").map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      if (diff > 0) {
        const catKey = lb.categoryId || "uncategorized";
        categoryMinutesMap[catKey] = (categoryMinutesMap[catKey] || 0) + diff;
      }
    } catch {
      // ignore
    }
  });

  let topCatId = "";
  let topCatMinutes = 0;
  Object.keys(categoryMinutesMap).forEach((catId) => {
    if (categoryMinutesMap[catId] > topCatMinutes) {
      topCatMinutes = categoryMinutesMap[catId];
      topCatId = catId;
    }
  });
  const topCategory = categories.find((c) => c.id === topCatId);
  const topCategoryName = topCategory ? topCategory.name : "Software & Teknis";

  // EXPORT WEEKLY RESUME PDF (Day 1 s/d Day 5 Structured Format)
  const exportWeeklyPDF = () => {
    if (weekLogbooks.length === 0) {
      toast.error("Belum ada data aktivitas di pekan ini untuk dicetak.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait" });
    const profileName = profile?.name || "Pengguna Log Book";
    const jobTitle = profile?.jobTitle || "Software Developer";

    // 1. Header Banner
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 24, "F");

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("RESUME LAPORAN MINGGUAN (HARI 1 - HARI 5)", 14, 15);

    // 2. Metadata Info
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Nama: ${profileName} (${jobTitle})`, 14, 31);
    doc.text(`Periode Pekan: ${weekLabel}`, 14, 36);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 140, 31);
    doc.text(`Presensi: Hadir ${presentDaysCount}h | Sakit ${sickDaysCount}h | Izin ${permissionDaysCount}h`, 140, 36);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, 196, 40);

    // 3. Day 1 - Day 5 Detailed Table
    const tableColumn = ["Hari / Tanggal", "Jam Kerja", "Kategori", "Aktivitas & Keterangan Output", "Status Presensi"];
    const tableRows: any[] = [];

    daysBreakdown.slice(0, 5).forEach((d) => {
      if (d.dayLogs.length === 0) {
        tableRows.push([
          `${d.label}\n${d.formattedDate}`,
          "0 Jam",
          "-",
          "Tidak ada catatan aktivitas kerja pada hari ini.",
          "Libur / Draf",
        ]);
      } else {
        d.dayLogs.forEach((lb, logIdx) => {
          const cat = categories.find((c) => c.id === lb.categoryId)?.name || "Umum";
          let statusText = lb.status;
          if (lb.status === "SICK") statusText = "SAKIT 🏥";
          else if (lb.status === "PERMISSION") statusText = "IZIN / CUTI 📄";
          else if (lb.status === "HOLIDAY") statusText = "LIBUR 🏖️";
          else if (lb.status === "COMPLETED") statusText = "HADIR - SELESAI ✅";

          tableRows.push([
            logIdx === 0 ? `${d.label}\n${d.formattedDate}\n(Total: ${d.hours}j)` : "",
            lb.status === "SICK" || lb.status === "PERMISSION" || lb.status === "HOLIDAY"
              ? "0 Jam (Izin/Sakit)"
              : `${lb.startTime} - ${lb.endTime}\n(${calculateDuration(lb.startTime, lb.endTime)})`,
            cat,
            `• ${lb.title}\n${lb.status === "SICK" ? "Keterangan Medis: " : "Output: "}${lb.outputResult || lb.description}${lb.notes ? `\nCatatan: ${lb.notes}` : ""}`,
            statusText,
          ]);
        });
      }
    });

    // Add weekend if has activities
    const weekendWithLogs = daysBreakdown.slice(5).filter((d) => d.hasActivity);
    weekendWithLogs.forEach((d) => {
      d.dayLogs.forEach((lb, logIdx) => {
        const cat = categories.find((c) => c.id === lb.categoryId)?.name || "Umum";
        tableRows.push([
          logIdx === 0 ? `${d.label}\n${d.formattedDate}\n(Total: ${d.hours}j)` : "",
          `${lb.startTime} - ${lb.endTime}`,
          cat,
          `• ${lb.title}\nOutput: ${lb.outputResult || lb.description}`,
          lb.status,
        ]);
      });
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 44,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    });

    // 4. Executive Summary Footer Box
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    if (finalY < 230) {
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("SINTESIS & REKAPITULASI MINGGUAN:", 14, finalY + 10);

      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`1. Total Akumulasi Jam Kerja Efektif: ${totalWeeklyHours} Jam (${weeklyProgressPercent}% dari target pekanan).`, 16, finalY + 16);
      doc.text(`2. Rekapitulasi Presensi: Hadir ${presentDaysCount} Hari | Sakit ${sickDaysCount} Hari | Izin ${permissionDaysCount} Hari | Libur ${holidayDaysCount} Hari.`, 16, finalY + 21);
      doc.text(`3. Rata-rata Jam Kerja per Hari Aktif: ${avgHoursPerActiveDay} Jam / hari hadir.`, 16, finalY + 26);
      doc.text(`4. Fokus Utama Bidang: ${topCategoryName}.`, 16, finalY + 31);
    }

    doc.save(`Resume_Laporan_Mingguan_${profileName.replace(/\s+/g, "_")}_${mondayStr}_sd_${sundayStr}.pdf`);
    toast.success("Resume Mingguan PDF berhasil diunduh.");
  };

  return (
    <div className="space-y-6">
      {/* Week Selector Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Resume Mingguan: {weekLabel}
                </h3>
                {weeklyProgressPercent >= 100 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <Trophy className="h-3 w-3" /> Target Terpenuhi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rangkuman alur aktivitas kerja harian terstruktur dari <strong>Hari 1 (Senin)</strong> sampai <strong>Hari 5 (Jumat)</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={currentWeek}
              className="text-xs font-semibold dark:border-slate-800"
            >
              Pekan Ini
            </Button>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevWeek}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Pekan Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextWeek}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Pekan Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={exportWeeklyPDF}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Cetak Resume (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sintesis Rekapitulasi 5 Hari (Top KPI Summary with Attendance breakdown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jam Kerja */}
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Total Jam Efektif
            </CardTitle>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200">
              {totalWeeklyHours} <span className="text-xs font-semibold text-slate-400">/ {weeklyTarget} Jam</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata {avgHoursPerActiveDay} Jam / hari hadir ({weeklyProgressPercent}%)
            </p>
          </CardContent>
        </Card>

        {/* Kehadiran & Absensi */}
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Rekap Presensi
            </CardTitle>
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2 text-emerald-700 dark:text-emerald-300">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {presentDaysCount} <span className="text-xs font-semibold text-slate-400">Hadir</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              {sickDaysCount > 0 && <span className="text-rose-600 font-bold">🏥 {sickDaysCount} Sakit</span>}
              {permissionDaysCount > 0 && <span className="text-amber-600 font-bold">📄 {permissionDaysCount} Izin</span>}
              {holidayDaysCount > 0 && <span className="text-purple-600 font-bold">🏖️ {holidayDaysCount} Libur</span>}
              {sickDaysCount === 0 && permissionDaysCount === 0 && holidayDaysCount === 0 && (
                <span>Kehadiran 100% penuh</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fokus Bidang Utama */}
        <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Fokus Utama Pekan Ini
            </CardTitle>
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/50 p-2 text-purple-700 dark:text-purple-300">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold text-purple-900 dark:text-purple-200 truncate">
              {topCategoryName}
            </div>
            <p className="text-xs text-purple-700/80 dark:text-purple-400 mt-1">
              {(topCatMinutes / 60).toFixed(1)} Jam dialokasikan
            </p>
          </CardContent>
        </Card>

        {/* Aktivitas Tuntas */}
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Aktivitas Selesai
            </CardTitle>
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 p-2 text-amber-700 dark:text-amber-300">
              <FileCheck className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
              {weekLogbooks.filter((l) => l.status === "COMPLETED").length} <span className="text-xs font-semibold text-slate-400">/ {weekLogbooks.length}</span>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-1">
              Pekerjaan berstatus selesai
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION: DAY 1 S/D DAY 5 CHRONOLOGICAL TIMELINE RESUME */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Rangkuman Alur Kerja Harian (Hari 1 s/d Hari 5)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {presentDaysCount} hari hadir {sickDaysCount > 0 ? `• ${sickDaysCount} hari sakit` : ""} {permissionDaysCount > 0 ? `• ${permissionDaysCount} hari izin` : ""}
          </span>
        </div>

        <div className="space-y-4">
          {daysBreakdown.slice(0, 5).map((day) => {
            const isSickDay = day.hasSick;
            const isPermissionDay = day.hasPermission;
            const isHolidayDay = day.hasHoliday;

            return (
              <Card
                key={day.dateStr}
                className={`border transition-all ${
                  isSickDay
                    ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs"
                    : isPermissionDay
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs"
                    : isHolidayDay
                    ? "border-purple-300 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs"
                    : day.hasActivity
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                    : "border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/30 opacity-75"
                }`}
              >
                {/* Day Header */}
                <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-t-xl ${
                  isSickDay
                    ? "bg-rose-100/60 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50"
                    : isPermissionDay
                    ? "bg-amber-100/60 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50"
                    : isHolidayDay
                    ? "bg-purple-100/60 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/50"
                    : "bg-slate-50/60 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold text-white shadow-xs ${
                      isSickDay ? "bg-rose-600" : isPermissionDay ? "bg-amber-600" : isHolidayDay ? "bg-purple-600" : "bg-blue-600"
                    }`}>
                      {day.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {day.formattedDate}
                    </span>
                    {isSickDay && <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-md">🏥 Izin Sakit</span>}
                    {isPermissionDay && <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">📄 Izin / Cuti</span>}
                    {isHolidayDay && <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">🏖️ Libur</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Total: {day.hours} Jam
                    </span>
                    <span className="text-xs text-slate-400">
                      ({day.dayLogs.length} catatan)
                    </span>
                  </div>
                </div>

                {/* Day Content */}
                <CardContent className="p-4">
                  {day.dayLogs.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400 italic">
                      Tidak ada catatan aktivitas kerja pada hari ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {day.dayLogs.map((log: any) => {
                        const category = categories.find((c) => c.id === log.categoryId);
                        const isSick = log.status === "SICK";
                        const isPerm = log.status === "PERMISSION";
                        const isHoli = log.status === "HOLIDAY";

                        const colorHex = isSick ? "#f43f5e" : isPerm ? "#f59e0b" : isHoli ? "#a855f7" : category?.colorHex || "#3b82f6";

                        return (
                          <div
                            key={log.id}
                            className={`p-3.5 rounded-xl border space-y-2 ${
                              isSick
                                ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30"
                                : isPerm
                                ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30"
                                : isHoli
                                ? "border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/30"
                                : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
                            }`}
                          >
                            {/* Title & Time */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {log.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-4.5 font-mono">
                                  <span>{isSick || isPerm || isHoli ? "Presensi Khusus" : `${formatTime(log.startTime)} - ${formatTime(log.endTime)}`}</span>
                                  <span>&bull;</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {category?.name || "Umum"}
                                  </span>
                                  {log.location && (
                                    <>
                                      <span>&bull;</span>
                                      <span>{log.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <StatusBadge status={log.status} />
                            </div>

                            {/* Description & Output Result */}
                            <div className="pl-4.5 space-y-1 text-xs">
                              <p className="text-slate-600 dark:text-slate-300">
                                {log.description}
                              </p>
                              {log.outputResult && (
                                <div className={`p-2 rounded-lg border text-xs ${
                                  isSick
                                    ? "bg-rose-100/60 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                                    : isPerm
                                    ? "bg-amber-100/60 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200"
                                    : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200"
                                }`}>
                                  <strong>{isSick ? "Keterangan Medis / Surat Dokter:" : isPerm ? "Keterangan Izin:" : "Output / Hasil Capaian:"}</strong> {log.outputResult}
                                </div>
                              )}
                              {log.notes && (
                                <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 text-xs">
                                  <strong>Catatan:</strong> {log.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function calculateDuration(start: string, end: string): string {
  try {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (totalMinutes <= 0) return "0 jam";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}j ${minutes}m`;
    if (hours > 0) return `${hours} jam`;
    return `${minutes} menit`;
  } catch {
    return "-";
  }
}
