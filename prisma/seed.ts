import { PrismaClient } from "@prisma/client";
import { CHAMPIONS_TEAMS } from "../src/lib/teams-data";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function main() {
  console.log("🌱 Seeding Champions League...\n");

  // ── 1. Esborrem tot ──────────────────────────────────────────────
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Totes les taules buidades\n");

  // ── 2. Creem l'admin ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      id: generateId(),
      name: "Administrador",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("👤 Admin creat: admin@admin.com / admin123\n");

  // ── 3. Inserim els 32 equips ─────────────────────────────────────
  console.log("⚽ Inserint equips...\n");
  for (const team of CHAMPIONS_TEAMS) {
    await prisma.team.create({
      data: {
        id: generateId(),
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        country: team.country,
        group: team.group,
      },
    });
    console.log(`  ✅ ${team.name.padEnd(25)} | Grup ${team.group} | ${team.shortName}`);
  }

  console.log(`\n✨ Seed completat! 32 equips + 1 admin inserits.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
