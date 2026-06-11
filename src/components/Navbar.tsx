"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Home, Swords, Trophy, Shield, Settings, PenLine, LogIn, LogOut, UserCircle } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEditor = session?.user?.role === "EDITOR";
  const [menuOpen, setMenuOpen] = useState(false);

  // Tanca el menú quan canvia la ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Evita scroll del body quan el menú és obert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "/",              label: "Inici",         Icon: Home },
    { href: "/partits",       label: "Partits",        Icon: Swords },
    { href: "/classificacio", label: "Classificació",  Icon: Trophy },
    { href: "/equips",        label: "Equips",         Icon: Shield },
    ...(isAdmin  ? [{ href: "/admin",  label: "Admin",  Icon: Settings }] : []),
    ...(isEditor ? [{ href: "/editor", label: "Editor", Icon: PenLine }] : []),
  ];

  const userImage = session?.user?.image ?? null;
  const initials  = (session?.user?.name ?? session?.user?.email ?? "U")[0].toUpperCase();

  return (
    <>
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

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>

            {/* ── Logo ── */}
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
              <Image
                src="/champions-logo.png"
                alt="UEFA Champions League"
                width={44}
                height={44}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)", height: "44px", width: "auto" }}
                priority
              />
            </Link>

            {/* ── Nav desktop (md+) ── */}
            <nav className="cl-nav-desktop">
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
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Auth desktop (md+) ── */}
            <div className="cl-auth-desktop">
              {session ? (
                <>
                  <Link
                    href="/perfil"
                    style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
                  >
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: userImage ? "transparent" : "linear-gradient(135deg, #1565c0, #00b4d8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: "800", color: "#fff",
                      flexShrink: 0, overflow: "hidden", position: "relative",
                      border: "2px solid #1a4a8855",
                    }}>
                      {userImage ? (
                        <Image src={userImage} alt="Avatar" fill style={{ objectFit: "cover" }} sizes="32px" />
                      ) : initials}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#6a9acc", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.name ?? session.user?.email}
                    </span>
                    {isAdmin && (
                      <span style={{ fontSize: "0.58rem", background: "linear-gradient(135deg, #c89b3c, #e8c060)", color: "#001030", padding: "2px 7px", borderRadius: "4px", fontWeight: "900", letterSpacing: "0.05em", flexShrink: 0 }}>
                        ADMIN
                      </span>
                    )}
                    {isEditor && (
                      <span style={{ fontSize: "0.58rem", background: "linear-gradient(135deg, #006080, #00b4d8)", color: "#fff", padding: "2px 7px", borderRadius: "4px", fontWeight: "900", letterSpacing: "0.05em", flexShrink: 0 }}>
                        EDITOR
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{ background: "transparent", border: "1px solid #1a3a6a", color: "#6a9acc", padding: "0.35rem 0.9rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <LogOut size={13} />
                    Sortir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" style={{ fontSize: "0.85rem", color: "#6a9acc", textDecoration: "none", padding: "0.35rem 0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    <LogIn size={14} />
                    Iniciar sessió
                  </Link>
                  <Link href="/auth/register" className="cl-btn-gold" style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem", borderRadius: "8px" }}>
                    Registrar-se
                  </Link>
                </>
              )}
            </div>

            {/* ── Botó hamburguesa (mòbil) ── */}
            <button
              className="cl-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Obrir menú"
              aria-expanded={menuOpen}
            >
              <span className={`cl-ham-line ${menuOpen ? "cl-ham-line--top-open" : ""}`} />
              <span className={`cl-ham-line ${menuOpen ? "cl-ham-line--mid-open" : ""}`} />
              <span className={`cl-ham-line ${menuOpen ? "cl-ham-line--bot-open" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay fosc ── */}
      {menuOpen && (
        <div
          className="cl-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Drawer mòbil ── */}
      <div className={`cl-mobile-menu ${menuOpen ? "cl-mobile-menu--open" : ""}`}>
        {/* Capçalera del drawer */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #1a3a6a44",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Image
            src="/champions-logo.png"
            alt="UEFA Champions League"
            width={36}
            height={36}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: "none", border: "none", color: "#6a9acc", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }}
            aria-label="Tancar menú"
          >
            ×
          </button>
        </div>

        {/* Usuari (si hi ha sessió) */}
        {session && (
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #1a3a6a33" }}>
            <Link href="/perfil" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: userImage ? "transparent" : "linear-gradient(135deg, #1565c0, #00b4d8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", fontWeight: "800", color: "#fff",
                flexShrink: 0, overflow: "hidden", position: "relative",
                border: "2px solid #1a4a8855",
              }}>
                {userImage ? (
                  <Image src={userImage} alt="Avatar" fill style={{ objectFit: "cover" }} sizes="40px" />
                ) : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "700", color: "#c8daff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user?.name ?? session.user?.email}
                </p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#4a7acc" }}>Veure perfil →</p>
              </div>
              {isAdmin && (
                <span style={{ fontSize: "0.58rem", background: "linear-gradient(135deg, #c89b3c, #e8c060)", color: "#001030", padding: "2px 7px", borderRadius: "4px", fontWeight: "900", letterSpacing: "0.05em", flexShrink: 0, marginLeft: "auto" }}>
                  ADMIN
                </span>
              )}
              {isEditor && (
                <span style={{ fontSize: "0.58rem", background: "linear-gradient(135deg, #006080, #00b4d8)", color: "#fff", padding: "2px 7px", borderRadius: "4px", fontWeight: "900", letterSpacing: "0.05em", flexShrink: 0, marginLeft: "auto" }}>
                  EDITOR
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Links de navegació */}
        <nav style={{ padding: "0.75rem 0", flex: 1, overflowY: "auto" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "0.875rem 1.5rem",
                  fontSize: "1rem", fontWeight: active ? "800" : "500",
                  color: active ? "#ffffff" : "#8ab4e8",
                  background: active ? "#1565c022" : "transparent",
                  borderLeft: active ? "3px solid #00b4d8" : "3px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <link.Icon size={18} style={{ flexShrink: 0, color: active ? "#00b4d8" : "#4a7acc" }} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth al fons del drawer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #1a3a6a44" }}>
          {session ? (
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              style={{
                width: "100%", background: "transparent",
                border: "1px solid #1a3a6a", color: "#6a9acc",
                padding: "0.75rem", borderRadius: "10px",
                fontSize: "0.9rem", fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <LogOut size={16} />
              Tancar sessió
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center",
                border: "1px solid #1a3a6a", color: "#6a9acc",
                padding: "0.75rem", borderRadius: "10px",
                fontSize: "0.9rem", fontWeight: "600", textDecoration: "none",
              }}>
                <LogIn size={16} />
                Iniciar sessió
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="cl-btn-gold" style={{
                display: "block", textAlign: "center",
                fontSize: "0.9rem", padding: "0.75rem", borderRadius: "10px",
              }}>
                Registrar-se
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
