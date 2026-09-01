import { NextRequest, NextResponse } from "next/server";
import { store, LogBookModel } from "@/lib/services/data-store";
import { logBookFormSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "ALL";
    const categoryId = searchParams.get("categoryId") || "ALL";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let list = [...store.logbooks];

    // Filters
    if (status !== "ALL") {
      list = list.filter((lb) => lb.status === status);
    }
    if (categoryId !== "ALL") {
      list = list.filter((lb) => lb.categoryId === categoryId);
    }
    if (startDate) {
      list = list.filter((lb) => lb.activityDate >= startDate);
    }
    if (endDate) {
      list = list.filter((lb) => lb.activityDate <= endDate);
    }
    if (search) {
      list = list.filter(
        (lb) =>
          lb.title.toLowerCase().includes(search) ||
          lb.description.toLowerCase().includes(search) ||
          lb.outputResult.toLowerCase().includes(search) ||
          (lb.location && lb.location.toLowerCase().includes(search))
      );
    }

    // Sort descending by date & start time
    list.sort((a, b) => new Date(b.activityDate + "T" + b.startTime).getTime() - new Date(a.activityDate + "T" + a.startTime).getTime());

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Hydrate relations
    const hydrated = paginated.map((lb) => {
      const category = store.categories.find((c) => c.id === lb.categoryId);
      const attachments = store.attachments.filter((a) => a.logBookId === lb.id);

      return {
        ...lb,
        category: category ? { id: category.id, name: category.name, colorHex: category.colorHex } : null,
        attachmentCount: attachments.length,
        attachments,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: hydrated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = logBookFormSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi form gagal",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const logBookId = "lb-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    const newLogBook: LogBookModel = {
      id: logBookId,
      categoryId: data.categoryId || null,
      activityDate: data.activityDate,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location || "Kantor / WFH",
      title: data.title,
      description: data.description,
      outputResult: data.outputResult,
      notes: data.notes || null,
      status: data.status || "COMPLETED",
      createdAt: now,
      updatedAt: now,
    };

    store.logbooks.unshift(newLogBook);

    // Save attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((att) => {
        store.attachments.push({
          id: "att-" + Math.random().toString(36).substring(2, 9),
          logBookId: logBookId,
          fileName: att.fileName,
          filePath: att.filePath,
          fileSize: att.fileSize,
          fileType: att.fileType,
          createdAt: now,
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Log book aktivitas berhasil dicatat!",
      data: { id: logBookId, status: newLogBook.status },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
