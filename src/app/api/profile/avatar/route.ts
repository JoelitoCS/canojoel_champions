import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No s'ha proporcionat cap fitxer" }, { status: 400 });
    }

    // Validar tipus de fitxer
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipus de fitxer no vàlid. Usa JPG, PNG, WEBP o GIF." }, { status: 400 });
    }

    // Validar mida (màxim 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El fitxer és massa gran. Màxim 5MB." }, { status: 400 });
    }

    // Crear directori si no existeix
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nom únic per evitar col·lisions
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `avatar-${session.user.id}-${Date.now()}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Escriure el fitxer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // URL pública de la imatge
    const imageUrl = `/uploads/avatars/${filename}`;

    // Actualitzar la imatge a la base de dades
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error pujant avatar:", error);
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
