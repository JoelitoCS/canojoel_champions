import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().min(2).max(5),
  logo: z.string().url().nullable().optional().or(z.literal(null)),
  country: z.string().default("Europa"),
  group: z.string().max(1).nullable().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR"))
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });

  const { id } = await params;
  try {
    const body = await request.json();
    const data = teamSchema.parse(body);
    const team = await prisma.team.update({
      where: { id },
      data: { ...data, shortName: data.shortName.toUpperCase() },
    });
    return NextResponse.json(team);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Error en actualitzar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR"))
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error en eliminar" }, { status: 500 });
  }
}
