import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir mínim 2 caràcters"),
  email: z.string().email("Email invàlid"),
  password: z.string().min(6, "La contrasenya ha de tenir mínim 6 caràcters"),
});

// POST /api/register — Registre d'un nou usuari (sempre rol USER)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Comprovem si l'email ja existeix
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Aquest email ja està registrat" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // sempre USER, mai ADMIN per registre públic
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error en registrar l'usuari" },
      { status: 500 }
    );
  }
}
