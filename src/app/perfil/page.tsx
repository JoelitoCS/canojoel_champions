"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

const labelStyle = {
  display: "block",
  fontSize: "0.72rem",
  color: "#7aadff",
  fontWeight: "700",
  marginBottom: "6px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState({ id: "", name: "", email: "", image: "" });
  const [form, setForm] = useState({ name: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [successInfo, setSuccessInfo] = useState("");
  const [successAvatar, setSuccessAvatar] = useState("");
  const [errorInfo, setErrorInfo] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          setUserData(data);
          setForm({ name: data.name ?? "", email: data.email ?? "" });
        });
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#4a7acc" }}>Carregant perfil...</p>
      </div>
    );
  }

  const currentImage = avatarPreview ?? userData.image ?? null;
  const initials = (userData.name ?? userData.email ?? "U")[0].toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSuccessAvatar("");
    setErrorAvatar("");
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setLoadingAvatar(true);
    setErrorAvatar("");
    setSuccessAvatar("");

    const fd = new FormData();
    fd.append("avatar", avatarFile);

    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setLoadingAvatar(false);

    if (!res.ok) {
      setErrorAvatar(data.error ?? "Error pujant la imatge");
      return;
    }

    setUserData((prev) => ({ ...prev, image: data.imageUrl }));
    setAvatarPreview(null);
    setAvatarFile(null);
    setSuccessAvatar("✅ Foto de perfil actualitzada correctament.");
    await update({ image: data.imageUrl });
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingInfo(true);
    setErrorInfo("");
    setSuccessInfo("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoadingInfo(false);

    if (!res.ok) {
      setErrorInfo(data.error ?? "Error actualitzant el perfil");
      return;
    }

    setUserData((prev) => ({ ...prev, ...data }));
    setSuccessInfo("✅ Informació actualitzada correctament.");
    await update({ name: data.name, email: data.email });
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Configuració
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#e0eaff", marginBottom: "0.25rem" }}>
          El meu Perfil
        </h1>
        <p style={{ color: "#4a7acc", fontSize: "0.9rem" }}>
          Edita la teva informació i foto de perfil
        </p>
      </div>

      {/* ── Foto de perfil ── */}
      <div style={{
        background: "linear-gradient(135deg, #001a4a88, #001028aa)",
        border: "1px solid #1a3a6a44",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "1.5rem",
      }}>
        <h2 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#7aadff", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          📷 Foto de Perfil
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: currentImage ? "transparent" : "linear-gradient(135deg, #1565c0, #00b4d8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem", fontWeight: "900", color: "#fff",
              flexShrink: 0, cursor: "pointer", position: "relative",
              border: "3px solid #1a4a8855", overflow: "hidden",
            }}
          >
            {currentImage ? (
              <Image src={currentImage} alt="Avatar" fill style={{ objectFit: "cover" }} />
            ) : (
              initials
            )}
            <div style={{
              position: "absolute", inset: 0, background: "#00000055",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s", fontSize: "1.5rem",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            >
              ✏️
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: "#6a9acc", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.6 }}>
              Fes clic a l&apos;avatar o al botó per seleccionar una imatge.<br />
              <span style={{ color: "#3a5a88", fontSize: "0.78rem" }}>JPG, PNG, WEBP o GIF · Màxim 5MB</span>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                background: "linear-gradient(135deg, #001a4a, #002060)",
                border: "1px solid #1a4a88", color: "#7aadff",
                padding: "0.5rem 1.2rem", borderRadius: "8px",
                fontSize: "0.82rem", fontWeight: "600", cursor: "pointer",
              }}>
                📁 Seleccionar foto
              </button>
              {avatarFile && (
                <button onClick={handleAvatarUpload} disabled={loadingAvatar} className="cl-btn-gold"
                  style={{ padding: "0.5rem 1.2rem", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                  {loadingAvatar ? "Pujant..." : "⬆️ Pujar foto"}
                </button>
              )}
              {avatarFile && (
                <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} style={{
                  background: "transparent", border: "1px solid #3a1a1a",
                  color: "#aa4444", padding: "0.5rem 0.9rem",
                  borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer",
                }}>
                  ✕ Cancel·lar
                </button>
              )}
            </div>
            {avatarFile && (
              <p style={{ fontSize: "0.78rem", color: "#4a7acc", marginTop: "0.5rem" }}>
                Fitxer seleccionat: <strong style={{ color: "#7aadff" }}>{avatarFile.name}</strong>
              </p>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          style={{ display: "none" }} onChange={handleFileChange} />

        {errorAvatar && (
          <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "10px", padding: "0.6rem 1rem", marginTop: "1rem", fontSize: "0.82rem" }}>
            ⚠️ {errorAvatar}
          </div>
        )}
        {successAvatar && (
          <div style={{ background: "#003a1a44", border: "1px solid #00aa4444", color: "#4dcc88", borderRadius: "10px", padding: "0.6rem 1rem", marginTop: "1rem", fontSize: "0.82rem" }}>
            {successAvatar}
          </div>
        )}
      </div>

      {/* ── Informació personal ── */}
      <div style={{
        background: "linear-gradient(135deg, #001a4a88, #001028aa)",
        border: "1px solid #1a3a6a44",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "1.5rem",
      }}>
        <h2 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#7aadff", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          👤 Informació Personal
        </h2>

        <form onSubmit={handleInfoSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Nom</label>
            <input type="text" style={inputStyle} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="El teu nom" minLength={2} maxLength={50} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com" />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              {isAdmin && (
                <span style={{
                  fontSize: "0.65rem",
                  background: "linear-gradient(135deg, #c89b3c, #e8c060)",
                  color: "#001030", padding: "3px 10px", borderRadius: "5px",
                  fontWeight: "900", letterSpacing: "0.05em",
                }}>⭐ ADMIN</span>
              )}
            </div>
            <button type="submit" disabled={loadingInfo} className="cl-btn-gold"
              style={{ padding: "0.6rem 1.75rem", borderRadius: "10px", fontSize: "0.9rem", cursor: "pointer" }}>
              {loadingInfo ? "Guardant..." : "💾 Guardar canvis"}
            </button>
          </div>
        </form>

        {errorInfo && (
          <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "10px", padding: "0.6rem 1rem", marginTop: "1rem", fontSize: "0.82rem" }}>
            ⚠️ {errorInfo}
          </div>
        )}
        {successInfo && (
          <div style={{ background: "#003a1a44", border: "1px solid #00aa4444", color: "#4dcc88", borderRadius: "10px", padding: "0.6rem 1rem", marginTop: "1rem", fontSize: "0.82rem" }}>
            {successInfo}
          </div>
        )}
      </div>

      {/* ── Info del compte ── */}
      <div style={{
        background: "linear-gradient(135deg, #001a4a44, #001028aa)",
        border: "1px solid #1a3a6a33",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
      }}>
        <p style={{ fontSize: "0.72rem", color: "#3a5a88", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Info del compte
        </p>
        <p style={{ fontSize: "0.82rem", color: "#4a6a88" }}>
          ID: <span style={{ color: "#3a5a78", fontFamily: "monospace", fontSize: "0.75rem" }}>{userData.id || session?.user?.id}</span>
        </p>
      </div>
    </div>
  );
}
