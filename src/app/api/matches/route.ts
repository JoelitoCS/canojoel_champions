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
  venue: z.string().optional().or(z.literal("")),
}).refine((d) => d.homeTeamId !== d.awayTeamId, {
  message: "L'equip local i el visitant no poden ser el mateix",
});

// GET /api/matches — Llista tots els partits (pública)
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
      orderBy: { matchDate: "desc" },
    });
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Error en obtenir els partits" },
      { status: 500 }
    );
  }
}

// POST /api/matches — Crea un partit (només ADMIN)
export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = matchSchema.parse(body);

    const match = await prisma.match.create({
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        matchDate: new Date(data.matchDate),
        stage: data.stage,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        venue: data.venue || null,
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error en crear el partit" },
      { status: 500 }
    );
  }
}
