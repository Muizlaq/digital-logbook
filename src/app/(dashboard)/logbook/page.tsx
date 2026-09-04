"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  RotateCcw,
  BookOpen,
  MapPin,
  CalendarDays,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarView } from "@/components/logbook/calendar-view";
import { useFilterStore } from "@/stores/useFilterStore";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PersonalLogbookListPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const {
    searchQuery,
    selectedStatus,
    selectedCategory,
    startDate,
    endDate,
    setSearchQuery,
    setSelectedStatus,
    setSelectedCategory,
    setDateRange,
    resetFilters,
  } = useFilterStore();

  const [page, setPage] = useState(1);

  // Fetch Categories
  const { data: masterData } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch Logbooks
  const { data, isLoading } = useQuery({
    queryKey: ["logbooks", searchQuery, selectedStatus, selectedCategory, startDate, endDate, page, viewMode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedCategory !== "ALL") params.set("categoryId", selectedCategory);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", viewMode === "calendar" ? "1" : page.toString());
      params.set("limit", viewMode === "calendar" ? "500" : "10");

      const res = await fetch(`/api/logbooks?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data log book");
      const json = await res.json();
      return json.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Apakah Anda yakin ingin menghapus catatan log book ini?")) return;
      const res = await fetch(`/api/logbooks/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus");
      return json;
    },
    onSuccess: (res) => {
      if (!res) return;
      toast.success("Catatan aktivitas berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus catatan");
    },
  });

  const items = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };
  const categories = masterData?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header with View Switcher & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" /> Log Book Saya
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Daftar seluruh catatan aktivitas, hasil capaian kerja, dan berkas lampiran Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle: List vs Calendar */}
          <div className="inline-flex rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0d14]/90 p-1 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" /> Tabel
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Kalender
            </button>
          </div>

          <Button asChild className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full text-xs shadow-lg shadow-orange-500/25 px-5 cursor-pointer">
            <Link href="/logbook/new">
              <PlusCircle className="h-4 w-4 mr-1.5" /> Catat Aktivitas
            </Link>
          </Button>
        </div>
      </div>

      {/* RENDER CALENDAR VIEW */}
      {viewMode === "calendar" ? (
        isLoading ? (
          <Skeleton className="h-96 w-full rounded-3xl" />
        ) : (
          <CalendarView logbooks={items} categories={categories} />
        )
      ) : (
        /* RENDER LIST TABLE VIEW */
        <div className="space-y-6">
          {/* Filter Toolbar (Obsidian Glass) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <Input
                  placeholder="Cari judul, deskripsi, lokasi, atau output..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>

              {/* Status Filter */}
              <div>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="COMPLETED">✅ Selesai</option>
                  <option value="IN_PROGRESS">⚡ Sedang Dikerjakan</option>
                  <option value="DRAFT">📝 Rencana / Draf</option>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Reset Button */}
              <div>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full text-xs rounded-xl border-slate-200 dark:border-white/[0.08] hover:text-orange-500 gap-1.5 h-10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
                </Button>
              </div>
            </div>

            {/* Date range filter */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
              <span className="font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-orange-500" /> Rentang Tanggal:
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setDateRange(e.target.value, endDate)}
                  className="h-8 text-xs w-36 rounded-lg bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                />
                <span className="text-slate-400 dark:text-zinc-600">s/d</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setDateRange(startDate, e.target.value)}
                  className="h-8 text-xs w-36 rounded-lg bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Log Book Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Belum Ada Catatan Log Book"
              description="Tambahkan catatan aktivitas pekerjaan atau milestone pertama Anda sekarang."
              action={
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                  <Link href="/logbook/new">Catat Aktivitas Baru</Link>
                </Button>
              }
            />
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-slate-100/80 dark:bg-[#11131c]">
                  <TableRow className="border-b border-slate-200/80 dark:border-white/[0.08]">
                    <TableHead className="w-12 text-slate-700 dark:text-zinc-400 font-bold">No</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Aktivitas & Tanggal</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Kategori & Lokasi</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Hasil / Capaian Output</TableHead>
                    <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Status</TableHead>
                    <TableHead className="text-right text-slate-700 dark:text-zinc-400 font-bold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any, idx: number) => (
                    <TableRow key={item.id} className="border-b border-slate-100 dark:border-white/[0.05] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                      <TableCell className="font-semibold text-xs text-slate-500 dark:text-zinc-400">
                        {(page - 1) * 10 + idx + 1}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/logbook/${item.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 text-sm line-clamp-1 transition-colors"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
                              <Calendar className="h-3 w-3 text-orange-500" />
                              {formatDate(item.activityDate)}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: item.category?.colorHex || "#f97316" }}
                            />
                            {item.category?.name || "Umum"}
                          </div>
                          <div className="text-slate-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                            <MapPin className="h-3 w-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.location || "-"}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium line-clamp-2 max-w-sm">
                          {item.outputResult}
                        </p>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 dark:text-zinc-400 hover:text-orange-500 rounded-lg"
                            title="Lihat Rincian"
                          >
                            <Link href={`/logbook/${item.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 dark:text-zinc-400 hover:text-amber-500 rounded-lg"
                            title="Edit Aktivitas"
                          >
                            <Link href={`/logbook/${item.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-500 rounded-lg"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Toolbar */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-zinc-400">
                <div>
                  Menampilkan {items.length} dari {pagination.total} catatan aktivitas
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg h-8 text-xs font-bold border-slate-200 dark:border-white/[0.1]"
                  >
                    Sebelumnya
                  </Button>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 px-2">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg h-8 text-xs font-bold border-slate-200 dark:border-white/[0.1]"
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
