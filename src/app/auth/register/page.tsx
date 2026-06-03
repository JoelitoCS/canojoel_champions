"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle = {
  width: "100%", background: "#001a4a", border: "1px solid #1a4a88",
  borderRadius: "10px", padding: "0.7rem 1rem", color: "#c8daff",
  fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Error en el registre");
    else router.push("/auth/login?registered=1");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 8rem)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 30%, #002a7744 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: "420px", position: "relative",
        background: "linear-gradient(160deg, #001a4acc, #000f2acc)",
        border: "1px solid #1a3a7a55", borderRadius: "20px", padding: "2.5rem 2rem",
        backdropFilter: "blur(12px)", boxShadow: "0 0 60px #00224488",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 1rem",
            background: "linear-gradient(135deg, #c89b3c, #f5e6a3)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", boxShadow: "0 0 20px #c89b3c55",
          }}>★</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Crear compte</h1>
          <p style={{ fontSize: "0.85rem", color: "#4a7acc", marginTop: "4px" }}>Uneix-te a la plataforma Champions</p>
        </div>

        {error && (
          <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { key: "name", label: "Nom complet", type: "text", placeholder: "El teu nom" },
            { key: "email", label: "Email", type: "email", placeholder: "el-teu@email.com" },
            { key: "password", label: "Contrasenya", type: "password", placeholder: "Mínim 6 caràcters" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "#7aadff", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
              <input type={type} required minLength={key === "password" ? 6 : undefined} style={inputStyle}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} />
            </div>
          ))}
          <div style={{ background: "#001a3a", border: "1px solid #1a3a6a", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "#3a6acc" }}>
            💡 El primer usuari registrat rep automàticament el rol d&apos;Administrador.
          </div>
          <button type="submit" disabled={loading} className="cl-btn-gold"
            style={{ width: "100%", cursor: "pointer", fontSize: "0.95rem", padding: "0.75rem", marginTop: "0.25rem", borderRadius: "10px" }}>
            {loading ? "Creant compte..." : "Crear compte"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#3a5a88", marginTop: "1.5rem" }}>
          Ja tens compte?{" "}
          <Link href="/auth/login" style={{ color: "#e8c060", fontWeight: "700", textDecoration: "none" }}>
            Accedeix
          </Link>
        </p>
      </div>
    </div>
  );
}
