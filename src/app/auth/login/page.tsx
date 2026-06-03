"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const inputStyle = {
  width: "100%",
  background: "#001a4a",
  border: "1px solid #1a4a88",
  borderRadius: "10px",
  padding: "0.7rem 1rem",
  color: "#c8daff",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Si ja tens sessió activa, redirigeix ──
  useEffect(() => {
    if (status === "authenticated") {
      // Si l'usuari és admin i ve de /admin, envia'l allà directament
      if (session?.user?.role === "ADMIN" && callbackUrl.startsWith("/admin")) {
        router.replace(callbackUrl);
      } else if (session?.user?.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(callbackUrl === "/auth/login" ? "/" : callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  // Mostrar loading mentre comprovem la sessió
  if (status === "loading" || status === "authenticated") {
    return (
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "linear-gradient(160deg, #001a4acc, #000f2acc)",
        border: "1px solid #1a3a7a55", borderRadius: "20px", padding: "2.5rem 2rem",
        backdropFilter: "blur(12px)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⭐</div>
        <p style={{ color: "#4a7acc", fontSize: "0.9rem" }}>Redirigint...</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (result?.error) setError("Email o contrasenya incorrectes.");
    else { router.push(callbackUrl); router.refresh(); }
  }

  return (
    <div style={{
      width: "100%", maxWidth: "420px", position: "relative",
      background: "linear-gradient(160deg, #001a4acc, #000f2acc)",
      border: "1px solid #1a3a7a55", borderRadius: "20px", padding: "2.5rem 2rem",
      backdropFilter: "blur(12px)", boxShadow: "0 0 60px #00224488",
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          width: "56px", height: "56px", margin: "0 auto 1rem",
          background: "linear-gradient(135deg, #1565c0, #00b4d8)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", boxShadow: "0 0 20px #1565c055",
        }}>⭐</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Benvingut</h1>
        <p style={{ fontSize: "0.85rem", color: "#4a7acc", marginTop: "4px" }}>Accedeix al teu compte Champions</p>
      </div>

      {registered && (
        <div style={{ background: "#003a1a44", border: "1px solid #00aa4444", color: "#4dcc88", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
          ✅ Compte creat correctament. Ara pots entrar.
        </div>
      )}
      {error && (
        <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", color: "#7aadff", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Email</label>
          <input type="email" required style={inputStyle} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="tu@email.com" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", color: "#7aadff", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contrasenya</label>
          <input type="password" required style={inputStyle} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="cl-btn-gold"
          style={{ width: "100%", cursor: "pointer", fontSize: "0.95rem", padding: "0.75rem", marginTop: "0.5rem", borderRadius: "10px" }}>
          {loading ? "Entrant..." : "Entrar"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#3a5a88", marginTop: "1.5rem" }}>
        No tens compte?{" "}
        <Link href="/auth/register" style={{ color: "#00b4d8", fontWeight: "700", textDecoration: "none" }}>
          Registra&apos;t
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "calc(100vh - 8rem)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem 1rem", position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 30%, #1565c022 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <Suspense fallback={
        <div style={{ color: "#4a7acc", fontSize: "0.9rem" }}>Carregant...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
