import { PrismaClient } from "@prisma/client";
import { CHAMPIONS_TEAMS } from "../src/lib/teams-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Champions League teams...");

  // Netegem primer
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  // Inserim els equips (filtrem duplicats per shortName)
  const seen = new Set<string>();
  for (const team of CHAMPIONS_TEAMS) {
    if (seen.has(team.shortName + team.group)) continue;
    seen.add(team.shortName + team.group);
    await prisma.team.create({ data: team });
    console.log(`  ✅ ${team.name} (Grup ${team.group})`);
  }

  console.log("\n✨ Seed completat!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
