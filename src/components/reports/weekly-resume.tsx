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
  Download,
  Sparkles,
  Layers,
  FileCheck,
  CalendarDays,
  UserCheck,
} from "lucide-react";
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

  // Filter logbooks in this Monday - Sunday range
  const mondayStr = mondayDate.toISOString().slice(0, 10);
  const sundayStr = sundayDate.toISOString().slice(0, 10);

  const weekLogbooks = useMemo(() => {
    return logbooks.filter((lb) => lb.activityDate >= mondayStr && lb.activityDate <= sundayStr);
  }, [logbooks, mondayStr, sundayStr]);

  // Group by day 1 (Mon) through day 7 (Sun)
  const daysBreakdown = useMemo(() => {
    return weekDates.map((dateStr, idx) => {
      const dayLogs = weekLogbooks.filter((lb) => lb.activityDate === dateStr);
      let dayTotalMinutes = 0;
      let hasSick = false;
      let hasPermission = false;
      let hasHoliday = false;

      dayLogs.forEach((lb) => {
        if (lb.status === "SICK") hasSick = true;
        if (lb.status === "PERMISSION") hasPermission = true;
        if (lb.status === "HOLIDAY") hasHoliday = true;

        if (lb.startTime && lb.endTime && lb.status !== "SICK" && lb.status !== "PERMISSION" && lb.status !== "HOLIDAY") {
          try {
            const [h1, m1] = lb.startTime.split(":").map(Number);
            const [h2, m2] = lb.endTime.split(":").map(Number);
            const diff = h2 * 60 + m2 - (h1 * 60 + m1);
            if (diff > 0) dayTotalMinutes += diff;
          } catch {
            // ignore
          }
        }
      });

      return {
        dateStr,
        dayIndex: idx,
        label: DAY_LABELS[idx].label,
        shortName: DAY_LABELS[idx].shortName,
        formattedDate: formatDate(dateStr),
        dayLogs,
        totalMinutes: dayTotalMinutes,
        hours: (dayTotalMinutes / 60).toFixed(1),
        hasActivity: dayLogs.length > 0,
        hasSick,
        hasPermission,
        hasHoliday,
      };
    });
  }, [weekDates, weekLogbooks]);

  // Total Hours calculation
  const totalWeeklyMinutes = useMemo(() => {
    return daysBreakdown.reduce((acc, cur) => acc + cur.totalMinutes, 0);
  }, [daysBreakdown]);

  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);
  const dailyTarget = profile?.dailyTargetHours || 8;
  const weeklyTarget = dailyTarget * 5; // 5 workdays (Mon-Fri)
  const weeklyProgressPercent = Math.min(100, Math.round(((totalWeeklyMinutes / 60) / weeklyTarget) * 100)) || 0;

  // Count attendance status breakdown
  const presentDaysCount = daysBreakdown.slice(0, 5).filter((d) => d.totalMinutes > 0).length;
  const sickDaysCount = daysBreakdown.slice(0, 5).filter((d) => d.hasSick).length;
  const permissionDaysCount = daysBreakdown.slice(0, 5).filter((d) => d.hasPermission).length;
  const holidayDaysCount = daysBreakdown.slice(0, 5).filter((d) => d.hasHoliday).length;

  const avgHoursPerActiveDay = presentDaysCount > 0 ? (totalWeeklyMinutes / 60 / presentDaysCount).toFixed(1) : "0.0";

  // Category distribution
  const topCategoryName = useMemo(() => {
    const catMap: Record<string, number> = {};
    weekLogbooks.forEach((lb) => {
      const cat = categories.find((c) => c.id === lb.categoryId)?.name || "Umum";
      if (!catMap[cat]) catMap[cat] = 0;
      if (lb.startTime && lb.endTime) {
        try {
          const [h1, m1] = lb.startTime.split(":").map(Number);
          const [h2, m2] = lb.endTime.split(":").map(Number);
          const diff = h2 * 60 + m2 - (h1 * 60 + m1);
          if (diff > 0) catMap[cat] += diff;
        } catch {
          // ignore
        }
      }
    });

    let maxCat = "-";
    let maxMin = 0;
    Object.entries(catMap).forEach(([k, v]) => {
      if (v > maxMin) {
        maxMin = v;
        maxCat = k;
      }
    });

    return maxCat;
  }, [weekLogbooks, categories]);

  // EXPORT WEEKLY RESUME PDF
  const exportWeeklyPDF = () => {
    if (weekLogbooks.length === 0) {
      toast.error("Belum ada data aktivitas di pekan ini untuk dicetak.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait" });
    const profileName = profile?.name || "Pengguna Log Book";
    const jobTitle = profile?.jobTitle || "Software Developer";

    // Header Banner
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 210, 24, "F");

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("RESUME LAPORAN MINGGUAN (HARI 1 - HARI 5)", 14, 15);

    // Metadata Info
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Nama: ${profileName} (${jobTitle})`, 14, 31);
    doc.text(`Periode Pekan: ${weekLabel}`, 14, 36);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 140, 31);
    doc.text(`Presensi: Hadir ${presentDaysCount}h | Sakit ${sickDaysCount}h | Izin ${permissionDaysCount}h`, 140, 36);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, 196, 40);

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

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 44,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: "bold" },
    });

    doc.save(`Resume_Laporan_Mingguan_${profileName.replace(/\s+/g, "_")}_${mondayStr}_sd_${sundayStr}.pdf`);
    toast.success("Resume Mingguan PDF berhasil diunduh.");
  };

  return (
    <div className="space-y-6">
      {/* Week Selector Bar */}
      <div className="glass-card rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Resume Mingguan: {weekLabel}
                </h3>
                {weeklyProgressPercent >= 100 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <Trophy className="h-3 w-3" /> Target Terpenuhi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Rangkuman alur aktivitas kerja harian terstruktur dari <strong>Hari 1 (Senin)</strong> sampai <strong>Hari 5 (Jumat)</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={currentWeek}
              className="text-xs font-bold rounded-full h-8"
            >
              Pekan Ini
            </Button>

            <div className="flex items-center rounded-full border border-slate-200 dark:border-white/[0.1] overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevWeek}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                title="Pekan Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextWeek}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                title="Pekan Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={exportWeeklyPDF}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-500/25 px-4 cursor-pointer gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Cetak Resume (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* Sintesis Rekapitulasi 5 Hari (Top KPI Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jam Kerja */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Jam Efektif
            </span>
            <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-2.5 text-orange-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalWeeklyHours} <span className="text-xs font-bold text-orange-500">/ {weeklyTarget} Jam</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Rata-rata {avgHoursPerActiveDay} Jam / hari hadir ({weeklyProgressPercent}%)
            </p>
          </div>
        </div>

        {/* Kehadiran & Absensi */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Rekap Presensi
            </span>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {presentDaysCount} <span className="text-xs font-bold text-emerald-500">Hadir</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {sickDaysCount > 0 && <span className="text-rose-500 font-bold">🏥 {sickDaysCount} Sakit</span>}
              {permissionDaysCount > 0 && <span className="text-amber-500 font-bold">📄 {permissionDaysCount} Izin</span>}
              {holidayDaysCount > 0 && <span className="text-purple-500 font-bold">🏖️ {holidayDaysCount} Libur</span>}
              {sickDaysCount === 0 && permissionDaysCount === 0 && holidayDaysCount === 0 && (
                <span>Kehadiran 100% penuh</span>
              )}
            </div>
          </div>
        </div>

        {/* Fokus Bidang Utama */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Fokus Utama Pekan Ini
            </span>
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-2.5 text-purple-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-lg font-black text-slate-900 dark:text-white truncate">
              {topCategoryName}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Alokasi bidang terbanyak
            </p>
          </div>
        </div>

        {/* Aktivitas Tuntas */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Aktivitas Selesai
            </span>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-500">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {weekLogbooks.filter((l) => l.status === "COMPLETED").length} <span className="text-xs font-bold text-slate-400">/ {weekLogbooks.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Pekerjaan berstatus selesai
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: DAY 1 S/D DAY 5 CHRONOLOGICAL TIMELINE RESUME */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            Rangkuman Alur Kerja Harian (Hari 1 s/d Hari 5)
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {presentDaysCount} hari hadir {sickDaysCount > 0 ? `• ${sickDaysCount} hari sakit` : ""} {permissionDaysCount > 0 ? `• ${permissionDaysCount} hari izin` : ""}
          </span>
        </div>

        <div className="space-y-4">
          {daysBreakdown.slice(0, 5).map((day) => {
            const isSickDay = day.hasSick;
            const isPermissionDay = day.hasPermission;
            const isHolidayDay = day.hasHoliday;

            return (
              <div
                key={day.dateStr}
                className={`glass-card rounded-3xl overflow-hidden shadow-lg border transition-all ${
                  isSickDay
                    ? "border-rose-200 dark:border-rose-900/60"
                    : isPermissionDay
                    ? "border-amber-200 dark:border-amber-900/60"
                    : isHolidayDay
                    ? "border-purple-200 dark:border-purple-900/60"
                    : "border-slate-200 dark:border-white/[0.08]"
                }`}
              >
                {/* Day Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/70 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black text-white shadow-xs ${
                      isSickDay
                        ? "bg-rose-600"
                        : isPermissionDay
                        ? "bg-amber-600"
                        : isHolidayDay
                        ? "bg-purple-600"
                        : "bg-gradient-to-r from-orange-500 to-amber-500"
                    }`}>
                      {day.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {day.formattedDate}
                    </span>
                    {isSickDay && <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-full">🏥 Izin Sakit</span>}
                    {isPermissionDay && <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">📄 Izin / Cuti</span>}
                    {isHolidayDay && <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">🏖️ Libur</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Total: {day.hours} Jam
                    </span>
                    <span className="text-xs text-slate-400">
                      ({day.dayLogs.length} catatan)
                    </span>
                  </div>
                </div>

                {/* Day Content */}
                <div className="p-5">
                  {day.dayLogs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                      Tidak ada catatan aktivitas kerja pada hari ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {day.dayLogs.map((log: any) => {
                        const category = categories.find((c) => c.id === log.categoryId);
                        const isSick = log.status === "SICK";
                        const isPerm = log.status === "PERMISSION";
                        const isHoli = log.status === "HOLIDAY";

                        const colorHex = isSick ? "#f43f5e" : isPerm ? "#f59e0b" : isHoli ? "#a855f7" : category?.colorHex || "#f97316";

                        return (
                          <div
                            key={log.id}
                            className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                              isSick
                                ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20"
                                : isPerm
                                ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20"
                                : isHoli
                                ? "border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20"
                                : "border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]"
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
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {log.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pl-4.5 font-mono">
                                  <span>{isSick || isPerm || isHoli ? "Presensi Khusus" : `${formatTime(log.startTime)} - ${formatTime(log.endTime)}`}</span>
                                  <span>&bull;</span>
                                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
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
                              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                                {log.description}
                              </p>
                              {log.outputResult && (
                                <div className="p-2.5 rounded-xl border text-xs bg-slate-100/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200">
                                  <strong>{isSick ? "Keterangan Medis / Surat Dokter:" : isPerm ? "Keterangan Izin:" : "Output / Hasil Capaian:"}</strong> {log.outputResult}
                                </div>
                              )}
                              {log.notes && (
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
                                  <strong>Catatan:</strong> {log.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
