"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  image: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#c89b3c",
  EDITOR: "#00b4d8",
  USER: "#4a7acc",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  USER: "Usuari",
};

export default function AdminUsuarisPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setChangingRole(null);
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      setSuccess(`Rol de ${updated.name ?? updated.email} actualitzat a ${ROLE_LABELS[updated.role]}.`);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const d = await res.json();
      setError(d.error ?? "Error canviant el rol");
    }
  }

  async function handleDelete(userId: string) {
    setError("");
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteConfirm(null);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("Usuari eliminat correctament.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const d = await res.json();
      setError(d.error ?? "Error eliminant l'usuari");
    }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Capçalera */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Admin
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#e0eaff" }}>
          👥 Gestió d&apos;Usuaris
        </h1>
        <p style={{ color: "#4a7acc", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Gestiona els rols i comptes dels usuaris de la plataforma
        </p>
      </div>

      {/* Missatges */}
      {error && (
        <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#003a1a44", border: "1px solid #00aa4444", color: "#4dcc88", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ✅ {success}
        </div>
      )}

      {/* Llegenda de rols */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["ADMIN", "EDITOR", "USER"] as const).map((role) => (
          <div key={role} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              fontSize: "0.65rem", fontWeight: "800", padding: "2px 8px", borderRadius: "20px",
              color: ROLE_COLORS[role],
              background: `${ROLE_COLORS[role]}22`,
              border: `1px solid ${ROLE_COLORS[role]}44`,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>{role}</span>
            <span style={{ fontSize: "0.75rem", color: "#4a6a88" }}>
              {role === "ADMIN" ? "Accés total + gestió usuaris" : role === "EDITOR" ? "CRUD equips i partits" : "Accés bàsic"}
            </span>
          </div>
        ))}
      </div>

      {/* Taula */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#3a6acc" }}>Carregant usuaris...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#4a7acc" }}>No hi ha usuaris.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Capçalera */}
          <div style={{
            display: "grid", gridTemplateColumns: "44px 1fr 200px 120px 130px",
            gap: "0.75rem", padding: "0.5rem 1.25rem",
            fontSize: "0.65rem", color: "#3a6acc", fontWeight: "700",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <div></div>
            <div>Usuari</div>
            <div>Email</div>
            <div>Rol actual</div>
            <div style={{ textAlign: "right" }}>Accions</div>
          </div>

          {users.map((user) => {
            const isMe = user.id === session?.user?.id;
            const initials = (user.name ?? user.email)[0].toUpperCase();

            return (
              <div key={user.id} className="cl-card" style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr 200px 120px 130px",
                gap: "0.75rem", padding: "0.85rem 1.25rem", alignItems: "center",
                opacity: isMe ? 0.7 : 1,
              }}>
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: user.image ? "transparent" : "linear-gradient(135deg, #1565c0, #00b4d8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: "800", color: "#fff",
                    overflow: "hidden", flexShrink: 0, position: "relative",
                  }}>
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : initials}
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <span style={{ fontWeight: "700", color: "#c8daff", fontSize: "0.875rem" }}>
                    {user.name ?? "—"}
                  </span>
                  {isMe && (
                    <span style={{ marginLeft: "8px", fontSize: "0.65rem", color: "#c89b3c", fontWeight: "700" }}>(tu)</span>
                  )}
                </div>

                {/* Email */}
                <span style={{ fontSize: "0.78rem", color: "#4a6a99", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>

                {/* Rol actual */}
                <span style={{
                  fontSize: "0.65rem", fontWeight: "800", padding: "2px 8px", borderRadius: "20px",
                  color: ROLE_COLORS[user.role],
                  background: `${ROLE_COLORS[user.role]}22`,
                  border: `1px solid ${ROLE_COLORS[user.role]}44`,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  display: "inline-block",
                }}>{user.role}</span>

                {/* Accions */}
                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", alignItems: "center" }}>
                  {isMe ? (
                    <span style={{ fontSize: "0.7rem", color: "#3a5a78" }}>—</span>
                  ) : (
                    <>
                      {/* Selector de rol */}
                      <select
                        value={user.role}
                        disabled={changingRole === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{
                          background: "#001a4a", border: "1px solid #1a4a88",
                          color: "#7aadff", padding: "3px 6px", borderRadius: "6px",
                          fontSize: "0.72rem", cursor: "pointer", fontWeight: "600",
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {/* Eliminar */}
                      {deleteConfirm === user.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{ background: "#aa0000", border: "1px solid #cc0000", color: "#ffaaaa", padding: "3px 8px", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer", fontWeight: "700" }}
                          >Ok</button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{ background: "transparent", border: "1px solid #2a4a6a", color: "#4a7acc", padding: "3px 6px", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer" }}
                          >✕</button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          style={{ background: "#300000", border: "1px solid #aa000044", color: "#cc5555", padding: "3px 8px", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer", fontWeight: "600" }}
                        >🗑️</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#2a4a6a" }}>
        Total: {users.length} usuari{users.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
