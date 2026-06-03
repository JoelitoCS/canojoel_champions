"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    { href: "/",              label: "Inici" },
    { href: "/partits",       label: "Partits" },
    { href: "/classificacio", label: "Classificació" },
    { href: "/equips",        label: "Equips" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header style={{
      background: "linear-gradient(180deg, #04061acc 0%, #0a0e2ecc 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid #ffffff11",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Franja de color superior */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg, #c2185b, #7b2d8b, #1565c0, #00b4d8, #1565c0, #7b2d8b, #c2185b)",
      }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>

          {/* ── Logo oficial Champions ── */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <Image
              src="/champions-logo.png"
              alt="UEFA Champions League"
              width={48}
              height={48}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)", height: "48px", width: "auto" }}
              priority
            />
          </Link>

          {/* ── Links de navegació ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: active ? "800" : "500",
                  color: active ? "#ffffff" : "#8ab4e8",
                  background: active ? "#1565c033" : "transparent",
                  border: active ? "1px solid #1565c055" : "1px solid transparent",
                  transition: "all 0.15s",
                  textDecoration: "none",
                }}>
                  {link.label === "Admin" ? "⚙ Admin" : link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Auth ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {session ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hidden md:flex">
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #1565c0, #00b4d8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: "800", color: "#fff", flexShrink: 0,
                  }}>
                    {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#6a9acc", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user?.name ?? session.user?.email}
                  </span>
                  {isAdmin && (
                    <span style={{
                      fontSize: "0.58rem",
                      background: "linear-gradient(135deg, #c89b3c, #e8c060)",
                      color: "#001030", padding: "2px 7px", borderRadius: "4px",
                      fontWeight: "900", letterSpacing: "0.05em", flexShrink: 0,
                    }}>ADMIN</span>
                  )}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    background: "transparent", border: "1px solid #1a3a6a",
                    color: "#6a9acc", padding: "0.35rem 0.9rem",
                    borderRadius: "8px", fontSize: "0.8rem",
                    fontWeight: "600", cursor: "pointer",
                  }}
                >
                  Sortir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ fontSize: "0.85rem", color: "#6a9acc", textDecoration: "none", padding: "0.35rem 0.8rem" }}>
                  Entrar
                </Link>
                <Link href="/auth/register" className="cl-btn-gold" style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem", borderRadius: "8px" }}>
                  Registrar-se
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
