import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["USER", "EDITOR", "ADMIN"]),
});

// PATCH /api/users/[id] — Canvia el rol d'un usuari (només ADMIN)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  const { id } = await params;

  // No es pot canviar el propi rol
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "No pots canviar el teu propi rol" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role } = roleSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Error en actualitzar el rol" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — Elimina un usuari (només ADMIN)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "No pots eliminar el teu propi compte" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error en eliminar l'usuari" }, { status: 500 });
  }
}
