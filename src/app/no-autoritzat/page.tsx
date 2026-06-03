import Link from "next/link";

export default function NoAutoritzatPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 8rem)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <div>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🚫</div>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#e0eaff", marginBottom: "0.5rem" }}>Accés Denegat</h1>
        <p style={{ color: "#4a7acc", marginBottom: "2rem", fontSize: "0.95rem" }}>No tens els permisos necessaris per accedir a aquesta pàgina.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/" className="cl-btn-gold" style={{ textDecoration: "none", borderRadius: "10px" }}>Tornar a l&apos;inici</Link>
          <Link href="/auth/login" className="cl-btn-outline" style={{ textDecoration: "none", borderRadius: "10px" }}>Iniciar sessió</Link>
        </div>
      </div>
    </div>
  );
}
