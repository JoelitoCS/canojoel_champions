import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchStage, MatchStatus } from "@prisma/client";
import { z } from "zod";

const matchSchema = z.object({
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  matchDate: z.string().datetime(),
  stage: z.nativeEnum(MatchStage).default(MatchStage.GROUP),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SCHEDULED),
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
  venue: z.string().nullable().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });

  const { id } = await params;
  try {
    const body = await request.json();
    const data = matchSchema.parse(body);
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        matchDate: new Date(data.matchDate),
        stage: data.stage,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        venue: data.venue ?? null,
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });
    return NextResponse.json(match);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Error en actualitzar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error en eliminar" }, { status: 500 });
  }
}
