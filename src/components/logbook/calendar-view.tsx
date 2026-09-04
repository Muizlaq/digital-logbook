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
      <Card className="border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {monthTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Klik tanggal untuk melihat rincian aktivitas atau mencatat log book baru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="text-xs font-semibold dark:border-white/10"
            >
              Hari Ini
            </Button>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 rounded-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 text-center py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div key={day} className={idx >= 5 ? "text-rose-500 dark:text-rose-400" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-white/10">
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
                    ? "bg-white/50 dark:bg-transparent hover:bg-orange-500/5 dark:hover:bg-white/5"
                    : "bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 dark:text-zinc-600 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Cell Header: Day Number & Day Hours Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/30 font-extrabold"
                        : cell.isCurrentMonth
                        ? "text-slate-800 dark:text-zinc-200 font-bold"
                        : "text-slate-400 dark:text-zinc-600"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {activities.length > 0 && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      {dayHours}j
                    </span>
                  )}
                </div>

                {/* Activities Pills */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {activities.slice(0, 2).map((act) => {
                    const category = categories.find((c) => c.id === act.categoryId);
                    const color =
                      act.status === "SICK"
                        ? "#f43f5e"
                        : act.status === "PERMISSION"
                        ? "#f59e0b"
                        : act.status === "HOLIDAY"
                        ? "#a855f7"
                        : category?.colorHex || "#f97316";

                    const badgePrefix =
                      act.status === "SICK"
                        ? "🏥 "
                        : act.status === "PERMISSION"
                        ? "📄 "
                        : act.status === "HOLIDAY"
                        ? "🏖️ "
                        : "";

                    return (
                      <div
                        key={act.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 border-l-2 ${
                          act.status === "SICK"
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-500"
                            : act.status === "PERMISSION"
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-500"
                            : act.status === "HOLIDAY"
                            ? "bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border-purple-500"
                            : "bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200"
                        }`}
                        style={act.status === "COMPLETED" || act.status === "IN_PROGRESS" || act.status === "DRAFT" ? { borderLeftColor: color } : {}}
                        title={`${act.title} (${act.startTime} - ${act.endTime})`}
                      >
                        <span className="truncate">{badgePrefix}{act.title}</span>
                      </div>
                    );
                  })}

                  {activities.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 pl-1">
                      +{activities.length - 2} aktivitas lagi
                    </div>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-semibold text-orange-600 dark:text-orange-400">
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
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-orange-500" />
              Aktivitas: {selectedDateEvents ? formatDate(selectedDateEvents.dateStr) : ""}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
              Rincian seluruh catatan aktivitas pekerjaan yang Anda lakukan pada tanggal ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {!selectedDateEvents || selectedDateEvents.events.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Belum ada aktivitas yang dicatat pada tanggal ini.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25"
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
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                          <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
                            <Clock className="h-3 w-3 text-orange-500" />
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category?.colorHex || "#f97316" }}
                            />
                            {category?.name || "Umum"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/10">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location || "-"}
                      </span>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-lg dark:border-white/10 font-medium"
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
            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
              <span className="text-xs text-slate-600 dark:text-zinc-400">
                Total {selectedDateEvents.events.length} aktivitas
              </span>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25"
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
