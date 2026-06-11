import { prisma } from "@/lib/prisma";
import { CHAMPIONS_TEAMS } from "@/lib/teams-data";
import { TeamShield } from "@/components/TeamShield";
import { Shield } from "lucide-react";

const GROUP_GLOW: Record<string, string> = {
  A: "#1565c0",
  B: "#7b2d8b",
  C: "#00838f",
  D: "#c2185b",
  E: "#1b5e20",
  F: "#e65100",
  G: "#4a148c",
  H: "#006064",
};

export default async function EquipsPage() {
  let dbTeams: Awaited<ReturnType<typeof prisma.team.findMany>> = [];
  try {
    dbTeams = await prisma.team.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
  } catch {
    /* BD no configurada */
  }

  const localNames = new Set(CHAMPIONS_TEAMS.map((t) => t.name));
  const matchCount = dbTeams.filter((t) => localNames.has(t.name)).length;
  const useLocalData = dbTeams.length === 0 || matchCount < CHAMPIONS_TEAMS.length * 0.5;

  const logoMap = new Map(CHAMPIONS_TEAMS.map((t) => [t.name, t.logo]));

  const teams = useLocalData
    ? CHAMPIONS_TEAMS.map((t, i) => ({
        id: String(i),
        ...t,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    : dbTeams.map((t) => ({
        ...t,
        logo: logoMap.get(t.name) ?? t.logo,
      }));

  const byGroup: Record<string, typeof teams> = {};
  for (const t of teams) {
    const g = t.group ?? "—";
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(t);
  }

  return (
    <div className="cl-page-pad" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.25rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p style={{
          fontSize: "0.68rem", color: "#00b4d8", fontWeight: "800",
          letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem",
        }}>
          UEFA Champions League 2024/25
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.4rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #1565c022, #00b4d811)", border: "1px solid #1565c033", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={20} style={{ color: "#00b4d8" }} />
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Equips participants</h1>
        </div>
        <p style={{ color: "#3a6acc", fontSize: "0.9rem" }}>
          {teams.length} clubs · 8 grups · Escuts oficials
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {Object.keys(byGroup).sort().map((group) => {
          const glow = GROUP_GLOW[group] ?? "#1565c0";
          return (
            <div key={group}>
              {/* Capçalera del grup */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                  background: `radial-gradient(circle at 40% 35%, ${glow}cc, ${glow}44)`,
                  border: `2px solid ${glow}99`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", fontWeight: "900", color: "#ffffff",
                  boxShadow: `0 0 16px ${glow}55`,
                }}>
                  {group}
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>
                    Grup {group}
                  </h2>
                  <p style={{ fontSize: "0.65rem", color: "#3a6acc", margin: 0 }}>
                    {byGroup[group].length} equips
                  </p>
                </div>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${glow}66, transparent)` }} />
              </div>

              {/* Grid d'equips — responsive amb auto-fill */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
                gap: "0.875rem",
              }}>
                {byGroup[group].map((team) => (
                  <div
                    key={team.id}
                    className="cl-card cl-card-hover"
                    style={{ padding: "1.5rem 0.875rem 1.25rem", textAlign: "center", position: "relative", overflow: "hidden" }}
                  >
                    <div style={{
                      position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)",
                      width: "90px", height: "70px",
                      background: `radial-gradient(circle, ${glow}1a 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }} />

                    <div style={{ width: "72px", height: "72px", margin: "0 auto 0.875rem", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: `1.5px solid ${glow}55`, background: `radial-gradient(circle, ${glow}0a, transparent)` }} />
                      <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff08, transparent 60%)" }} />
                      <TeamShield name={team.name} shortName={team.shortName} logo={team.logo} glow={glow} />
                    </div>

                    <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "#d0e8ff", lineHeight: 1.3, marginBottom: "3px" }}>
                      {team.name}
                    </p>
                    <p style={{ fontSize: "0.63rem", color: "#3a6acc" }}>{team.country}</p>

                    <div style={{
                      display: "inline-block", marginTop: "7px",
                      fontSize: "0.58rem", fontWeight: "900", color: "#ffffff",
                      background: `linear-gradient(135deg, ${glow}dd, ${glow}88)`,
                      border: `1px solid ${glow}66`,
                      padding: "2px 9px", borderRadius: "20px", letterSpacing: "0.06em",
                    }}>
                      GRP {group}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
