import { prisma } from "@/lib/prisma";
import { TeamWithStats } from "@/types";

async function getStandings(): Promise<TeamWithStats[]> {
  let teams: Awaited<ReturnType<typeof prisma.team.findMany>> = [];
  let matches: Awaited<ReturnType<typeof prisma.match.findMany<{ include: { homeTeam: true; awayTeam: true } }>>> = [];
  try {
    [teams, matches] = await Promise.all([
      prisma.team.findMany({ orderBy: { name: "asc" } }),
      prisma.match.findMany({
        where: { status: "FINISHED" },
        include: { homeTeam: true, awayTeam: true },
      }),
    ]);
  } catch { return []; }

  const stats = new Map<string, TeamWithStats>();
  for (const team of teams) {
    stats.set(team.id, {
      ...team, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    });
  }

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    const home = stats.get(match.homeTeamId);
    const away = stats.get(match.awayTeamId);
    if (!home || !away) continue;
    home.played++; away.played++;
    home.goalsFor += match.homeScore; home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore; away.goalsAgainst += match.homeScore;
    if (match.homeScore > match.awayScore) { home.won++; home.points += 3; away.lost++; }
    else if (match.homeScore < match.awayScore) { away.won++; away.points += 3; home.lost++; }
    else { home.drawn++; home.points += 1; away.drawn++; away.points += 1; }
  }

  return Array.from(stats.values())
    .map((t) => ({ ...t, goalDifference: t.goalsFor - t.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
}

export default async function ClassificacioPage() {
  const standings = await getStandings();

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        UEFA Champions League
      </p>
      <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#e0eaff", marginBottom: "0.5rem" }}>🏆 Classificació</h1>
      <p style={{ color: "#4a7acc", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
        {standings.length} equips · Actualitzat automàticament
      </p>

      {standings.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "5rem 2rem",
          background: "linear-gradient(135deg, #001a4a88, #00102888)",
          border: "1px dashed #1a3a6a", borderRadius: "16px",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <p style={{ color: "#4a7acc" }}>La classificació apareixerà quan hi hagi partits finalitzats.</p>
        </div>
      ) : (
        <div className="cl-card" style={{ overflow: "hidden" }}>
          <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: "40px" }}>#</th>
                <th style={{ textAlign: "left" }}>Equip</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th className="hidden md:table-cell">GF</th>
                <th className="hidden md:table-cell">GC</th>
                <th>DG</th>
                <th style={{ color: "#e8c060" }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => (
                <tr
                  key={team.id}
                  className={idx < 8 ? "qualify-zone" : ""}
                  style={{ transition: "background 0.15s" }}
                >
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "24px", height: "24px", borderRadius: "6px",
                      background: idx < 8 ? "linear-gradient(135deg, #002255, #003a8c)" : "transparent",
                      fontSize: "0.75rem", fontWeight: "700",
                      color: idx < 8 ? "#7aadff" : "#4a6a99",
                    }}>{idx + 1}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                      ) : (
                        <div style={{
                          width: "24px", height: "24px", borderRadius: "50%",
                          background: "#002255", border: "1px solid #1a4a88",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.5rem", fontWeight: "800", color: "#4a7acc",
                        }}>{team.shortName.slice(0, 2)}</div>
                      )}
                      <span style={{ fontWeight: "700", color: "#c8daff", fontSize: "0.875rem" }}>{team.name}</span>
                      {team.group && (
                        <span style={{
                          fontSize: "0.6rem", background: "#001a4a", color: "#3a6acc",
                          border: "1px solid #1a3a6a", padding: "1px 5px", borderRadius: "4px", fontWeight: "600",
                        }}>G{team.group}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.875rem" }}>{team.played}</td>
                  <td style={{ textAlign: "center", color: "#4daa66", fontWeight: "700", fontSize: "0.875rem" }}>{team.won}</td>
                  <td style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.875rem" }}>{team.drawn}</td>
                  <td style={{ textAlign: "center", color: "#cc5555", fontSize: "0.875rem" }}>{team.lost}</td>
                  <td style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.875rem" }} className="hidden md:table-cell">{team.goalsFor}</td>
                  <td style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.875rem" }} className="hidden md:table-cell">{team.goalsAgainst}</td>
                  <td style={{ textAlign: "center", color: team.goalDifference >= 0 ? "#4daa66" : "#cc5555", fontWeight: "700", fontSize: "0.875rem" }}>
                    {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      fontWeight: "900", fontSize: "1rem",
                      color: idx < 8 ? "#e8c060" : "#8ab4e8",
                    }}>{team.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Llegenda */}
          <div style={{ display: "flex", gap: "1.5rem", padding: "1rem 1.5rem", borderTop: "1px solid #1a3a6a22", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", background: "linear-gradient(135deg, #002255, #003a8c)", borderRadius: "2px", borderLeft: "3px solid #c89b3c" }} />
              <span style={{ fontSize: "0.75rem", color: "#4a7acc" }}>Classificats per vuitens de final</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
