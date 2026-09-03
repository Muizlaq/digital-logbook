"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Paperclip,
  Save,
  Loader2,
  FileCheck,
  Trash2,
  Info,
  Briefcase,
  HeartPulse,
  CalendarCheck,
  Palmtree,
  FileText,
} from "lucide-react";
import { logBookFormSchema, LogBookFormInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditPersonalLogBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Fetch Existing Logbook
  const { data: logBook, isLoading: loadingLogBook } = useQuery({
    queryKey: ["logbook-edit", id],
    queryFn: async () => {
      const res = await fetch(`/api/logbooks/${id}`);
      if (!res.ok) throw new Error("Log book tidak ditemukan");
      const json = await res.json();
      return json.data;
    },
  });

  // Master Data
  const { data: masterData } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LogBookFormInput>({
    resolver: zodResolver(logBookFormSchema) as any,
    defaultValues: {
      activityDate: "",
      startTime: "",
      endTime: "",
      categoryId: "",
      location: "",
      title: "",
      description: "",
      outputResult: "",
      notes: "",
      status: "COMPLETED",
    },
  });

  useEffect(() => {
    if (logBook) {
      reset({
        activityDate: logBook.activityDate,
        startTime: logBook.startTime,
        endTime: logBook.endTime,
        categoryId: logBook.categoryId || "",
        location: logBook.location || "Kantor / WFH",
        title: logBook.title,
        description: logBook.description,
        outputResult: logBook.outputResult || "",
        notes: logBook.notes || "",
        status: logBook.status || "COMPLETED",
      });
      setAttachments(logBook.attachments || []);
    }
  }, [logBook, reset]);

  const currentStatus = watch("status");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const isAbsent = currentStatus === "SICK" || currentStatus === "PERMISSION" || currentStatus === "HOLIDAY";

  const handlePresenceChange = (statusType: "COMPLETED" | "SICK" | "PERMISSION" | "HOLIDAY") => {
    setValue("status", statusType);
    if (statusType === "SICK") {
      if (!watch("title") || watch("title") === "Izin / Keperluan Pribadi" || watch("title") === "Hari Libur Nasional / Cuti") {
        setValue("title", "Izin Sakit");
      }
      setValue("location", "Rumah / Rawat Jalan");
    } else if (statusType === "PERMISSION") {
      if (!watch("title") || watch("title") === "Izin Sakit" || watch("title") === "Hari Libur Nasional / Cuti") {
        setValue("title", "Izin / Keperluan Pribadi");
      }
      setValue("location", "Izin");
    } else if (statusType === "HOLIDAY") {
      setValue("title", "Hari Libur Nasional / Cuti");
      setValue("location", "Libur");
    }
  };

  const durationText = useMemo(() => {
    if (isAbsent) return "0 Jam (Tidak Masuk Kerja)";
    if (!startTime || !endTime) return "-";
    try {
      const [h1, m1] = startTime.split(":").map(Number);
      const [h2, m2] = endTime.split(":").map(Number);
      const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
      if (totalMinutes <= 0) return "Waktu tidak valid (selesai <= mulai)";
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`;
      if (hours > 0) return `${hours} jam`;
      return `${mins} menit`;
    } catch {
      return "-";
    }
  }, [startTime, endTime, isAbsent]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          toast.error(json.message || "Gagal upload");
          continue;
        }

        setAttachments((prev) => [...prev, json.data]);
        toast.success(`Lampiran "${file.name}" berhasil diunggah.`);
      }
    } catch {
      toast.error("Terjadi kesalahan saat upload berkas.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleUpdate = async (data: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        attachments,
      };

      const res = await fetch(`/api/logbooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal memperbarui log book.");
        return;
      }

      toast.success(json.message);
      router.push(`/logbook/${id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan internal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLogBook) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl dark:border-slate-800">
            <Link href={`/logbook/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Edit Catatan Log Book & Presensi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbarui rincian aktivitas kerja, status sakit, izin, atau libur.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
        {/* Presensi / Kehadiran Selector Cards */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Tipe Kehadiran / Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Hadir */}
              <button
                type="button"
                onClick={() => handlePresenceChange("COMPLETED")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  currentStatus === "COMPLETED" || currentStatus === "IN_PROGRESS" || currentStatus === "DRAFT"
                    ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {(currentStatus === "COMPLETED" || currentStatus === "IN_PROGRESS" || currentStatus === "DRAFT") && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs">Hadir Bekerja</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Aktivitas normal</div>
                </div>
              </button>

              {/* 2. Sakit */}
              <button
                type="button"
                onClick={() => handlePresenceChange("SICK")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  currentStatus === "SICK"
                    ? "border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <HeartPulse className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  {currentStatus === "SICK" && <span className="h-2 w-2 rounded-full bg-rose-600" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Sakit (Sick Leave)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Surat dokter / rawat</div>
                </div>
              </button>

              {/* 3. Izin */}
              <button
                type="button"
                onClick={() => handlePresenceChange("PERMISSION")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  currentStatus === "PERMISSION"
                    ? "border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  {currentStatus === "PERMISSION" && <span className="h-2 w-2 rounded-full bg-amber-600" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Izin / Cuti</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Keperluan pribadi</div>
                </div>
              </button>

              {/* 4. Libur */}
              <button
                type="button"
                onClick={() => handlePresenceChange("HOLIDAY")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  currentStatus === "HOLIDAY"
                    ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Palmtree className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  {currentStatus === "HOLIDAY" && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Libur / Cuti Bersama</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Hari libur resmi</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Waktu & Klasifikasi */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Tanggal & Detail Waktu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Aktivitas <span className="text-rose-500">*</span>
                </label>
                <Input type="date" className="text-xs font-medium dark:bg-slate-950 dark:border-slate-800" {...register("activityDate")} />
                {errors.activityDate && (
                  <p className="text-xs text-rose-500 mt-1">{errors.activityDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Mulai
                </label>
                <Input type="time" className="text-xs font-mono dark:bg-slate-950 dark:border-slate-800" {...register("startTime")} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Selesai
                </label>
                <Input type="time" className="text-xs font-mono dark:bg-slate-950 dark:border-slate-800" {...register("endTime")} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-3 text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Durasi Kerja Terhitung:</span>
              </div>
              <span className="font-bold text-blue-900 dark:text-blue-200">{durationText}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <Select className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("categoryId")}>
                  <option value="">-- Pilih Kategori --</option>
                  {masterData?.categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi / Keterangan Tempat
                </label>
                <Input className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("location")} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Catatan
                </label>
                <Select className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("status")}>
                  <option value="COMPLETED">✅ Hadir - Selesai</option>
                  <option value="IN_PROGRESS">⚡ Hadir - Sedang Berjalan</option>
                  <option value="DRAFT">📝 Draf / Rencana</option>
                  <option value="SICK">🏥 Sakit</option>
                  <option value="PERMISSION">📄 Izin / Cuti</option>
                  <option value="HOLIDAY">🏖️ Libur</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Rincian Aktivitas */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {isAbsent ? "Keterangan Alasan Izin / Sakit" : "Rincian Aktivitas & Hasil"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Judul Keterangan" : "Judul Aktivitas"} <span className="text-rose-500">*</span>
              </label>
              <Input className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Penjelasan Alasan Lengkap" : "Deskripsi Lengkap Aktivitas"} <span className="text-rose-500">*</span>
              </label>
              <Textarea rows={4} className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("description")} />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Output / Status Persetujuan (Opsional)" : "Output / Hasil Capaian"}
              </label>
              <Textarea rows={3} className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("outputResult")} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan & Kendala
              </label>
              <Textarea rows={2} className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Lampiran Bukti File */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {currentStatus === "SICK"
                ? "Lampiran Surat Keterangan Dokter"
                : currentStatus === "PERMISSION"
                ? "Lampiran Surat Izin"
                : "Lampiran Bukti Aktivitas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                <Paperclip className="h-4 w-4" />
                <span>{uploading ? "Mengunggah..." : "Tambah Berkas Lampiran"}</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,.zip"
                />
              </label>
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />}
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{att.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" asChild className="rounded-xl text-xs dark:border-slate-800">
            <Link href={`/logbook/${id}`}>Batal</Link>
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 gap-1.5 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
