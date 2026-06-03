import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  // Comprovar variables d'entorn de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase no configurat. Afegeix NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY a les variables d'entorn." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No s'ha proporcionat cap fitxer" }, { status: 400 });
    }

    // Validar tipus
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipus no vàlid. Usa JPG, PNG, WEBP o GIF." }, { status: 400 });
    }

    // Validar mida (5MB màxim)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El fitxer és massa gran. Màxim 5MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pujar a Supabase Storage via API REST (sense SDK per no afegir dependències)
    const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${filename}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Supabase upload error:", err);
      return NextResponse.json({ error: "Error pujant la imatge a Supabase" }, { status: 500 });
    }

    // URL pública de la imatge
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filename}`;

    // Guardar URL a la BD
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
