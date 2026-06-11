import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { TeamShield } from "@/components/TeamShield";
import { CHAMPIONS_TEAMS } from "@/lib/teams-data";

const FEATURED_TEAMS = CHAMPIONS_TEAMS.slice(0, 8);

export default async function HomePage() {
  let teamsCount = 0, matchesCount = 0;
  try {
    [teamsCount, matchesCount] = await Promise.all([
      prisma.team.count(),
      prisma.match.count(),
    ]);
  } catch { /* BD no configurada */ }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="cl-hero-section" style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* Imatge de fons */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/championsfondo.jpg"
            alt="Champions League background"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={90}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #0a0e2eee 0%, #0a0e2ecc 40%, #0a0e2e88 70%, #0a0e2eaa 100%)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "180px",
            background: "linear-gradient(to bottom, transparent, #0a0e2e)",
          }} />
        </div>

        {/* Contingut */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative", zIndex: 10 }}>
          <div className="cl-hero-content" style={{ display: "flex", alignItems: "center", gap: "5rem", flexWrap: "wrap", padding: "5rem 2rem" }}>

            {/* ── Text ── */}
            <div className="cl-hero-text" style={{ flex: "1 1 380px" }}>
              <p className="cl-hero-eyebrow" style={{
                fontSize: "0.68rem", fontWeight: "800",
                letterSpacing: "0.3em", color: "#00b4d8",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                Benvingut a la plataforma oficial
              </p>

              <h1 style={{
                fontSize: "clamp(1.8rem, 5vw, 4rem)",
                fontWeight: "900", lineHeight: 1.1,
                color: "#ffffff", marginBottom: "1.25rem",
              }}>
                Segueix la màxima<br />
                competició del<br />
                <span style={{
                  background: "linear-gradient(90deg, #00b4d8, #4fc3f7, #c2185b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>futbol europeu</span>
              </h1>

              <p className="cl-hero-desc" style={{
                fontSize: "1rem", color: "#7aadff",
                maxWidth: "440px", lineHeight: 1.75, marginBottom: "2.5rem",
              }}>
                Partits en directe, classificació actualitzada i tots els equips participants amb els seus escuts oficials.
              </p>

              <div className="cl-hero-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/partits" className="cl-btn-gold" style={{ fontSize: "1rem", padding: "0.8rem 2rem", borderRadius: "10px" }}>
                  ⚽ Veure Partits
                </Link>
                <Link href="/classificacio" className="cl-btn-outline" style={{ fontSize: "0.95rem", padding: "0.75rem 1.75rem", borderRadius: "10px" }}>
                  🏆 Classificació
                </Link>
              </div>

              {/* Stats */}
              <div className="cl-hero-stats" style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
                {[
                  { num: teamsCount || 32,   label: "Equips" },
                  { num: matchesCount || 125, label: "Partits" },
                  { num: 8,                   label: "Grups" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#4fc3f7", lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: "0.62rem", color: "#3a6acc", fontWeight: "700", letterSpacing: "0.1em", marginTop: "4px" }}>
                      {s.label.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Logo dreta ── */}
            <div className="cl-hero-logo" style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ filter: "drop-shadow(0 0 40px #1565c066) drop-shadow(0 0 80px #c2185b33)" }}>
                <Image
                  src="/champions-logo.png"
                  alt="UEFA Champions League"
                  width={260}
                  height={260}
                  style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUIPS DESTACATS ─────────────────────────────────────── */}
      <section className="cl-section-teams" style={{ background: "#08102a", padding: "4rem 1.25rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
          }}>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#00b4d8", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
                Participants
              </p>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#e0eaff" }}>
                Equips de la Champions
              </h2>
            </div>
            <Link href="/equips" style={{
              color: "#00b4d8", fontSize: "0.85rem", fontWeight: "700",
              textDecoration: "none", border: "1px solid #00b4d844",
              padding: "6px 16px", borderRadius: "8px",
            }}>
              Veure tots →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem" }}>
            {FEATURED_TEAMS.map((team) => (
              <Link key={team.name} href="/equips" style={{ textDecoration: "none" }}>
                <div className="cl-card cl-card-hover" style={{ padding: "1rem 0.5rem", textAlign: "center", cursor: "pointer" }}>
                  <div style={{ width: "48px", height: "48px", margin: "0 auto 0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TeamShield name={team.name} shortName={team.shortName} logo={team.logo} size={44} />
                  </div>
                  <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "#c8daff", lineHeight: 1.3, marginBottom: "2px" }}>
                    {team.shortName}
                  </p>
                  <p style={{ fontSize: "0.58rem", color: "#3a6acc" }}>{team.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="cl-section-features" style={{ background: "#0a0e2e", padding: "4rem 1.25rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: "800", color: "#e0eaff", marginBottom: "2.5rem" }}>
            Tot el que necessites
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "⚽", title: "Partits en Directe",  desc: "Resultats de totes les fases: grups, eliminatòries i gran final.", href: "/partits" },
              { icon: "🏆", title: "Classificació",        desc: "Taula automàtica amb punts, diferència de gols i classificats.",   href: "/classificacio" },
              { icon: "🛡️", title: "Equips i Escuts",      desc: "Tots els clubs amb els seus escuts, país i grup al torneig.",      href: "/equips" },
            ].map((f) => (
              <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
                <div className="cl-card cl-card-hover" style={{ padding: "1.75rem", height: "100%" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#e0eaff", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "#4a7acc", lineHeight: 1.7, marginBottom: "1rem" }}>{f.desc}</p>
                  <span style={{ fontSize: "0.78rem", color: "#00b4d8", fontWeight: "700" }}>Explorar →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
