import { z } from "zod";

// 1. Log Book Form Schema
export const logBookAttachmentSchema = z.object({
  id: z.string().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
});

export const logBookFormSchema = z
  .object({
    activityDate: z.string().min(1, "Tanggal aktivitas wajib diisi"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu mulai harus HH:mm"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu selesai harus HH:mm"),
    categoryId: z.string().optional().nullable(),
    location: z.string().default("Kantor / WFH"),
    title: z
      .string()
      .min(3, "Judul aktivitas minimal 3 karakter")
      .max(200, "Judul aktivitas maksimal 200 karakter"),
    description: z
      .string()
      .min(3, "Deskripsi minimal 3 karakter")
      .max(3000, "Deskripsi maksimal 3000 karakter"),
    outputResult: z
      .string()
      .max(1500, "Hasil output maksimal 1500 karakter")
      .optional()
      .default(""),
    notes: z.string().optional().nullable(),
    status: z
      .enum(["COMPLETED", "IN_PROGRESS", "DRAFT", "SICK", "PERMISSION", "HOLIDAY"])
      .default("COMPLETED"),
    attachments: z.array(logBookAttachmentSchema).optional(),
  })
  .refine(
    (data) => {
      // For Sick, Permission, or Holiday, end time validation can be relaxed
      if (data.status === "SICK" || data.status === "PERMISSION" || data.status === "HOLIDAY") {
        return true;
      }
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "Waktu selesai harus lebih akhir daripada waktu mulai",
      path: ["endTime"],
    }
  );

export type LogBookFormInput = z.infer<typeof logBookFormSchema>;

// 2. Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(100),
  description: z.string().optional().nullable(),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Format warna hex tidak valid").default("#3b82f6"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// 3. User Profile Schema
export const userProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  jobTitle: z.string().min(2, "Profesi/Jabatan minimal 2 karakter"),
  dailyTargetHours: z.coerce.number().min(1, "Target minimal 1 jam").max(24, "Target maksimal 24 jam").default(8),
  bio: z.string().optional().nullable(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
