import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/services/data-store";
import { logBookFormSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logBook = store.logbooks.find((lb) => lb.id === id);

    if (!logBook) {
      return NextResponse.json(
        { success: false, message: "Log book tidak ditemukan." },
        { status: 404 }
      );
    }

    const category = store.categories.find((c) => c.id === logBook.categoryId);
    const attachments = store.attachments.filter((a) => a.logBookId === logBook.id);

    return NextResponse.json({
      success: true,
      data: {
        ...logBook,
        category: category ? { id: category.id, name: category.name, colorHex: category.colorHex } : null,
        attachments,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logBook = store.logbooks.find((lb) => lb.id === id);

    if (!logBook) {
      return NextResponse.json(
        { success: false, message: "Log book tidak ditemukan." },
        { status: 404 }
      );
    }

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

    logBook.categoryId = data.categoryId || null;
    logBook.activityDate = data.activityDate;
    logBook.startTime = data.startTime;
    logBook.endTime = data.endTime;
    logBook.location = data.location || "Kantor / WFH";
    logBook.title = data.title;
    logBook.description = data.description;
    logBook.outputResult = data.outputResult;
    logBook.notes = data.notes || null;
    logBook.status = data.status || "COMPLETED";
    logBook.updatedAt = new Date().toISOString();

    // Replace attachments
    if (data.attachments) {
      store.attachments = store.attachments.filter((a) => a.logBookId !== logBook.id);
      data.attachments.forEach((att) => {
        store.attachments.push({
          id: att.id || "att-" + Math.random().toString(36).substring(2, 9),
          logBookId: logBook.id,
          fileName: att.fileName,
          filePath: att.filePath,
          fileSize: att.fileSize,
          fileType: att.fileType,
          createdAt: new Date().toISOString(),
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Log book berhasil diperbarui.",
      data: { id: logBook.id, status: logBook.status },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = store.logbooks.findIndex((lb) => lb.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Log book tidak ditemukan." },
        { status: 404 }
      );
    }

    store.logbooks.splice(index, 1);
    store.attachments = store.attachments.filter((a) => a.logBookId !== id);

    return NextResponse.json({
      success: true,
      message: "Log book berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
