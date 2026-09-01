import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/services/data-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const categoryId = searchParams.get("categoryId") || "ALL";
    const status = searchParams.get("status") || "ALL";

    let list = [...store.logbooks];

    if (startDate) list = list.filter((lb) => lb.activityDate >= startDate);
    if (endDate) list = list.filter((lb) => lb.activityDate <= endDate);
    if (status !== "ALL") list = list.filter((lb) => lb.status === status);
    if (categoryId !== "ALL") list = list.filter((lb) => lb.categoryId === categoryId);

    // Sort
    list.sort((a, b) => new Date(b.activityDate + "T" + b.startTime).getTime() - new Date(a.activityDate + "T" + a.startTime).getTime());

    // Enrich rows for report table & export
    let totalMinutes = 0;
    const rows = list.map((lb, index) => {
      const category = store.categories.find((c) => c.id === lb.categoryId)?.name || "Umum";
      const duration = calculateDuration(lb.startTime, lb.endTime);

      try {
        const [h1, m1] = lb.startTime.split(":").map(Number);
        const [h2, m2] = lb.endTime.split(":").map(Number);
        const diff = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diff > 0) totalMinutes += diff;
      } catch {
        // ignore
      }

      return {
        no: index + 1,
        id: lb.id,
        activityDate: lb.activityDate,
        startTime: lb.startTime,
        endTime: lb.endTime,
        duration,
        location: lb.location,
        category,
        title: lb.title,
        description: lb.description,
        outputResult: lb.outputResult,
        notes: lb.notes || "-",
        status: lb.status,
        createdAt: lb.createdAt,
      };
    });

    const summary = {
      total: rows.length,
      totalHours: (totalMinutes / 60).toFixed(1),
      completed: rows.filter((r) => r.status === "COMPLETED").length,
      inProgress: rows.filter((r) => r.status === "IN_PROGRESS").length,
      draft: rows.filter((r) => r.status === "DRAFT").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        rows,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateDuration(start: string, end: string): string {
  try {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (totalMinutes <= 0) return "0 jam";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} mnt`;
    if (hours > 0) return `${hours} jam`;
    return `${minutes} menit`;
  } catch {
    return "-";
  }
}
