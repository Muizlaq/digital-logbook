"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface AttendanceRecord {
  dateStr: string; // YYYY-MM-DD
  status: "COMPLETED" | "IN_PROGRESS" | "DRAFT" | "SICK" | "PERMISSION" | "HOLIDAY" | "REJECTED" | "PENDING";
  title?: string;
  id?: string;
}

interface AttendanceCalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  existingLogbooks?: any[];
}

const DAYS_OF_WEEK = [
  { key: "mon", label: "Sen", isWeekend: false },
  { key: "tue", label: "Sel", isWeekend: false },
  { key: "wed", label: "Rab", isWeekend: false },
  { key: "thu", label: "Kam", isWeekend: false },
  { key: "fri", label: "Jum", isWeekend: false },
  { key: "sat", label: "Sab", isWeekend: true },
  { key: "sun", label: "Min", isWeekend: true },
];

// Official Indonesian National Holidays (10 Aug 2026 - 9 Feb 2027)
export const NATIONAL_HOLIDAYS: Record<string, string> = {
  "2026-08-17": "Hari Kemerdekaan RI (HUT RI ke-81)",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",
  "2026-12-26": "Cuti Bersama Hari Raya Natal",
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-02-05": "Isra Mi'raj Nabi Muhammad SAW",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
};

// Definition of the 6 Internship Periods: 10 Agustus 2026 - 9 Februari 2027
export const INTERNSHIP_PERIODS = [
  {
    periodNumber: 1,
    title: "Periode 1",
    label: "10 Agu 2026 - 9 Sep 2026",
    startDate: "2026-08-10",
    endDate: "2026-09-09",
  },
  {
    periodNumber: 2,
    title: "Periode 2",
    label: "10 Sep 2026 - 9 Okt 2026",
    startDate: "2026-09-10",
    endDate: "2026-10-09",
  },
  {
    periodNumber: 3,
    title: "Periode 3",
    label: "10 Okt 2026 - 9 Nov 2026",
    startDate: "2026-10-10",
    endDate: "2026-11-09",
  },
  {
    periodNumber: 4,
    title: "Periode 4",
    label: "10 Nov 2026 - 9 Des 2026",
    startDate: "2026-11-10",
    endDate: "2026-12-09",
  },
  {
    periodNumber: 5,
    title: "Periode 5",
    label: "10 Des 2026 - 9 Jan 2027",
    startDate: "2026-12-10",
    endDate: "2027-01-09",
  },
  {
    periodNumber: 6,
    title: "Periode 6",
    label: "10 Jan 2027 - 9 Feb 2027",
    startDate: "2027-01-10",
    endDate: "2027-02-09",
  },
];

