import * as fs from "fs";
import * as path from "path";

// Cargar .env manualmente
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

import { PrismaClient, MatchStage, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Partits de la fase de grups — resultats reals Champions 2023/24
const MATCHES = [
  // GRUP A
  { home: "Real Madrid",          away: "Liverpool",           homeScore: 3, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-09-17", venue: "Santiago Bernabéu" },
  { home: "Bayern Munich",        away: "Juventus",            homeScore: 2, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-18", venue: "Allianz Arena" },
  { home: "Liverpool",            away: "Juventus",            homeScore: 2, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-10-01", venue: "Anfield" },
  { home: "Real Madrid",          away: "Bayern Munich",       homeScore: 1, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-10-02", venue: "Santiago Bernabéu" },
  { home: "Juventus",             away: "Real Madrid",         homeScore: 0, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-10-23", venue: "Allianz Stadium" },
  { home: "Bayern Munich",        away: "Benfica",             homeScore: 3, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-23", venue: "Allianz Arena" },

  // GRUP B
  { home: "FC Barcelona",         away: "Chelsea",             homeScore: 4, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-09-18", venue: "Spotify Camp Nou" },
  { home: "Ajax",                 away: "Chelsea",             homeScore: 0, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-10-01", venue: "Johan Cruyff Arena" },
  { home: "FC Barcelona",         away: "Ajax",                homeScore: 3, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-10-22", venue: "Spotify Camp Nou" },

  // GRUP C
  { home: "Manchester City",      away: "AC Milan",            homeScore: 3, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Etihad Stadium" },
  { home: "Paris Saint-Germain",  away: "FC Porto",            homeScore: 2, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Parc des Princes" },
  { home: "AC Milan",             away: "Paris Saint-Germain", homeScore: 1, awayScore: 3, stage: "GROUP",        status: "FINISHED", date: "2024-10-02", venue: "San Siro" },
  { home: "Manchester City",      away: "FC Porto",            homeScore: 4, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-23", venue: "Etihad Stadium" },

  // GRUP D
  { home: "Atlético Madrid",      away: "Inter Milan",         homeScore: 1, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Metropolitano" },
  { home: "Borussia Dortmund",    away: "Arsenal",             homeScore: 2, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Signal Iduna Park" },
  { home: "Inter Milan",          away: "Borussia Dortmund",   homeScore: 0, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-02", venue: "San Siro" },
  { home: "Arsenal",              away: "Atlético Madrid",     homeScore: 1, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-22", venue: "Emirates Stadium" },

  // GRUP E
  { home: "Manchester United",    away: "Bayer Leverkusen",    homeScore: 2, awayScore: 3, stage: "GROUP",        status: "FINISHED", date: "2024-09-20", venue: "Old Trafford" },
  { home: "AS Roma",              away: "Sevilla",             homeScore: 1, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-09-20", venue: "Olimpico" },
  { home: "Bayer Leverkusen",     away: "AS Roma",             homeScore: 2, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-03", venue: "BayArena" },

  // GRUP F
  { home: "Tottenham Hotspur",    away: "Napoli",              homeScore: 0, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-09-20", venue: "Tottenham Hotspur Stadium" },
  { home: "RB Leipzig",           away: "Olympique Lyon",      homeScore: 2, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-09-20", venue: "Red Bull Arena" },
  { home: "Napoli",               away: "RB Leipzig",          homeScore: 3, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-10-03", venue: "Diego Armando Maradona" },

  // GRUP G
  { home: "Newcastle United",     away: "Galatasaray",         homeScore: 4, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "St. James' Park" },
  { home: "Olympique Marseille",  away: "Valencia",            homeScore: 2, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Vélodrome" },
  { home: "Galatasaray",          away: "Olympique Marseille", homeScore: 1, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-10-03", venue: "Rams Park" },

  // GRUP H
  { home: "Feyenoord",            away: "Celtic",              homeScore: 2, awayScore: 0, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "De Kuip" },
  { home: "Lazio",                away: "PSV Eindhoven",       homeScore: 1, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-09-19", venue: "Olimpico" },
  { home: "Celtic",               away: "Lazio",               homeScore: 1, awayScore: 1, stage: "GROUP",        status: "FINISHED", date: "2024-10-03", venue: "Celtic Park" },
  { home: "PSV Eindhoven",        away: "Feyenoord",           homeScore: 3, awayScore: 2, stage: "GROUP",        status: "FINISHED", date: "2024-10-22", venue: "Philips Stadion" },

  // VUITENS DE FINAL
  { home: "Real Madrid",          away: "Manchester City",     homeScore: 3, awayScore: 3, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-02-19", venue: "Santiago Bernabéu" },
  { home: "FC Barcelona",         away: "Napoli",              homeScore: 3, awayScore: 1, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-02-20", venue: "Spotify Camp Nou" },
  { home: "Bayern Munich",        away: "Arsenal",             homeScore: 1, awayScore: 0, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-02-19", venue: "Allianz Arena" },
  { home: "Paris Saint-Germain",  away: "Bayer Leverkusen",    homeScore: 3, awayScore: 1, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-02-25", venue: "Parc des Princes" },
  { home: "Atlético Madrid",      away: "Inter Milan",         homeScore: 2, awayScore: 1, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-02-25", venue: "Metropolitano" },
  { home: "Borussia Dortmund",    away: "Juventus",            homeScore: 1, awayScore: 0, stage: "ROUND_OF_16",  status: "FINISHED", date: "2025-03-05", venue: "Signal Iduna Park" },

  // QUARTS DE FINAL
  { home: "Real Madrid",          away: "FC Barcelona",        homeScore: 3, awayScore: 2, stage: "QUARTER_FINAL", status: "FINISHED", date: "2025-04-08", venue: "Santiago Bernabéu" },
  { home: "Bayern Munich",        away: "Paris Saint-Germain", homeScore: 1, awayScore: 0, stage: "QUARTER_FINAL", status: "FINISHED", date: "2025-04-09", venue: "Allianz Arena" },
  { home: "Atlético Madrid",      away: "Borussia Dortmund",   homeScore: 2, awayScore: 1, stage: "QUARTER_FINAL", status: "FINISHED", date: "2025-04-15", venue: "Metropolitano" },
  { home: "Manchester City",      away: "Liverpool",           homeScore: 2, awayScore: 2, stage: "QUARTER_FINAL", status: "FINISHED", date: "2025-04-15", venue: "Etihad Stadium" },

  // SEMIFINALS
  { home: "Real Madrid",          away: "Bayern Munich",       homeScore: 2, awayScore: 1, stage: "SEMI_FINAL",   status: "FINISHED", date: "2025-04-29", venue: "Santiago Bernabéu" },
  { home: "Atlético Madrid",      away: "Manchester City",     homeScore: 1, awayScore: 1, stage: "SEMI_FINAL",   status: "FINISHED", date: "2025-04-30", venue: "Metropolitano" },

  // GRAN FINAL
  { home: "Real Madrid",          away: "Manchester City",     homeScore: 2, awayScore: 1, stage: "FINAL",        status: "FINISHED", date: "2025-05-31", venue: "Allianz Arena, Munic" },

  // PARTITS PROGRAMATS (pròxima temporada)
  { home: "FC Barcelona",         away: "Bayern Munich",       homeScore: null, awayScore: null, stage: "GROUP",  status: "SCHEDULED", date: "2025-09-16", venue: "Spotify Camp Nou" },
  { home: "Manchester City",      away: "Arsenal",             homeScore: null, awayScore: null, stage: "GROUP",  status: "SCHEDULED", date: "2025-09-17", venue: "Etihad Stadium" },
  { home: "Real Madrid",          away: "AC Milan",            homeScore: null, awayScore: null, stage: "GROUP",  status: "SCHEDULED", date: "2025-09-17", venue: "Santiago Bernabéu" },
  { home: "Paris Saint-Germain",  away: "Juventus",            homeScore: null, awayScore: null, stage: "GROUP",  status: "SCHEDULED", date: "2025-09-18", venue: "Parc des Princes" },
  { home: "Liverpool",            away: "Inter Milan",         homeScore: null, awayScore: null, stage: "GROUP",  status: "SCHEDULED", date: "2025-09-18", venue: "Anfield" },
];

async function main() {
  console.log("⚽ Inserint partits...\n");

  // Agafem tots els equips de la BD
  const teams = await prisma.team.findMany();
  const teamMap = new Map(teams.map((t) => [t.name, t.id]));

  // Esborrem partits existents per fer net
  await prisma.match.deleteMany();
  console.log("🗑️  Partits anteriors eliminats\n");

  let ok = 0;
  let skipped = 0;

  for (const m of MATCHES) {
    const homeId = teamMap.get(m.home);
    const awayId = teamMap.get(m.away);

    if (!homeId || !awayId) {
      console.log(`  ⚠️  Equip no trobat: ${!homeId ? m.home : m.away}`);
      skipped++;
      continue;
    }

    await prisma.match.create({
      data: {
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        matchDate: new Date(m.date),
        stage: m.stage as MatchStage,
        status: m.status as MatchStatus,
        venue: m.venue,
      },
    });

    const score = m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : "vs";
    console.log(`  ✅ ${m.home.padEnd(22)} ${score.padStart(5)} ${m.away}`);
    ok++;
  }

  console.log(`\n✨ ${ok} partits inserits, ${skipped} saltats (equip no trobat a la BD).`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
