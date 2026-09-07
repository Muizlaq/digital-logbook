import { toLocalDateString } from "@/lib/utils";

export interface UserProfileModel {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  dailyTargetHours: number;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface ActivityCategoryModel {
  id: string;
  name: string;
  description?: string | null;
  colorHex: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogBookAttachmentModel {
  id: string;
  logBookId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType?: string;
  createdAt: string;
}

export interface LogBookModel {
  id: string;
  categoryId?: string | null;
  activityDate: string; // YYYY-MM-DD
  startTime: string;    // HH:mm
  endTime: string;      // HH:mm
  location: string;
  title: string;
  description: string;
  outputResult: string;
  notes?: string | null;
  status: "COMPLETED" | "IN_PROGRESS" | "DRAFT" | "SICK" | "PERMISSION" | "HOLIDAY";
  createdAt: string;
  updatedAt: string;
  category?: ActivityCategoryModel;
  attachments?: LogBookAttachmentModel[];
}

export class DataStore {
  public profile: UserProfileModel = {
    id: "usr-me",
    name: "Zuzule",
    email: "zuzul@logbook.local",
    jobTitle: "ccis",
    dailyTargetHours: 8,
    avatarUrl: null,
    bio: "bismillah",
  };

  public categories: ActivityCategoryModel[] = [];
  public logbooks: LogBookModel[] = [];
  public attachments: LogBookAttachmentModel[] = [];
  private initialized = false;

  constructor() {
    this.initDefaultData();
  }

  public async initDefaultData() {
    if (this.initialized) return;
    this.initialized = true;

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
        categoryId: "cat-dev",
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
  dataStoreInstance: DataStore | undefined;
};

export const store = globalStore.dataStoreInstance ?? new DataStore();
if (process.env.NODE_ENV !== "production") globalStore.dataStoreInstance = store;
