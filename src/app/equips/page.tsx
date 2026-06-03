import { prisma } from "@/lib/prisma";
import { CHAMPIONS_TEAMS } from "@/lib/teams-data";
import { TeamShield } from "@/components/TeamShield";

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

  // Noms dels equips actuals al fitxer local
  const localNames = new Set(CHAMPIONS_TEAMS.map((t) => t.name));

  // Comptem quants equips de la BD coincideixen amb els locals
  const matchCount = dbTeams.filter((t) => localNames.has(t.name)).length;

  // Si menys del 50% coincideixen, la BD té dades velles → usem sempre el fitxer local
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
        // Logo del fitxer local sempre prioritari
        logo: logoMap.get(t.name) ?? t.logo,
      }));

  // Agrupem per grup
  const byGroup: Record<string, typeof teams> = {};
  for (const t of teams) {
    const g = t.group ?? "—";
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(t);
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{
          fontSize: "0.68rem", color: "#00b4d8", fontWeight: "800",
          letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem",
        }}>
          UEFA Champions League 2024/25
        </p>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#e0eaff", marginBottom: "0.4rem" }}>
          🛡️ Equips participants
        </h1>
        <p style={{ color: "#3a6acc", fontSize: "0.9rem" }}>
          {teams.length} clubs · 8 grups · Escuts oficials
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
        {Object.keys(byGroup).sort().map((group) => {
          const glow = GROUP_GLOW[group] ?? "#1565c0";
          return (
            <div key={group}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                  background: `radial-gradient(circle at 40% 35%, ${glow}cc, ${glow}44)`,
                  border: `2px solid ${glow}99`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: "900", color: "#ffffff",
                  boxShadow: `0 0 18px ${glow}55`,
                }}>
                  {group}
                </div>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>
                    Grup {group}
                  </h2>
                  <p style={{ fontSize: "0.68rem", color: "#3a6acc", margin: 0 }}>
                    {byGroup[group].length} equips
                  </p>
                </div>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${glow}66, transparent)` }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                {byGroup[group].map((team) => (
                  <div
                    key={team.id}
                    className="cl-card cl-card-hover"
                    style={{ padding: "1.75rem 1rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}
                  >
                    <div style={{
                      position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)",
                      width: "100px", height: "80px",
                      background: `radial-gradient(circle, ${glow}1a 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }} />

                    <div style={{ width: "80px", height: "80px", margin: "0 auto 1rem", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: `1.5px solid ${glow}55`, background: `radial-gradient(circle, ${glow}0a, transparent)` }} />
                      <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff08, transparent 60%)" }} />
                      <TeamShield name={team.name} shortName={team.shortName} logo={team.logo} glow={glow} />
                    </div>

                    <p style={{ fontSize: "0.85rem", fontWeight: "800", color: "#d0e8ff", lineHeight: 1.3, marginBottom: "4px" }}>
                      {team.name}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "#3a6acc" }}>{team.country}</p>

                    <div style={{
                      display: "inline-block", marginTop: "8px",
                      fontSize: "0.6rem", fontWeight: "900", color: "#ffffff",
                      background: `linear-gradient(135deg, ${glow}dd, ${glow}88)`,
                      border: `1px solid ${glow}66`,
                      padding: "2px 10px", borderRadius: "20px", letterSpacing: "0.06em",
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
