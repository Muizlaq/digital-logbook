export interface UserProfileModel {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  dailyTargetHours: number;
  avatarUrl?: string | null;
  bio?: string | null;
}

import { toLocalDateString } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
  description?: string;
  colorHex: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  logBookId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface LogBook {
  id: string;
  categoryId: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  location: string;
  title: string;
  description: string;
  outputResult: string;
  notes?: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "SICK" | "PERMISSION" | "HOLIDAY";
  createdAt: string;
  updatedAt: string;
  category?: Category;
  attachments?: Attachment[];
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  bio: string;
  dailyTargetHours: number;
}

class InMemoryDataStore {
  public categories: Category[] = [];
  public logbooks: LogBook[] = [];
  public attachments: Attachment[] = [];
  public profile: Profile = {
    id: "profile-1",
    name: "Zuzule",
    email: "zuzul@logbook.local",
    jobTitle: "ccis",
    bio: "bismillah",
    dailyTargetHours: 8,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Initial Categories
    this.categories = [
      {
        id: "cat-dev",
        name: "Pekerjaan",
        description: "Mengerjakan tugas harian & jobdesk utama",
        colorHex: "#f97316", // Flame Orange
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-meeting",
        name: "Koordinasi & Technical Meeting",
        description: "Rapat koordinasi tim, sprint planning, dan presentasi progres",
        colorHex: "#f59e0b", // Radiant Amber
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-learning",
        name: "Pembelajaran",
        description: "Mempelajari framework, teknologi baru, dan eksplorasi riset",
        colorHex: "#10b981", // Emerald
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-other",
        name: "Lainnya",
        description: "Aktivitas administratif dan penunjang lainnya",
        colorHex: "#8b5cf6", // Purple
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 2. Initial Sample Logbooks
    const today = toLocalDateString(new Date());
    const yesterday = toLocalDateString(new Date(Date.now() - 86400000));
    const twoDaysAgo = toLocalDateString(new Date(Date.now() - 172800000));

    this.logbooks = [
      {
        id: "lb-1",
        categoryId: "cat-dev",
        activityDate: today,
        startTime: "08:30",
        endTime: "12:00",
        location: "Kantor Pusat / Meja Kerja",
        title: "Penyusunan REST API & Skema Database Drizzle",
        description: "Membuat route handlers untuk endpoint data logbook, integrasi validasi Zod, dan pengujian Drizzle ORM.",
        outputResult: "Seluruh endpoint data siap dan response API terstandarisasi.",
        notes: "Perlu menambahkan filter custom date range pada query laporan.",
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "lb-2",
        categoryId: "cat-maintenance",
        activityDate: yesterday,
        startTime: "13:00",
        endTime: "16:30",
        location: "Remote / WFH",
        title: "Optimasi Indeks Database & Monitoring Query",
        description: "Melakukan profiling query PostgreSQL dan menambahkan index pada tabel aktivitas.",
        outputResult: "Response time query berkurang drastis menjadi di bawah 50ms.",
        notes: "Jadwal auto vacuum mingguan telah dikonfigurasi.",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "lb-3",
        categoryId: "cat-meeting",
        activityDate: twoDaysAgo,
        startTime: "10:00",
        endTime: "11:30",
        location: "Ruang Rapat Alpha",
        title: "Sprint Planning & Pembagian Modul Proyek",
        description: "Menyelaraskan prioritas fitur, format laporan cetak PDF, dan target rilis bulanan.",
        outputResult: "Daftar checklist tugas kerja pekan ini disepakati.",
        notes: null,
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  }
}

// Global Singleton Store
const globalStore = globalThis as unknown as {
  dataStoreInstance: InMemoryDataStore | undefined;
};

export const store = globalStore.dataStoreInstance ?? new InMemoryDataStore();
if (process.env.NODE_ENV !== "production") globalStore.dataStoreInstance = store;
