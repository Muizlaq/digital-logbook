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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    });

    doc.save(`LogBook_${(profile.name || "User").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Laporan PDF berhasil digenerate dan diunduh.");
  };

  return (
    <div className="space-y-6">
      {/* Header & Tab Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Laporan & Analitik Log Book
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resume performa mingguan, visual diagram jam kerja, dan ekspor laporan berkala.
          </p>
        </div>

        {/* Tab Switcher: Resume Mingguan vs Rekapitulasi Lengkap */}
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setReportTab("weekly")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              reportTab === "weekly"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Resume Mingguan
          </button>
          <button
            onClick={() => setReportTab("full")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              reportTab === "full"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-800 rounded-xl"
            >
              <FileText className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" /> CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportExcel}
              className="text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl font-semibold"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Export Excel
            </Button>

            <Button
              size="sm"
              onClick={exportPDF}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5" /> Export PDF
            </Button>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Total Aktivitas</p>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{summary.total}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Layers className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400">Total Waktu</p>
                  <div className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-0.5">{summary.totalHours} Jam</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  <Timer className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Selesai</p>
                  <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">{summary.completed}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/30 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400">In Progress / Draf</p>
                  <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                    {(summary.inProgress || 0) + (summary.draft || 0)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Filter Parameter Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Periode Cepat:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("today")}
                  className="h-7 text-xs rounded-lg dark:border-slate-800"
                >
                  Hari Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("thisWeek")}
                  className="h-7 text-xs rounded-lg dark:border-slate-800"
                >
                  Minggu Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset("thisMonth")}
                  className="h-7 text-xs rounded-lg dark:border-slate-800"
                >
                  Bulan Ini
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs text-rose-600 hover:text-rose-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Dari Tanggal</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Kategori</label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-9 text-xs dark:bg-slate-950 dark:border-slate-800"
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
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Status Aktivitas</label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 text-xs dark:bg-slate-950 dark:border-slate-800"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="COMPLETED">✅ Selesai</option>
                    <option value="IN_PROGRESS">⚡ Sedang Dikerjakan</option>
                    <option value="DRAFT">📝 Rencana / Draf</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dataset Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="Tidak Ada Data Aktivitas"
              description="Sesuaikan filter rentang tanggal untuk melihat rekapitulasi kerja Anda."
            />
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan {rows.length} entri aktivitas:
              </div>
              <Table className="dark:border-slate-800">
                <TableHeader className="dark:bg-slate-950/80">
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Tanggal & Jam</TableHead>
                    <TableHead>Kategori & Lokasi</TableHead>
                    <TableHead>Judul Aktivitas & Output</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: any) => (
                    <TableRow key={row.id} className="dark:border-slate-800/80 hover:dark:bg-slate-800/40">
                      <TableCell className="font-medium text-xs text-slate-500 dark:text-slate-400">
                        {row.no}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{formatDate(row.activityDate)}</div>
                          <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            {row.startTime} - {row.endTime} ({row.duration})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{row.category}</div>
                          <div className="text-slate-400 text-[11px]">{row.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-md">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs line-clamp-1">{row.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">Output: {row.outputResult}</div>
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
