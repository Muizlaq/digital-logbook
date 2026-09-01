import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/services/data-store";
import { categorySchema, userProfileSchema } from "@/lib/validations";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      profile: store.profile,
      categories: store.categories.filter((c) => c.isActive),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "category" or "profile"
    const body = await req.json();

    if (type === "profile") {
      const parse = userProfileSchema.safeParse(body);
      if (!parse.success) {
        return NextResponse.json({ success: false, message: "Validasi profil gagal" }, { status: 400 });
      }
      store.profile = {
        ...store.profile,
        ...parse.data,
      };
      return NextResponse.json({ success: true, message: "Profil berhasil diperbarui", data: store.profile });
    } else {
      // Add Category
      const parse = categorySchema.safeParse(body);
      if (!parse.success) {
        return NextResponse.json({ success: false, message: "Validasi kategori gagal" }, { status: 400 });
      }
      const newCat = {
        id: "cat-" + Math.random().toString(36).substring(2, 9),
        name: parse.data.name,
        description: parse.data.description || null,
        colorHex: parse.data.colorHex,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.categories.push(newCat);
      return NextResponse.json({ success: true, message: "Kategori baru berhasil ditambahkan", data: newCat });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });
    }

    const cat = store.categories.find((c) => c.id === id);
    if (!cat) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const parse = categorySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, message: "Validasi kategori gagal" }, { status: 400 });
    }

    cat.name = parse.data.name;
    cat.description = parse.data.description || null;
    cat.colorHex = parse.data.colorHex;
    cat.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, message: "Kategori berhasil diperbarui", data: cat });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });
    }

    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    store.categories.splice(index, 1);
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Error" }, { status: 500 });
  }
}
