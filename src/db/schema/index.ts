import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. USER PROFILE (Data Profil Pemilik Log Book)
export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  jobTitle: varchar("job_title", { length: 100 }).default("Software Developer"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. ACTIVITY CATEGORIES (Kategori Aktivitas Kerja / Proyek)
export const activityCategories = pgTable("activity_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  colorHex: varchar("color_hex", { length: 10 }).default("#3b82f6").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityCategoriesRelations = relations(activityCategories, ({ many }) => ({
  logBooks: many(logBooks),
}));

// 3. LOG BOOKS (Catatan Log Book Aktivitas Pribadi)
export const logBooks = pgTable("log_books", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => activityCategories.id),
  activityDate: varchar("activity_date", { length: 20 }).notNull(), // YYYY-MM-DD
  startTime: varchar("start_time", { length: 10 }).notNull(),       // HH:mm
  endTime: varchar("end_time", { length: 10 }).notNull(),           // HH:mm
  location: varchar("location", { length: 150 }).default("Kantor / WFH"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  outputResult: text("output_result").notNull(),
  notes: text("notes"),                                             // Catatan / kendala / tindak lanjut
  status: varchar("status", { length: 30 }).default("COMPLETED").notNull(), // COMPLETED, IN_PROGRESS, DRAFT
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const logBooksRelations = relations(logBooks, ({ one, many }) => ({
  category: one(activityCategories, {
    fields: [logBooks.categoryId],
    references: [activityCategories.id],
  }),
  attachments: many(logBookAttachments),
}));

// 4. LOG BOOK ATTACHMENTS (Lampiran Berkas Bukti)
export const logBookAttachments = pgTable("log_book_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  logBookId: uuid("log_book_id").references(() => logBooks.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const logBookAttachmentsRelations = relations(logBookAttachments, ({ one }) => ({
  logBook: one(logBooks, {
    fields: [logBookAttachments.logBookId],
    references: [logBooks.id],
  }),
}));
