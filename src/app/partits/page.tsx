import { prisma } from "@/lib/prisma";
import { MatchStatus, MatchStage } from "@prisma/client";
import { TeamShield } from "@/components/TeamShield";

const statusLabel: Record<MatchStatus, string> = {
  SCHEDULED: "Programat",
  LIVE: "En Joc",
  FINISHED: "Finalitzat",
  CANCELLED: "Cancel·lat",
};

const stageLabel: Record<MatchStage, string> = {
  GROUP: "Fase de Grups",
  ROUND_OF_16: "Vuitens de Final",
  QUARTER_FINAL: "Quarts de Final",
  SEMI_FINAL: "Semifinals",
  FINAL: "Gran Final",
};

const stageOrder: Record<MatchStage, number> = {
  FINAL: 0, SEMI_FINAL: 1, QUARTER_FINAL: 2, ROUND_OF_16: 3, GROUP: 4,
};

const statusStyle: Record<MatchStatus, { bg: string; color: string; border: string }> = {
  SCHEDULED: { bg: "#1565c022", color: "#64b5f6", border: "#1565c044" },
  LIVE:      { bg: "#00e67622", color: "#00e676", border: "#00e67644" },
  FINISHED:  { bg: "#7b2d8b22", color: "#ce93d8", border: "#7b2d8b44" },
  CANCELLED: { bg: "#c2185b22", color: "#f48fb1", border: "#c2185b44" },
};

export default async function PartitsPage() {
  let matches: Awaited<ReturnType<typeof prisma.match.findMany<{
    include: { homeTeam: true; awayTeam: true }
  }>>> = [];

  try {
    matches = await prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
      orderBy: { matchDate: "desc" },
    });
  } catch { /* BD no configurada */ }

  // Agrupem per fase
  const grouped = matches.reduce((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {} as Record<string, typeof matches>);

  const sortedStages = Object.keys(grouped).sort(
    (a, b) => stageOrder[a as MatchStage] - stageOrder[b as MatchStage]
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Capçalera */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.68rem", color: "#00b4d8", fontWeight: "800", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          UEFA Champions League
        </p>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#e0eaff", marginBottom: "0.4rem" }}>
          ⚽ Partits
        </h1>
        <p style={{ color: "#3a6acc", fontSize: "0.9rem" }}>{matches.length} partits registrats</p>
      </div>

      {matches.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "5rem 2rem",
          background: "linear-gradient(135deg, #0d1a5a44, #08102844)",
          border: "1px dashed #1a3a6a", borderRadius: "16px",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ color: "#4a7acc" }}>Encara no hi ha partits registrats.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {sortedStages.map((stage) => (
            <div key={stage}>
              {/* Divisor de fase */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, #1565c044, transparent)" }} />
                <span style={{
                  fontSize: "0.65rem", fontWeight: "800", letterSpacing: "0.15em",
                  color: "#00b4d8", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {stageLabel[stage as MatchStage]}
                </span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, #1565c044, transparent)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {grouped[stage].map((match) => {
                  const ss = statusStyle[match.status];
                  const isPlayed = match.status === "FINISHED" || match.status === "LIVE";
                  return (
                    <div key={match.id} className="cl-card" style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

                        {/* Equip local */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <TeamShield
                            name={match.homeTeam.name}
                            shortName={match.homeTeam.shortName}
                            logo={match.homeTeam.logo}
                            size={44}
                          />
                          <span style={{ fontSize: "0.875rem", fontWeight: "800", color: "#c8daff", textAlign: "right" }}>
                            {match.homeTeam.name}
                          </span>
                          {isPlayed && (
                            <span style={{ fontSize: "2rem", fontWeight: "900", color: "#ffffff", lineHeight: 1 }}>
                              {match.homeScore ?? 0}
                            </span>
                          )}
                        </div>

                        {/* Centre */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", minWidth: "90px" }}>
                          {!isPlayed && (
                            <span style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1565c0" }}>VS</span>
                          )}
                          {isPlayed && (
                            <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#4a6a99" }}>—</span>
                          )}
                          <span style={{
                            fontSize: "0.6rem", fontWeight: "800", padding: "2px 8px",
                            borderRadius: "20px", letterSpacing: "0.06em", textTransform: "uppercase",
                            color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`,
                          }}>
                            {match.status === "LIVE" && "● "}{statusLabel[match.status]}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: "#2a5a99" }}>
                            {new Date(match.matchDate).toLocaleDateString("ca-ES", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                          {match.venue && (
                            <span style={{ fontSize: "0.62rem", color: "#1a4a7a", textAlign: "center" }}>
                              📍 {match.venue}
                            </span>
                          )}
                        </div>

                        {/* Equip visitant */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                          <TeamShield
                            name={match.awayTeam.name}
                            shortName={match.awayTeam.shortName}
                            logo={match.awayTeam.logo}
                            size={44}
                          />
                          <span style={{ fontSize: "0.875rem", fontWeight: "800", color: "#c8daff" }}>
                            {match.awayTeam.name}
                          </span>
                          {isPlayed && (
                            <span style={{ fontSize: "2rem", fontWeight: "900", color: "#ffffff", lineHeight: 1 }}>
                              {match.awayScore ?? 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
