"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings,
  User,
  Layers,
  PlusCircle,
  Save,
  Loader2,
  Edit2,
  Trash2,
  Palette,
  Target,
} from "lucide-react";
import { categorySchema, userProfileSchema, CategoryInput, UserProfileInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#64748b", // Slate
];

export default function PersonalSettingsPage() {
  const queryClient = useQueryClient();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Fetch Master Data & Profile
  const { data } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const res = await fetch("/api/master-data");
      const json = await res.json();
      return json.data;
    },
  });

  const categories = data?.categories || [];
  const profile = data?.profile || {
    name: "Pengguna Log Book",
    email: "saya@logbook.local",
    jobTitle: "Software Developer",
    dailyTargetHours: 8,
    bio: "",
  };

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema) as any,
    values: {
      name: profile.name,
      email: profile.email,
      jobTitle: profile.jobTitle,
      dailyTargetHours: profile.dailyTargetHours || 8,
      bio: profile.bio || "",
    },
  });

  // Category Form
  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
    setValue: setCategoryValue,
    watch: watchCategory,
    formState: { errors: categoryErrors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      description: "",
      colorHex: "#f97316",
    },
  });

  const selectedColor = watchCategory("colorHex") || "#f97316";

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    resetCategory({
      name: "",
      description: "",
      colorHex: "#f97316",
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    setEditingCategory(cat);
    resetCategory({
      name: cat.name,
      description: cat.description || "",
      colorHex: cat.colorHex || "#f97316",
    });
    setIsCategoryModalOpen(true);
  };

  // Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: UserProfileInput) => {
      const res = await fetch("/api/master-data?type=profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Profil berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["master-data"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Save Category Mutation (Add or Edit)
  const saveCategoryMutation = useMutation({
    mutationFn: async (formData: CategoryInput) => {
      const url = editingCategory
        ? `/api/master-data?type=category&id=${editingCategory.id}`
        : "/api/master-data?type=category";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Kategori berhasil disimpan!");
      setIsCategoryModalOpen(false);
      resetCategory();
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["master-data"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
      const res = await fetch(`/api/master-data?type=category&id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: (res) => {
      if (!res) return;
      toast.success(res.message || "Kategori berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["master-data"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-500" /> Kategori & Pengaturan Profil
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
          Atur informasi profil pribadi, target jam kerja harian, dan kelola kategori pekerjaan Anda.
        </p>
      </div>

      {/* Category Section */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-500" /> Kategori Aktivitas Pekerjaan
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">
              Kategori yang tersedia saat Anda mencatat dan memfilter log book aktivitas.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddCategoryModal}
            className="rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 cursor-pointer px-4"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" /> Tambah Kategori
          </Button>
        </div>

        <div className="p-0">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada kategori. Klik tombol &quot;Tambah Kategori&quot; untuk membuat kategori baru.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-100/80 dark:bg-[#11131c]">
                <TableRow className="border-b border-slate-200/80 dark:border-white/[0.08]">
                  <TableHead className="w-12 text-slate-700 dark:text-zinc-400 font-bold">No</TableHead>
                  <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Nama Kategori</TableHead>
                  <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Deskripsi</TableHead>
                  <TableHead className="text-slate-700 dark:text-zinc-400 font-bold">Warna Label</TableHead>
                  <TableHead className="text-right text-slate-700 dark:text-zinc-400 font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c: any, idx: number) => (
                  <TableRow key={c.id} className="border-b border-slate-100 dark:border-white/[0.05] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                    <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: c.colorHex }}
                        />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-zinc-300 max-w-xs truncate">
                      {c.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded border border-slate-300 dark:border-zinc-700"
                          style={{ backgroundColor: c.colorHex }}
                        />
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                          {c.colorHex}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCategoryModal(c)}
                          className="h-8 w-8 text-slate-600 dark:text-zinc-400 hover:text-orange-500 rounded-lg"
                          title="Ubah Kategori"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategoryMutation.mutate(c.id)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-500 rounded-lg"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="glass-card rounded-3xl p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-100 dark:border-white/[0.08] pb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-orange-500" /> Informasi Profil & Target Jam Kerja
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal mt-0.5">
            Nama dan profesi akan otomatis tercantum pada kop laporan PDF, serta target jam kerja untuk indikator progress ring di dashboard.
          </p>
        </div>

        <form
          onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <Input className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-medium" {...registerProfile("name")} />
              {profileErrors.name && (
                <p className="text-xs text-rose-500 mt-1">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <Input type="email" className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-medium" {...registerProfile("email")} />
              {profileErrors.email && (
                <p className="text-xs text-rose-500 mt-1">{profileErrors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Profesi / Jabatan / Posisi
              </label>
              <Input
                placeholder="Contoh: Senior Frontend Engineer / Konsultan"
                className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-medium"
                {...registerProfile("jobTitle")}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-orange-500" />
                Target Jam Kerja Harian (Jam) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.5"
                min="1"
                max="24"
                placeholder="8"
                className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-bold"
                {...registerProfile("dailyTargetHours")}
              />
              {profileErrors.dailyTargetHours && (
                <p className="text-xs text-rose-500 mt-1">{profileErrors.dailyTargetHours.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Catatan Singkat / Bio
            </label>
            <Input
              placeholder="Motto kerja atau fokus keahlian..."
              className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-medium"
              {...registerProfile("bio")}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full text-xs gap-1.5 shadow-lg shadow-orange-500/25 px-6 cursor-pointer"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Simpan Profil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Add / Edit Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0c0d14] border-slate-200 dark:border-white/[0.08] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-orange-500" />
              {editingCategory ? "Ubah Data Kategori" : "Tambah Kategori Aktivitas Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              {editingCategory
                ? "Perbarui nama, deskripsi, atau warna label kategori yang dipilih."
                : "Buat kategori kustom untuk mengelompokkan aktivitas harian Anda."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCategorySubmit((data) => saveCategoryMutation.mutate(data))}
            className="space-y-4 py-2 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Riset AI, Desain UI/UX, Maintenance"
                className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                {...registerCategory("name")}
              />
              {categoryErrors.name && (
                <p className="text-xs text-rose-500 mt-1">{categoryErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <Input
                placeholder="Penjelasan ringkas kategori..."
                className="text-xs rounded-xl bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
                {...registerCategory("description")}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Pilih Warna Label Kategori
              </label>

              {/* Preset Color Chips */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryValue("colorHex", color)}
                    className={`h-6 w-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                      selectedColor.toLowerCase() === color.toLowerCase()
                        ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#0c0d14] scale-110"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-9 w-12 rounded-lg cursor-pointer border border-slate-200 dark:border-white/[0.1] p-0.5 bg-transparent"
                  {...registerCategory("colorHex")}
                />
                <Input
                  className="h-8 w-28 font-mono text-xs uppercase rounded-lg bg-slate-50 dark:bg-[#12141c] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-bold"
                  {...registerCategory("colorHex")}
                />
                <span className="text-slate-400 text-[11px]">
                  Hex color code
                </span>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-full"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saveCategoryMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full px-5 cursor-pointer"
              >
                {saveCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Menyimpan...
                  </>
                ) : editingCategory ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Kategori"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
