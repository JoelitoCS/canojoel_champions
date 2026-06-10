import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users — Llista tots els usuaris (només ADMIN)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Error en obtenir els usuaris" }, { status: 500 });
  }
}
