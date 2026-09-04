"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  RotateCcw,
  Timer,
  Sparkles,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportCharts } from "@/components/reports/report-charts";
import { WeeklyResume } from "@/components/reports/weekly-resume";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PersonalReportsPage() {
  const [reportTab, setReportTab] = useState<"weekly" | "full">("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  // Master Data
  const { data: masterData } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  // Report Data
  const { data, isLoading } = useQuery({
    queryKey: ["reports", startDate, endDate, categoryId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (categoryId !== "ALL") params.set("categoryId", categoryId);
      if (status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil laporan");
      const json = await res.json();
      return json.data;
    },
  });

  // All Logbooks for Weekly calculations
  const { data: allLogbooksData } = useQuery({
    queryKey: ["all-logbooks-weekly"],
    queryFn: async () => {
      const res = await fetch(`/api/logbooks?limit=1000`);
      const json = await res.json();
      return json.data?.items || [];
    },
  });

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryId("ALL");
    setStatus("ALL");
  };

  const setPreset = (type: "today" | "thisWeek" | "thisMonth") => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    if (type === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (type === "thisWeek") {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(new Date().toISOString().slice(0, 10));
    } else if (type === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(new Date().toISOString().slice(0, 10));
    }
  };

  const rows = data?.rows || [];
  const summary = data?.summary || { total: 0, totalHours: "0", completed: 0, inProgress: 0, draft: 0 };
  const profile = masterData?.profile || { name: "Pengguna", dailyTargetHours: 8 };
  const categories = masterData?.categories || [];

  // EXPORT EXCEL
  const exportExcel = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const exportData = rows.map((r: any) => ({
      "No": r.no,
      "Tanggal": r.activityDate,
      "Mulai": r.startTime,
      "Selesai": r.endTime,
      "Durasi": r.duration,
      "Kategori": r.category,
      "Lokasi": r.location,
      "Judul Aktivitas": r.title,
      "Deskripsi": r.description,
      "Hasil / Output": r.outputResult,
      "Catatan": r.notes,
      "Status": r.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Aktivitas");
    XLSX.writeFile(workbook, `LogBook_${(profile.name || "User").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Laporan Excel (.xlsx) berhasil diunduh.");
  };

  // EXPORT CSV
  const exportCSV = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const exportData = rows.map((r: any) => ({
      "No": r.no,
      "Tanggal": r.activityDate,
      "Waktu": `${r.startTime} - ${r.endTime}`,
      "Durasi": r.duration,
      "Kategori": r.category,
      "Lokasi": r.location,
      "Judul": r.title,
      "Output": r.outputResult,
      "Status": r.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `LogBook_${(profile.name || "User").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Laporan CSV berhasil diunduh.");
  };

  // EXPORT PDF
  const exportPDF = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Header
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`LAPORAN LOG BOOK AKTIVITAS KERJA - ${(profile.name || "User").toUpperCase()}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")} | Total: ${rows.length} Aktivitas (${summary.totalHours} Jam Kerja)`,
      14,
      25
    );

    const tableColumn = [
      "No",
      "Tanggal",
      "Waktu",
      "Durasi",
      "Kategori",
      "Judul Aktivitas",
      "Output Capaian",
      "Status",
    ];

    const tableRows = rows.map((r: any) => [
      r.no,
      r.activityDate,
      `${r.startTime} - ${r.endTime}`,
      r.duration,
      r.category,
      r.title,
      r.outputResult,
      r.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: "bold" },
    });

    doc.save(`LogBook_${(profile.name || "User").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Laporan PDF berhasil digenerate dan diunduh.");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Tab Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" /> Laporan & Analitik Log Book
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Resume performa mingguan, visual diagram jam kerja, dan ekspor laporan berkala.
          </p>
        </div>

        {/* Tab Switcher: Resume Mingguan vs Rekapitulasi Lengkap */}
        <div className="inline-flex rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0d14]/90 p-1 shadow-sm backdrop-blur-md self-start sm:self-auto">
          <button
            onClick={() => setReportTab("weekly")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              reportTab === "weekly"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Resume Mingguan
          </button>
          <button
            onClick={() => setReportTab("full")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              reportTab === "full"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" /> Rekapitulasi & Ekspor
          </button>
        </div>
      </div>

      {/* TAB 1: RESUME MINGGUAN */}
      {reportTab === "weekly" ? (
        <WeeklyResume
          logbooks={allLogbooksData || rows}
          categories={categories}
          profile={profile}
        />
      ) : (
        /* TAB 2: REKAPITULASI LENGKAP DENGAN FILTER & GRAFIK */
        <div className="space-y-6">
          {/* Action Export Toolbar */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="text-xs rounded-full"
            >
              <FileText className="h-4 w-4 mr-1.5 text-orange-500" /> CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportExcel}
              className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full font-bold"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-500" /> Export Excel
            </Button>

            <Button
              size="sm"
              onClick={exportPDF}
              className="text-xs bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white rounded-full font-bold shadow-md shadow-orange-500/25 px-4 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5" /> Export PDF
            </Button>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Aktivitas</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</div>
              </div>
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Waktu</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalHours} <span className="text-xs text-orange-500 font-bold">Jam</span></div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Timer className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Selesai</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.completed}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">In Progress / Draf</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {(summary.inProgress || 0) + (summary.draft || 0)}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Visual Charts */}
          {!isLoading && (
            <ReportCharts
              rows={rows}
              summary={summary}
              categories={categories}
            />
          )}

          {/* Filter Parameters */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/[0.08] pb-3 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-orange-500" /> Filter Parameter Laporan
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Periode Cepat:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("today")}
                  className="h-7 text-xs rounded-full"
                >
                  Hari Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("thisWeek")}
                  className="h-7 text-xs rounded-full"
                >
                  Minggu Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("thisMonth")}
                  className="h-7 text-xs rounded-full"
                >
                  Bulan Ini
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600 rounded-full"
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">Dari Tanggal</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">Sampai Tanggal</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">Kategori</label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">Status Aktivitas</label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="COMPLETED">✅ Selesai</option>
                    <option value="IN_PROGRESS">⚡ Sedang Dikerjakan</option>
                    <option value="DRAFT">📝 Rencana / Draf</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="Tidak Ada Data Aktivitas"
              description="Sesuaikan filter rentang tanggal untuk melihat rekapitulasi kerja Anda."
            />
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden shadow-xl space-y-0">
              <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-zinc-300">
                Menampilkan {rows.length} entri aktivitas:
              </div>
              <Table>
                <TableHeader className="bg-slate-100/80 dark:bg-[#11131c]">
                  <TableRow className="border-b border-slate-200/80 dark:border-white/[0.08]">
                    <TableHead className="w-12 text-slate-700 dark:text-zinc-400 font-bold">No</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Tanggal & Jam</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Kategori & Lokasi</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Judul Aktivitas & Output</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: any) => (
                    <TableRow key={row.id} className="border-b border-slate-100 dark:border-white/[0.05] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                      <TableCell className="font-semibold text-xs text-slate-500 dark:text-zinc-400">
                        {row.no}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">{formatDate(row.activityDate)}</div>
                          <div className="font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                            {row.startTime} - {row.endTime} ({row.duration})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{row.category}</div>
                          <div className="text-slate-500 dark:text-zinc-400 text-[11px]">{row.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-md">
                          <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{row.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">Output: {row.outputResult}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
