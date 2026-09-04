"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Calendar as CalendarIcon,
  CheckCircle2,
  Edit,
  ExternalLink,
} from "lucide-react";
import { logBookFormSchema, LogBookFormInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AttendanceCalendarPicker, NATIONAL_HOLIDAYS } from "@/components/logbook/attendance-calendar-picker";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function NewPersonalLogBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Real-time server time state
  const [serverTime, setServerTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setServerTime(`${hours}.${minutes}.${seconds} WIB (GMT+7)`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today initial date (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const initialDate = searchParams.get("date") || todayStr;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // Fetch Master Data (Categories, etc.)
  const { data: masterData } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch existing logbooks to show attendance status on calendar
  const { data: logbooksData } = useQuery({
    queryKey: ["all-logbooks-calendar"],
    queryFn: async () => {
      const res = await fetch("/api/logbooks?limit=500");
      const json = await res.json();
      return json.data;
    },
  });

  const existingLogbooks = logbooksData?.items || [];

  // Check if current selected date already has a logbook
  const existingRecordForSelectedDate = useMemo(() => {
    return existingLogbooks.find((lb: any) => lb.activityDate === selectedDate);
  }, [existingLogbooks, selectedDate]);

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
      activityDate: selectedDate,
      startTime: "08:30",
      endTime: "17:00",
      categoryId: "",
      location: "Kantor / Meja Kerja",
      title: "",
      description: "",
      outputResult: "",
      notes: "",
      status: "COMPLETED",
    },
  });

  // When selectedDate changes via Calendar click, update form
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setValue("activityDate", dateStr);

    // If an existing record exists on that date, optionally pre-fill or alert
    const record = existingLogbooks.find((lb: any) => lb.activityDate === dateStr);
    const holidayName = NATIONAL_HOLIDAYS[dateStr];

    if (record) {
      setValue("startTime", record.startTime || "08:30");
      setValue("endTime", record.endTime || "17:00");
      setValue("categoryId", record.categoryId || "");
      setValue("location", record.location || "Kantor / Meja Kerja");
      setValue("title", record.title || "");
      setValue("description", record.description || "");
      setValue("outputResult", record.outputResult || "");
      setValue("notes", record.notes || "");
      setValue("status", record.status || "COMPLETED");
      setAttachments(record.attachments || []);
      toast.info(`Memuat data catatan untuk ${formatDate(dateStr)}`);
    } else if (holidayName) {
      // Auto-set as National Holiday
      setValue("status", "HOLIDAY");
      setValue("title", `Hari Libur Nasional: ${holidayName}`);
      setValue("location", "Libur Resmi");
      setValue("description", `Hari Libur Resmi Nasional (${holidayName}).`);
      setValue("outputResult", "Libur Nasional");
      setValue("notes", "Libur resmi kalender nasional.");
      setValue("startTime", "08:00");
      setValue("endTime", "17:00");
      setAttachments([]);
      toast.info(`Tanggal ini adalah Hari Libur Nasional: ${holidayName}`);
    } else {
      // Reset to clean state for new record
      setValue("title", "");
      setValue("description", "");
      setValue("outputResult", "");
      setValue("notes", "");
      setValue("status", "COMPLETED");
      setValue("startTime", "08:30");
      setValue("endTime", "17:00");
      setValue("location", "Kantor / Meja Kerja");
      setAttachments([]);
    }
  };

  const currentStatus = watch("status");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const isAbsent = currentStatus === "SICK" || currentStatus === "PERMISSION" || currentStatus === "HOLIDAY";

  // Handle Quick Status Type Selection
  const handlePresenceChange = (statusType: "COMPLETED" | "SICK" | "PERMISSION" | "HOLIDAY") => {
    setValue("status", statusType);
    if (statusType === "SICK") {
      setValue("title", "Izin Sakit");
      setValue("location", "Rumah / Rawat Jalan");
      setValue("description", "Tidak dapat hadir bekerja dikarenakan kondisi kesehatan sedang sakit / memerlukan istirahat medis.");
      setValue("outputResult", "Surat Keterangan Dokter Terlampir");
      setValue("startTime", "08:00");
      setValue("endTime", "17:00");
    } else if (statusType === "PERMISSION") {
      setValue("title", "Izin / Keperluan Pribadi");
      setValue("location", "Izin");
      setValue("description", "Mengajukan izin tidak hadir bekerja untuk keperluan penting / keluarga.");
      setValue("outputResult", "Disetujui / Surat Izin");
      setValue("startTime", "08:00");
      setValue("endTime", "17:00");
    } else if (statusType === "HOLIDAY") {
      setValue("title", "Hari Libur Nasional / Cuti");
      setValue("location", "Libur");
      setValue("description", "Hari libur resmi / cuti bersama.");
      setValue("outputResult", "Libur");
      setValue("startTime", "08:00");
      setValue("endTime", "17:00");
    } else {
      setValue("title", "");
      setValue("location", "Kantor / Meja Kerja");
      setValue("description", "");
      setValue("outputResult", "");
      setValue("startTime", "08:30");
      setValue("endTime", "17:00");
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
          toast.error(json.message || "Gagal mengunggah file");
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

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        activityDate: selectedDate, // ensure locked to selected calendar date
        attachments,
      };

      let res;
      if (existingRecordForSelectedDate?.id) {
        // Update existing record
        res = await fetch(`/api/logbooks/${existingRecordForSelectedDate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new record
        res = await fetch("/api/logbooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan log book.");
        return;
      }

      toast.success(json.message || "Catatan aktivitas berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["all-logbooks-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/logbook");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan internal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. Header Page Title (Kemnaker Style) */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
          RIWAYAT
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Riwayat Kehadiran
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Lihat catatan kehadiran dan laporan harian Anda.
        </p>
      </div>

      {/* 2. Monthly Attendance Calendar Picker (Referensikan Gambar Kedua) */}
      <AttendanceCalendarPicker
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        existingLogbooks={existingLogbooks}
      />

      {/* 3. Form Input Card (Terhubung langsung ke Tanggal Kalender) */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Title & Server Time Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {existingRecordForSelectedDate ? "UPDATE LAPORAN" : "TAMBAH LAPORAN"}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              {formatDate(selectedDate)}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span>Waktu Server: <strong className="font-mono text-blue-600 dark:text-blue-400">{serverTime || "10.43.44 WIB (GMT+7)"}</strong></span>
          </div>
        </div>

        {NATIONAL_HOLIDAYS[selectedDate] && (
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <Palmtree className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>Hari Libur Nasional:</strong> {NATIONAL_HOLIDAYS[selectedDate]}. Form otomatis disesuaikan untuk status Libur Resmi.
              </span>
            </div>
            <span className="font-bold text-[11px] bg-rose-600 text-white px-2 py-0.5 rounded-md">
              Libur Resmi
            </span>
          </div>
        )}

        {existingRecordForSelectedDate && (
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Tanggal ini sudah memiliki catatan: <strong>&ldquo;{existingRecordForSelectedDate.title}&rdquo;</strong>. Anda dapat memperbarui form di bawah.
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Link href={`/logbook/${existingRecordForSelectedDate.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" /> Lihat Rincian
              </Link>
            </Button>
          </div>
        )}

        {/* Presensi / Kehadiran Selector Cards */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Tipe Kehadiran / Status Hari Ini
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

        {/* Section 1: Tanggal & Waktu */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Detail Waktu & Klasifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Terpilih <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    min="2026-08-10"
                    max="2027-02-09"
                    className="text-xs font-semibold dark:bg-slate-950 dark:border-slate-800 bg-slate-50"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                  />
                </div>
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
                  Kategori Aktivitas
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
                <Input
                  placeholder="Contoh: Kantor / Meja Kerja"
                  className="text-xs dark:bg-slate-950 dark:border-slate-800"
                  {...register("location")}
                />
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

        {/* Section 2: Rincian Aktivitas / Alasan Izin */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {isAbsent ? "Keterangan Alasan Izin / Sakit" : "Rincian Aktivitas & Hasil Kerja"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Judul Keterangan" : "Judul Aktivitas"} <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder={isAbsent ? "Contoh: Izin Sakit Demam & Flu" : "Contoh: Slicing UI Komponen & Integrasi REST API"}
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Penjelasan Alasan Lengkap" : "Deskripsi Lengkap Aktivitas"} <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={4}
                placeholder={
                  isAbsent
                    ? "Tuliskan keterangan detail sakit / keperluan izin..."
                    : "Jelaskan apa yang Anda kerjakan secara runut dan terstruktur..."
                }
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAbsent ? "Output / Status Persetujuan (Opsional)" : "Hasil / Output Capaian"}
              </label>
              <Textarea
                rows={2}
                placeholder={
                  isAbsent
                    ? "Contoh: Surat dokter telah diunggah / Izin disetujui pembimbing"
                    : "Contoh: Berhasil menyelesaikan task dan commit kode ke repository."
                }
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("outputResult")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <Textarea
                rows={2}
                placeholder="Catatan pendukung lainnya..."
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Lampiran Bukti / Surat Dokter */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {currentStatus === "SICK"
                ? "Lampiran Surat Keterangan Dokter / Resep"
                : currentStatus === "PERMISSION"
                ? "Lampiran Surat Izin / Bukti Pendukung"
                : "Lampiran Berkas Bukti Kerja"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Upload foto screenshot, surat dokter PDF/JPG, atau dokumen pendukung lainnya (Maks 5 MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                <Paperclip className="h-4 w-4" />
                <span>{uploading ? "Mengunggah..." : currentStatus === "SICK" ? "Upload Surat Dokter" : "Pilih Berkas Lampiran"}</span>
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
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Berkas Terlampir ({attachments.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-xl text-xs font-semibold dark:border-slate-800"
          >
            <Link href="/logbook">Batal</Link>
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
                <span>{existingRecordForSelectedDate ? "Perbarui Catatan" : "Simpan Catatan"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