export function AttendanceCalendarPicker({
  selectedDate,
  onSelectDate,
  existingLogbooks = [],
}: AttendanceCalendarPickerProps) {
  // Find which period matches the current selectedDate
  const initialPeriodIndex = useMemo(() => {
    if (!selectedDate) return 0;
    const foundIdx = INTERNSHIP_PERIODS.findIndex(
      (p) => selectedDate >= p.startDate && selectedDate <= p.endDate
    );
    return foundIdx !== -1 ? foundIdx : 0;
  }, [selectedDate]);

  const [currentPeriodIdx, setCurrentPeriodIdx] = useState<number>(initialPeriodIndex);

  // Sync current period if selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const idx = INTERNSHIP_PERIODS.findIndex(
        (p) => selectedDate >= p.startDate && selectedDate <= p.endDate
      );
      if (idx !== -1) {
        setCurrentPeriodIdx(idx);
      }
    }
  }, [selectedDate]);

  const currentPeriod = INTERNSHIP_PERIODS[currentPeriodIdx];

  const handlePrevPeriod = () => {
    if (currentPeriodIdx > 0) {
      setCurrentPeriodIdx((prev) => prev - 1);
    }
  };

  const handleNextPeriod = () => {
    if (currentPeriodIdx < INTERNSHIP_PERIODS.length - 1) {
      setCurrentPeriodIdx((prev) => prev + 1);
    }
  };

  // Fast map lookup for existing attendance
  const attendanceMap = useMemo(() => {
    const map = new Map<string, any>();
    existingLogbooks.forEach((item) => {
      if (item.activityDate) {
        map.set(item.activityDate, item);
      }
    });
    return map;
  }, [existingLogbooks]);

  // Build calendar matrix strictly for the current period (from startDate to endDate)
  const calendarCells = useMemo(() => {
    interface CalendarCell {
      dayNumber: number;
      dateStr: string;
      isCurrentPeriod: boolean;
      isWeekend: boolean;
      isNationalHoliday: boolean;
      holidayName?: string;
      isBlank?: boolean;
    }

    const cells: CalendarCell[] = [];
    const [startYear, startMonth, startDay] = currentPeriod.startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = currentPeriod.endDate.split("-").map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    // Day of week for start (0=Sun, 1=Mon, ..., 6=Sat) -> transform so Mon=0, Sun=6
    let leadingBlankCount = (start.getDay() + 6) % 7;

    // Add blank leading cells if period does not start on Monday
    for (let i = 0; i < leadingBlankCount; i++) {
      cells.push({
        dayNumber: 0,
        dateStr: `blank-start-${i}`,
        isCurrentPeriod: false,
        isWeekend: i >= 5,
        isNationalHoliday: false,
        isBlank: true,
      });
    }

    // Loop through all days in this period
    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const dayOfWeek = (cur.getDay() + 6) % 7;
      const isHoliday = Boolean(NATIONAL_HOLIDAYS[dateStr]);

      cells.push({
        dayNumber: cur.getDate(),
        dateStr,
        isCurrentPeriod: true,
        isWeekend: dayOfWeek >= 5,
        isNationalHoliday: isHoliday,
        holidayName: NATIONAL_HOLIDAYS[dateStr],
        isBlank: false,
      });

      cur.setDate(cur.getDate() + 1);
    }

    // Trailing blank cells to complete the 7-column row
    const trailingBlankCount = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailingBlankCount; i++) {
      const colIdx = (leadingBlankCount + cells.length) % 7;
      cells.push({
        dayNumber: 0,
        dateStr: `blank-end-${i}`,
        isCurrentPeriod: false,
        isWeekend: colIdx >= 5,
        isNationalHoliday: false,
        isBlank: true,
      });
    }

    return cells;
  }, [currentPeriod]);

  // List of national holidays within this active period
  const holidaysInPeriod = useMemo(() => {
    return calendarCells.filter((c) => !c.isBlank && c.isNationalHoliday);
  }, [calendarCells]);

  // Status icon renderer
  const renderCellStatus = (cell: (typeof calendarCells)[0], isSelected: boolean) => {
    if (cell.isBlank) return null;

    const record = attendanceMap.get(cell.dateStr);

    // If there is an existing recorded logbook
    if (record) {
      if (record.status === "COMPLETED" || record.status === "IN_PROGRESS") {
        return (
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm leading-none flex items-center justify-center">
            ✓
          </span>
        );
      }
      if (record.status === "SICK") {
        return <span className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-500 inline-block" />;
      }
      if (record.status === "PERMISSION") {
        return <span className="text-amber-500 text-[10px] leading-none font-bold">▲</span>;
      }
      if (record.status === "HOLIDAY") {
        return <span className="h-2 w-2 bg-slate-800 dark:bg-slate-300 inline-block rounded-[1px]" />;
      }
      if (record.status === "DRAFT") {
        return <span className="text-orange-500 text-[10px] leading-none">◆</span>;
      }
    }

    // National Holiday or Weekend default mark
    if (cell.isNationalHoliday || cell.isWeekend) {
      return <span className="h-2 w-2 bg-slate-800 dark:bg-slate-300 inline-block rounded-[1px]" />;
    }

    // If selected and no record
    if (isSelected) {
      return (
        <span className="h-2.5 w-2.5 rounded-full border border-orange-500 dark:border-orange-400 inline-block" />
      );
    }

    // Workday with no logbook yet
    return (
      <span className="h-2 w-2 rounded-full border border-slate-400 dark:border-slate-500 inline-block" />
    );
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-xl transition-all">
      {/* 1. Header Navigation Bar (Kemnaker Period Header) */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={handlePrevPeriod}
          disabled={currentPeriodIdx === 0}
          className={`h-8 w-8 rounded-full border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-300 transition-colors shadow-2xs ${
            currentPeriodIdx === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-slate-100 dark:hover:bg-white/[0.08] cursor-pointer"
          }`}
          title="Periode Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="text-sm font-black text-slate-900 dark:text-white">
            {currentPeriod.title}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {currentPeriod.label}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextPeriod}
          disabled={currentPeriodIdx === INTERNSHIP_PERIODS.length - 1}
          className={`h-8 w-8 rounded-full border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-300 transition-colors shadow-2xs ${
            currentPeriodIdx === INTERNSHIP_PERIODS.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-slate-100 dark:hover:bg-white/[0.08] cursor-pointer"
          }`}
          title="Periode Berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Calendar Grid Table */}
      <div className="p-4 sm:p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center pb-3 text-xs font-bold text-slate-600 dark:text-zinc-400 border-b border-slate-100 dark:border-white/[0.08]">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d.key}
              className={d.isWeekend ? "text-rose-500 dark:text-rose-400" : "text-slate-700 dark:text-zinc-300"}
            >
              {d.label}
            </div>
          ))}
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 gap-y-1.5 pt-2">
          {calendarCells.map((cell, idx) => {
            if (cell.isBlank) {
              return (
                <div
                  key={idx}
                  className={`h-14 rounded-2xl flex items-center justify-center ${
                    cell.isWeekend ? "bg-slate-50/40 dark:bg-white/[0.01]" : ""
                  }`}
                />
              );
            }

            const isSelected = cell.dateStr === selectedDate;
            const hasLogbook = attendanceMap.has(cell.dateStr);

            return (
              <button
                type="button"
                key={idx}
                onClick={() => onSelectDate(cell.dateStr)}
                title={cell.isNationalHoliday ? `${cell.holidayName} (Libur Nasional)` : undefined}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer relative group h-14 ${
                  cell.isNationalHoliday
                    ? "bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40"
                    : cell.isWeekend
                    ? "bg-slate-50/80 dark:bg-white/[0.02] border border-transparent"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-transparent"
                } ${
                  isSelected
                    ? "border-2 border-orange-500 bg-orange-50/90 dark:bg-orange-950/60 shadow-md shadow-orange-500/10 z-10"
                    : ""
                }`}
              >
                {/* Date Number */}
                <div
                  className={`text-xs font-bold mb-1 flex items-center justify-center ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white h-6 px-2 rounded-lg shadow-sm"
                      : cell.isNationalHoliday || cell.isWeekend
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : "text-slate-800 dark:text-zinc-200"
                  }`}
                >
                  {cell.dayNumber}
                </div>

                {/* Status Indicator Icon */}
                <div className="h-4 flex items-center justify-center">
                  {renderCellStatus(cell, isSelected)}
                </div>

                {/* Small indicator if logbook exists */}
                {hasLogbook && !isSelected && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}

                {/* Small red dot for national holiday */}
                {cell.isNationalHoliday && !isSelected && (
                  <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-rose-500" title={cell.holidayName} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. National Holidays in this Period (Info Bar) */}
      {holidaysInPeriod.length > 0 && (
        <div className="px-4 py-2.5 bg-rose-50/60 dark:bg-rose-950/30 border-t border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" /> Libur Nasional Periode Ini:
          </span>
          {holidaysInPeriod.map((h) => (
            <span key={h.dateStr} className="text-[11px] bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50 font-medium">
              <strong>{h.dayNumber} {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(h.dateStr))}</strong>: {h.holidayName}
            </span>
          ))}
        </div>
      )}

      {/* 4. Legend / Keterangan Status Presensi */}
      <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.08] flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">✓</span>
          <span>Disetujui</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-500 inline-block" />
          <span>Tidak Hadir</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">✖</span>
          <span>Kehadiran Ditolak</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 text-[10px]">▲</span>
          <span>Perlu Tindakan Anda</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-orange-500 text-[10px]">◆</span>
          <span>Menunggu Tindakan Mentor</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-slate-400 dark:border-slate-500 inline-block" />
          <span>Belum Diisi</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-slate-800 dark:bg-slate-300 inline-block rounded-[1px]" />
          <span>Hari Libur</span>
        </div>
      </div>
    </div>
  );
}
