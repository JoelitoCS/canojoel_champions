import { prisma } from "@/lib/prisma";
import { CHAMPIONS_TEAMS } from "@/lib/teams-data";
import { Trophy, BarChart2 } from "lucide-react";

type TeamStats = {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  country: string;
  group: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type MatchRow = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
};

async function getStandings(): Promise<TeamStats[]> {
  const localLogoMap = new Map(CHAMPIONS_TEAMS.map((team) => [team.name, team.logo]));
  let teams: { id: string; name: string; shortName: string; logo: string | null; country: string; group: string | null }[] = [];
  let matches: MatchRow[] = [];

  try {
    [teams, matches] = await Promise.all([
      prisma.team.findMany({
        select: { id: true, name: true, shortName: true, logo: true, country: true, group: true },
        orderBy: { name: "asc" },
      }),
      prisma.match.findMany({
        where: { status: "FINISHED" },
        select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
      }),
    ]);
  } catch {
    return [];
  }

  teams = teams.map((team) => ({
    ...team,
    logo: localLogoMap.get(team.name) ?? team.logo,
  }));

  const stats = new Map<string, TeamStats>();
  for (const team of teams) {
    stats.set(team.id, {
      ...team,
      played: 0, won: 0, drawn: 0, lost: 0,
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

    if (match.homeScore > match.awayScore) {
      home.won++; home.points += 3; away.lost++;
    } else if (match.homeScore < match.awayScore) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; home.points += 1;
      away.drawn++; away.points += 1;
    }
  }

  return Array.from(stats.values())
    .map((t) => ({ ...t, goalDifference: t.goalsFor - t.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
}

export default async function ClassificacioPage() {
  const standings = await getStandings();

  return (
    <div className="cl-page-pad" style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <p style={{ fontSize: "0.68rem", color: "#00b4d8", fontWeight: "800", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        UEFA Champions League
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #c89b3c22, #e8c06011)", border: "1px solid #c89b3c33", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={20} style={{ color: "#c89b3c" }} />
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Classificació</h1>
      </div>
      <p style={{ color: "#4a7acc", fontSize: "0.9rem", marginBottom: "2rem" }}>
        {standings.length} equips · Actualitzat automàticament
      </p>

      {standings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1.5rem", background: "linear-gradient(135deg, #0d1a5a44, #08102844)", border: "1px dashed #1a3a6a", borderRadius: "16px" }}>
          <BarChart2 size={48} style={{ color: "#1a3a6a", margin: "0 auto 1rem" }} />
          <p style={{ color: "#4a7acc" }}>La classificació apareixerà quan hi hagi partits finalitzats.</p>
        </div>
      ) : (
        <div className="cl-card" style={{ overflow: "hidden" }}>
          {/* Wrapper scrollable horitzontal en mòbil */}
          <div className="cl-table-scroll">
            <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "36px" }}>#</th>
                  <th style={{ textAlign: "left" }}>Equip</th>
                  <th>PJ</th>
                  <th className="cl-col-hide-mobile">G</th>
                  <th className="cl-col-hide-mobile">E</th>
                  <th className="cl-col-hide-mobile">P</th>
                  <th className="cl-col-hide-mobile">GF</th>
                  <th className="cl-col-hide-mobile">GC</th>
                  <th>DG</th>
                  <th style={{ color: "#e8c060" }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, idx) => (
                  <tr key={team.id} className={idx < 8 ? "qualify-zone" : ""}>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "22px", height: "22px", borderRadius: "5px",
                        background: idx < 8 ? "linear-gradient(135deg, #1565c0, #00b4d8)" : "transparent",
                        fontSize: "0.72rem", fontWeight: "700",
                        color: idx < 8 ? "#ffffff" : "#4a6a99",
                      }}>{idx + 1}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} style={{ width: "24px", height: "24px", objectFit: "contain", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0d1a5a", border: "1px solid #1a4a88", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: "800", color: "#4a7acc", flexShrink: 0 }}>
                            {team.shortName.slice(0, 2)}
                          </div>
                        )}
                        <span style={{ fontWeight: "700", color: "#c8daff", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          {team.shortName}
                        </span>
                        {team.group && (
                          <span style={{ fontSize: "0.58rem", background: "#0d1a5a", color: "#3a6acc", border: "1px solid #1a3a6a", padding: "1px 4px", borderRadius: "4px", fontWeight: "600" }}>
                            G{team.group}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.82rem" }}>{team.played}</td>
                    <td className="cl-col-hide-mobile" style={{ textAlign: "center", color: "#4daa66", fontWeight: "700", fontSize: "0.82rem" }}>{team.won}</td>
                    <td className="cl-col-hide-mobile" style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.82rem" }}>{team.drawn}</td>
                    <td className="cl-col-hide-mobile" style={{ textAlign: "center", color: "#cc5555", fontSize: "0.82rem" }}>{team.lost}</td>
                    <td className="cl-col-hide-mobile" style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.82rem" }}>{team.goalsFor}</td>
                    <td className="cl-col-hide-mobile" style={{ textAlign: "center", color: "#6a9acc", fontSize: "0.82rem" }}>{team.goalsAgainst}</td>
                    <td style={{ textAlign: "center", color: team.goalDifference >= 0 ? "#4daa66" : "#cc5555", fontWeight: "700", fontSize: "0.82rem" }}>
                      {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: idx < 8 ? "#e8c060" : "#8ab4e8" }}>
                        {team.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #1a3a6a22" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "3px", height: "14px", background: "linear-gradient(135deg, #1565c0, #00b4d8)", borderRadius: "2px" }} />
              <span style={{ fontSize: "0.7rem", color: "#4a7acc" }}>Classificats per vuitens de final</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
