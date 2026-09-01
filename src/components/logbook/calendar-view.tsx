"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  PlusCircle,
  Eye,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate, formatTime } from "@/lib/utils";

interface CalendarViewProps {
  logbooks: any[];
  categories: any[];
}

const DAYS_OF_WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function CalendarView({ logbooks = [], categories = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<{
    dateStr: string;
    events: any[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Month Title format in Indonesian
  const monthTitle = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  // Calculate calendar grid dates
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for 1st day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday becomes index 6

  const daysInMonth = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build cells array
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    const dateStr = dateObj.toISOString().slice(0, 10);
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().slice(0, 10);
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = dateObj.toISOString().slice(0, 10);
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  // Helper to get activities on date
  const getActivitiesForDate = (dateStr: string) => {
    return logbooks.filter((lb) => lb.activityDate === dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Navigation Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                {monthTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik tanggal untuk melihat rincian aktivitas atau mencatat log book baru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="text-xs font-semibold dark:border-slate-800"
            >
              Hari Ini
            </Button>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-center py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div key={day} className={idx >= 5 ? "text-rose-500 dark:text-rose-400" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarCells.map((cell, idx) => {
            const activities = getActivitiesForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;

            // Calculate total hours on this day
            let dayMinutes = 0;
            activities.forEach((a) => {
              try {
                const [h1, m1] = a.startTime.split(":").map(Number);
                const [h2, m2] = a.endTime.split(":").map(Number);
                const diff = h2 * 60 + m2 - (h1 * 60 + m1);
                if (diff > 0) dayMinutes += diff;
              } catch {
                // ignore
              }
            });
            const dayHours = (dayMinutes / 60).toFixed(1);

            return (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDateEvents({
                    dateStr: cell.dateStr,
                    events: activities,
                  })
                }
                className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                  cell.isCurrentMonth
                    ? "bg-white dark:bg-slate-900 hover:bg-blue-50/40 dark:hover:bg-slate-800/50"
                    : "bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Cell Header: Day Number & Day Hours Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-blue-600 text-white shadow-xs"
                        : cell.isCurrentMonth
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {activities.length > 0 && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      {dayHours}j
                    </span>
                  )}
                </div>

                {/* Activities Pills */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {activities.slice(0, 2).map((act) => {
                    const category = categories.find((c) => c.id === act.categoryId);
                    const color = category?.colorHex || "#3b82f6";

                    return (
                      <div
                        key={act.id}
                        className="truncate rounded px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-l-2"
                        style={{ borderLeftColor: color }}
                        title={`${act.title} (${act.startTime} - ${act.endTime})`}
                      >
                        <span className="truncate">{act.title}</span>
                      </div>
                    );
                  })}

                  {activities.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-1">
                      +{activities.length - 2} aktivitas lagi
                    </div>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                    Lihat &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Modal Dialog */}
      <Dialog
        open={!!selectedDateEvents}
        onOpenChange={(open) => !open && setSelectedDateEvents(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Aktivitas: {selectedDateEvents ? formatDate(selectedDateEvents.dateStr) : ""}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Rincian seluruh catatan aktivitas pekerjaan yang Anda lakukan pada tanggal ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {!selectedDateEvents || selectedDateEvents.events.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum ada aktivitas yang dicatat pada tanggal ini.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  <Link href={`/logbook/new`}>
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Catat Aktivitas Sekarang
                  </Link>
                </Button>
              </div>
            ) : (
              selectedDateEvents.events.map((item: any) => {
                const category = categories.find((c) => c.id === item.categoryId);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category?.colorHex || "#3b82f6" }}
                            />
                            {category?.name || "Umum"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location || "-"}
                      </span>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-lg dark:border-slate-800"
                      >
                        <Link href={`/logbook/${item.id}`}>
                          <Eye className="h-3 w-3 mr-1" /> Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedDateEvents && selectedDateEvents.events.length > 0 && (
            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total {selectedDateEvents.events.length} aktivitas
              </span>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                <Link href={`/logbook/new`}>
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> Tambah Lagi
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
