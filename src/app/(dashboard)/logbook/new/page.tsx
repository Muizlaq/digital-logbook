"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { logBookFormSchema, LogBookFormInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewPersonalLogBookPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Master Data
  const { data: masterData } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LogBookFormInput>({
    resolver: zodResolver(logBookFormSchema) as any,
    defaultValues: {
      activityDate: todayStr,
      startTime: "08:30",
      endTime: "12:00",
      categoryId: "",
      location: "Kantor / Meja Kerja",
      title: "",
      description: "",
      outputResult: "",
      notes: "",
      status: "COMPLETED",
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const durationText = useMemo(() => {
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
  }, [startTime, endTime]);

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
        attachments,
      };

      const res = await fetch("/api/logbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan log book.");
        return;
      }

      toast.success(json.message);
      router.push("/logbook");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan internal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl dark:border-slate-800">
            <Link href="/logbook">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Catat Aktivitas Baru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tuliskan rincian kegiatan, waktu pengerjaan, hasil capaian, dan lampiran pendukung.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Waktu & Klasifikasi */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Waktu Pelaksanaan & Kategori
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
                  Waktu Mulai <span className="text-rose-500">*</span>
                </label>
                <Input type="time" className="text-xs font-mono dark:bg-slate-950 dark:border-slate-800" {...register("startTime")} />
                {errors.startTime && (
                  <p className="text-xs text-rose-500 mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Selesai <span className="text-rose-500">*</span>
                </label>
                <Input type="time" className="text-xs font-mono dark:bg-slate-950 dark:border-slate-800" {...register("endTime")} />
                {errors.endTime && (
                  <p className="text-xs text-rose-500 mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-3 text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Estimasi Durasi Kerja Terhitung:</span>
              </div>
              <span className="font-bold text-blue-900 dark:text-blue-200">{durationText}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Pekerjaan
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
                  Lokasi / Tempat Kerja
                </label>
                <Input
                  placeholder="Contoh: Kantor Pusat, WFH, Client Office"
                  className="text-xs dark:bg-slate-950 dark:border-slate-800"
                  {...register("location")}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Aktivitas
                </label>
                <Select className="text-xs dark:bg-slate-950 dark:border-slate-800" {...register("status")}>
                  <option value="COMPLETED">✅ Selesai (Completed)</option>
                  <option value="IN_PROGRESS">⚡ Sedang Berjalan (In Progress)</option>
                  <option value="DRAFT">📝 Rencana / Draf</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Rincian Aktivitas */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Rincian Aktivitas & Hasil
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Aktivitas <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Slicing UI Komponen & Integrasi REST API"
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Lengkap <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={4}
                placeholder="Jelaskan apa yang Anda kerjakan secara runut dan terstruktur..."
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hasil / Output Capaian <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={3}
                placeholder="Contoh: Berhasil deploy endpoint ke staging server dan lulus uji testing."
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("outputResult")}
              />
              {errors.outputResult && (
                <p className="text-xs text-rose-500 mt-1">{errors.outputResult.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan / Kendala / Tindak Lanjut (Opsional)
              </label>
              <Textarea
                rows={2}
                placeholder="Catatan untuk diri sendiri atau pengingat langkah berikutnya..."
                className="text-xs dark:bg-slate-950 dark:border-slate-800"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Lampiran Bukti File */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Lampiran Berkas Bukti
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Upload foto screenshot, berkas PDF, dokumen, atau spreadsheet (Maks 5 MB per berkas).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                <Paperclip className="h-4 w-4" />
                <span>{uploading ? "Mengunggah..." : "Pilih Berkas Lampiran"}</span>
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
                <span>Simpan Catatan Log Book</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
