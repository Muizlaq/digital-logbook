"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Paperclip,
  Edit,
  Trash2,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PersonalLogBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["logbook-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/logbooks/${id}`);
      if (!res.ok) throw new Error("Log book tidak ditemukan");
      const json = await res.json();
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm("Apakah Anda yakin ingin menghapus catatan log book ini?")) return;
      const res = await fetch(`/api/logbooks/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: (res) => {
      if (!res) return;
      toast.success("Catatan aktivitas berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      router.push("/logbook");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Catatan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Entri data log book yang Anda cari mungkin telah dihapus.
        </p>
        <Button asChild>
          <Link href="/logbook">Kembali ke Log Book Saya</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl dark:border-slate-800">
            <Link href="/logbook">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mt-1">
              {data.title}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold dark:border-slate-800">
            <Link href={`/logbook/${data.id}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" /> Edit Aktivitas
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            className="rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hapus
          </Button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Deskripsi Aktivitas */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Deskripsi Pekerjaan / Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {data.description}
            </CardContent>
          </Card>

          {/* Output & Hasil */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Output / Hasil Capaian
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {data.outputResult}
            </CardContent>
          </Card>

          {/* Catatan Tambahan */}
          {data.notes && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Catatan Tambahan & Kendala
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {data.notes}
              </CardContent>
            </Card>
          )}

          {/* Lampiran Bukti File */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Berkas Lampiran Bukti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {!data.attachments || data.attachments.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">
                  Tidak ada berkas lampiran yang diunggah.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.attachments.map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {att.fileName}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {(att.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <a
                        href={att.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                        title="Buka Berkas"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Informasi Pelaksanaan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Tanggal Aktivitas</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {formatDate(data.activityDate)}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Waktu Pengerjaan</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {formatTime(data.startTime)} - {formatTime(data.endTime)}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Kategori Aktivitas</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: data.category?.colorHex || "#3b82f6" }}
                  />
                  {data.category?.name || "Umum"}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Lokasi / Tempat</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {data.location || "-"}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Dicatat pada: {formatDateTime(data.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
