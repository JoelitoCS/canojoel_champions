import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir mínim 2 caràcters"),
  shortName: z.string().min(2).max(5, "L'abreviatura ha de tenir màxim 5 caràcters"),
  logo: z.string().url().optional().or(z.literal("")),
  country: z.string().default("Europa"),
  group: z.string().max(1).optional().or(z.literal("")),
});

// GET /api/teams — Llista tots els equips (pública)
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json(
      { error: "Error en obtenir els equips" },
      { status: 500 }
    );
  }
}

// POST /api/teams — Crea un equip (només ADMIN)
export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = teamSchema.parse(body);

    const team = await prisma.team.create({
      data: {
        name: data.name,
        shortName: data.shortName.toUpperCase(),
        logo: data.logo || null,
        country: data.country,
        group: data.group || null,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error en crear l'equip" },
      { status: 500 }
    );
  }
}
