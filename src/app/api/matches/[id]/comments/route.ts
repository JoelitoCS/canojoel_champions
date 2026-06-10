import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "El comentari no pot estar buit").max(500, "Màxim 500 caràcters"),
});

// GET /api/matches/[id]/comments — Llista comentaris del partit (pública)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const comments = await prisma.comment.findMany({
      where: { matchId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Error en obtenir els comentaris" }, { status: 500 });
  }
}

// POST /api/matches/[id]/comments — Afegir comentari (autenticat)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Has d'iniciar sessió per comentar" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { content } = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        content,
        matchId: id,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error en crear el comentari" }, { status: 500 });
  }
}

// DELETE /api/matches/[id]/comments?commentId=xxx — Eliminar comentari (owner o ADMIN)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "Falta commentId" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: "Comentari no trobat" }, { status: 404 });

  const isOwner = comment.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "No pots eliminar aquest comentari" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
