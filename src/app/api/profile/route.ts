import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters").max(50).optional(),
  email: z.string().email("Email no vàlid").optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email } = parsed.data;

    // Comprovar si l'email ja existeix (si s'ha canviat)
    if (email && email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Aquest email ja està en ús" }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualitzant perfil:", error);
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
