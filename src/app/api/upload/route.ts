import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    // Limit 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file melebihi batas maksimal 5 MB." },
        { status: 400 }
      );
    }

    // Allowed extensions / types: pdf, jpg, png, docx, xlsx, zip
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf|docx|xlsx|zip)$/i)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Harap upload gambar (JPG/PNG), PDF, DOCX, atau XLSX." },
        { status: 400 }
      );
    }

    const uniqueId = "file-" + Math.random().toString(36).substring(2, 10);
    const mockFilePath = `/uploads/${uniqueId}_${file.name.replace(/\s+/g, "_")}`;

    return NextResponse.json({
      success: true,
      message: "File berhasil diunggah",
      data: {
        id: uniqueId,
        fileName: file.name,
        filePath: mockFilePath,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengunggah file" },
      { status: 500 }
    );
  }
}
