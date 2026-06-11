import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Swords, Users, Settings, Eye, Trophy } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/no-autoritzat");

  let teamsCount = 0, matchesCount = 0, usersCount = 0;
  try {
    [teamsCount, matchesCount, usersCount] = await Promise.all([
      prisma.team.count(),
      prisma.match.count(),
      prisma.user.count(),
    ]);
  } catch { /* BD no configurada */ }

  const statCards = [
    { label: "Equips",  value: teamsCount,  Icon: Shield,  href: "/admin/equips",  color: "#003a8c" },
    { label: "Partits", value: matchesCount, Icon: Swords,  href: "/admin/partits", color: "#003a1a" },
    { label: "Usuaris", value: usersCount,   Icon: Users,   href: "/admin/usuaris", color: "#2a003a" },
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Capçalera */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Panel d&apos;Administració
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.25rem" }}>
          <Settings size={24} style={{ color: "#c89b3c" }} />
          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>
            Benvingut, {session.user.name ?? "Admin"}
          </h1>
        </div>
        <p style={{ color: "#4a7acc", fontSize: "0.9rem" }}>Gestiona la plataforma Champions League</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            style={{
              display: "block", textDecoration: "none",
              background: `linear-gradient(135deg, ${s.color}cc, #001030cc)`,
              border: "1px solid #1a3a6a44",
              borderRadius: "14px", padding: "1.5rem",
              transition: "all 0.2s",
            }}
            className="cl-card-hover"
          >
            <div style={{ marginBottom: "0.75rem" }}><s.Icon size={28} style={{ color: "#7aadff" }} /></div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#e8c060", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#6a9acc", marginTop: "4px", fontWeight: "600" }}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Accions ràpides */}
      <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#7aadff", marginBottom: "1rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Accions ràpides
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {[
          { href: "/admin/equips",    Icon: Shield,  title: "Gestionar Equips",            desc: "Afegir, editar i eliminar equips participants" },
          { href: "/admin/partits",   Icon: Swords,  title: "Gestionar Partits",            desc: "Crear partits i introduir resultats" },
          { href: "/admin/usuaris",   Icon: Users,   title: "Gestionar Usuaris",            desc: "Canviar rols i eliminar comptes d'usuaris" },
          { href: "/equips",          Icon: Eye,     title: "Vista pública equips",          desc: "Com veu l'usuari la pàgina d'equips" },
          { href: "/classificacio",   Icon: Trophy,  title: "Vista pública classificació",   desc: "Verificar la taula de classificació" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex", alignItems: "flex-start", gap: "1rem",
              background: "linear-gradient(135deg, #001a4a88, #001028aa)",
              border: "1px solid #1a3a6a44",
              borderRadius: "12px", padding: "1.25rem",
              textDecoration: "none", transition: "all 0.2s",
            }}
            className="cl-card-hover"
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #1565c022, #00b4d811)", border: "1px solid #1565c033", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.Icon size={18} style={{ color: "#00b4d8" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "#c8daff", marginBottom: "4px" }}>{item.title}</p>
              <p style={{ fontSize: "0.78rem", color: "#3a6acc", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
