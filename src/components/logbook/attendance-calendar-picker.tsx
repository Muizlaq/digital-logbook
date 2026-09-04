"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Square,
  Triangle,
  X,
  Diamond,
  Calendar as CalendarIcon,
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

export function AttendanceCalendarPicker({
  selectedDate,
  onSelectDate,
  existingLogbooks = [],
}: AttendanceCalendarPickerProps) {
  // Determine current active date state for navigation
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevPeriod = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextPeriod = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Build a fast lookup map for existing attendance
  const attendanceMap = React.useMemo(() => {
    const map = new Map<string, any>();
    existingLogbooks.forEach((item) => {
      if (item.activityDate) {
        map.set(item.activityDate, item);
      }
    });
    return map;
  }, [existingLogbooks]);

  // Calculate 30-day range / monthly calendar dates
  // Calculate first day of the month & last day
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Month formatted title
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(viewDate);
  const fullMonthYear = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  // Calculate period title (e.g. "Periode 1" or "Periode September 2026")
  // Format range: "1 [Bulan] [Tahun] - [Akhir] [Bulan] [Tahun]"
  const periodLabel = `Periode ${month + 1}`;
  const periodDateRange = `1 ${monthName} ${year} - ${lastDayOfMonth.getDate()} ${monthName} ${year}`;

  // Calculate calendar grid cells starting from Monday (Senin)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday -> index 6

  const daysInMonth = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  interface CalendarCell {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isWeekend: boolean;
  }

  const calendarCells: CalendarCell[] = [];

  // Trailing days from prev month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = (dateObj.getDay() + 6) % 7;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isWeekend: dayOfWeek >= 5,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = (dateObj.getDay() + 6) % 7;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isWeekend: dayOfWeek >= 5,
    });
  }

  // Next month leading days to complete grid rows
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = (dateObj.getDay() + 6) % 7;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isWeekend: dayOfWeek >= 5,
    });
  }

  // Function to render status icon for each cell
  const renderCellStatus = (cell: (typeof calendarCells)[0], isSelected: boolean) => {
    const record = attendanceMap.get(cell.dateStr);

    // If there is an existing record
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
        return <span className="text-amber-500 text-[10px] leading-none">▲</span>;
      }
      if (record.status === "HOLIDAY") {
        return <span className="h-2 w-2 bg-slate-800 dark:bg-slate-300 inline-block rounded-[1px]" />;
      }
      if (record.status === "DRAFT") {
        return <span className="text-blue-500 text-[10px] leading-none">◆</span>;
      }
    }

    // Default status if weekend
    if (cell.isWeekend) {
      return <span className="h-2 w-2 bg-slate-800 dark:bg-slate-300 inline-block rounded-[1px]" />;
    }

    // If selected and no record yet
    if (isSelected) {
      return (
        <span className="h-2.5 w-2.5 rounded-full border border-blue-600 dark:border-blue-400 inline-block" />
      );
    }

    // If past or unfilled workday
    return (
      <span className="h-2 w-2 rounded-full border border-slate-400 dark:border-slate-500 inline-block" />
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* 1. Header Navigation Bar (Kemnaker Style) */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <button
          type="button"
          onClick={handlePrevPeriod}
          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          title="Periode Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {periodLabel}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {periodDateRange}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextPeriod}
          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          title="Periode Berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Calendar Grid Table */}
      <div className="p-4 sm:p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center pb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d.key}
              className={d.isWeekend ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300"}
            >
              {d.label}
            </div>
          ))}
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 gap-y-1.5 pt-2">
          {calendarCells.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDate;
            const hasLogbook = attendanceMap.has(cell.dateStr);

            return (
              <button
                type="button"
                key={idx}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
                  cell.isWeekend
                    ? "bg-slate-50/70 dark:bg-slate-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                } ${
                  isSelected
                    ? "border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-xs z-10"
                    : "border border-transparent"
                } ${!cell.isCurrentMonth ? "opacity-35 hover:opacity-80" : ""}`}
              >
                {/* Date Number */}
                <div
                  className={`text-xs font-semibold mb-1.5 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold h-6 px-2 rounded-md shadow-xs"
                      : cell.isCurrentMonth
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {cell.dayNumber}
                </div>

                {/* Status Indicator Icon */}
                <div className="h-4 flex items-center justify-center">
                  {renderCellStatus(cell, isSelected)}
                </div>

                {/* Small indicator if logbook has attachments or notes */}
                {hasLogbook && !isSelected && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Legend / Keterangan Status Presensi (Kemnaker Standard) */}
      <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
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
          <span className="text-blue-500 text-[10px]">◆</span>
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
