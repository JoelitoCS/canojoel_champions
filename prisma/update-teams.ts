import * as fs from "fs";
import * as path from "path";

// Cargar .env manualmente antes que Prisma lo necesite
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

import { PrismaClient } from "@prisma/client";
import { CHAMPIONS_TEAMS } from "../src/lib/teams-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Actualitzant logos i dades dels equips...\n");

  let updated = 0;
  let created = 0;

  for (const team of CHAMPIONS_TEAMS) {
    const result = await prisma.team.updateMany({
      where: { name: team.name },
      data: {
        logo: team.logo,
        shortName: team.shortName,
        country: team.country,
        group: team.group,
      },
    });

    if (result.count > 0) {
      console.log(`  ✅ ${team.name.padEnd(25)} → logo actualitzat`);
      updated++;
    } else {
      await prisma.team.create({
        data: {
          name: team.name,
          shortName: team.shortName,
          logo: team.logo,
          country: team.country,
          group: team.group,
        },
      });
      console.log(`  ➕ ${team.name.padEnd(25)} → creat de nou`);
      created++;
    }
  }

  // Eliminar equips que ja no estan a la llista
  const teamNames = CHAMPIONS_TEAMS.map((t) => t.name);
  const deleted = await prisma.team.deleteMany({
    where: { name: { notIn: teamNames } },
  });

  console.log(`\n✨ Fet! ${updated} actualitzats, ${created} creats, ${deleted.count} eliminats.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
