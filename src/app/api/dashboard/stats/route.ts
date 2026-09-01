import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/services/data-store";

export async function GET() {
  try {
    const allLogbooks = store.logbooks;
    const completed = allLogbooks.filter((lb) => lb.status === "COMPLETED").length;
    const inProgress = allLogbooks.filter((lb) => lb.status === "IN_PROGRESS").length;
    const draft = allLogbooks.filter((lb) => lb.status === "DRAFT").length;

    // Calculate total hours
    let totalMinutes = 0;
    allLogbooks.forEach((lb) => {
      try {
        const [h1, m1] = lb.startTime.split(":").map(Number);
        const [h2, m2] = lb.endTime.split(":").map(Number);
        const diff = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diff > 0) totalMinutes += diff;
      } catch {
        // ignore
      }
    });

    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate TODAY's hours & target progress
    const today = new Date().toISOString().slice(0, 10);
    const todayLogbooks = allLogbooks.filter((lb) => lb.activityDate === today);
    let todayMinutes = 0;
    todayLogbooks.forEach((lb) => {
      try {
        const [h1, m1] = lb.startTime.split(":").map(Number);
        const [h2, m2] = lb.endTime.split(":").map(Number);
        const diff = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diff > 0) todayMinutes += diff;
      } catch {
        // ignore
      }
    });

    const todayHours = parseFloat((todayMinutes / 60).toFixed(1));
    const targetHours = store.profile.dailyTargetHours || 8;
    const todayPercentage = Math.round((todayHours / targetHours) * 100);
    const remainingHours = Math.max(0, targetHours - todayHours).toFixed(1);

    // Category breakdown
    const categoryStats = store.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      colorHex: cat.colorHex,
      count: allLogbooks.filter((lb) => lb.categoryId === cat.id).length,
    }));

    // Recent 5 activities
    const recentActivities = [...allLogbooks]
      .sort((a, b) => new Date(b.activityDate + "T" + b.startTime).getTime() - new Date(a.activityDate + "T" + a.startTime).getTime())
      .slice(0, 5)
      .map((lb) => ({
        ...lb,
        categoryName: store.categories.find((c) => c.id === lb.categoryId)?.name || "Umum",
        categoryColor: store.categories.find((c) => c.id === lb.categoryId)?.colorHex || "#3b82f6",
      }));

    return NextResponse.json({
      success: true,
      data: {
        profile: store.profile,
        metrics: {
          totalLogBooks: allLogbooks.length,
          totalHours,
          completed,
          inProgress,
          draft,
        },
        todayProgress: {
          date: today,
          hours: todayHours,
          targetHours,
          percentage: todayPercentage,
          remainingHours,
          count: todayLogbooks.length,
        },
        categoryStats,
        recentActivities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
