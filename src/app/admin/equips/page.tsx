"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Inbox, Pencil, Trash2, Info } from "lucide-react";

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  country: string;
  group: string | null;
}

const EMPTY_FORM = { name: "", shortName: "", logo: "", country: "Europa", group: "" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", color: "#7aadff", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#001a4a", border: "1px solid #1a4a88",
  borderRadius: "8px", padding: "0.55rem 0.9rem", color: "#c8daff",
  fontSize: "0.875rem", outline: "none", transition: "border-color 0.15s",
};

export default function AdminEquipsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/teams");
    if (res.ok) setTeams(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  function startEdit(team: Team) {
    setForm({ name: team.name, shortName: team.shortName, logo: team.logo ?? "", country: team.country, group: team.group ?? "" });
    setEditId(team.id);
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editId ? `/api/teams/${editId}` : "/api/teams";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, logo: form.logo || null, group: form.group || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Error en guardar l'equip");
    } else {
      cancelForm();
      fetchTeams();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
    if (res.ok) { setDeleteConfirm(null); fetchTeams(); }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Capçalera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase" }}>Admin</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={22} style={{ color: "#00b4d8" }} />
            <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Gestió d&apos;Equips</h1>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
            className="cl-btn-gold"
            style={{ fontSize: "0.875rem", cursor: "pointer" }}
          >
            + Nou Equip
          </button>
        )}
      </div>

      {/* Formulari */}
      {showForm && (
        <div className="cl-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#e0eaff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            {editId ? <><Pencil size={17} /> Editar Equip</> : <><Shield size={17} /> Nou Equip</>}
          </h2>
          {!editId && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "#001a4a", border: "1px solid #1a6acc66", borderRadius: "8px", padding: "0.7rem 1rem", marginBottom: "1.25rem" }}>
              <Info size={15} style={{ color: "#4a9eff", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontSize: "0.8rem", color: "#7aadff", lineHeight: 1.5 }}>Todos los campos son obligatorios.</span>
            </div>
          )}
          {error && (
            <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Nom complet *">
              <input required style={inputStyle} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="FC Barcelona" />
            </Field>
            <Field label="Abreviatura * (max 5)">
              <input required maxLength={5} style={inputStyle} value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })}
                placeholder="FCB" />
            </Field>
            <Field label="País">
              <input style={inputStyle} value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Espanya" />
            </Field>
            <Field label="Grup (A–H)">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}>
                <option value="">Sense grup</option>
                {["A","B","C","D","E","F","G","H"].map((g) => (
                  <option key={g} value={g}>Grup {g}</option>
                ))}
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="URL del logo">
                <input type="url" style={inputStyle} value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://example.com/logo.png" />
              </Field>
              {form.logo && (
                <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={form.logo} alt="Preview" style={{ width: "32px", height: "32px", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span style={{ fontSize: "0.75rem", color: "#3a6acc" }}>Preview del logo</span>
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={cancelForm} className="cl-btn-outline" style={{ cursor: "pointer", fontSize: "0.875rem" }}>
                Cancel·lar
              </button>
              <button type="submit" disabled={saving} className="cl-btn-gold" style={{ cursor: "pointer", fontSize: "0.875rem" }}>
                {saving ? "Guardant..." : editId ? "Actualitzar" : "Crear Equip"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Llista d'equips */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#3a6acc" }}>Carregant equips...</div>
      ) : teams.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "linear-gradient(135deg, #001a4a44, #00102844)", border: "1px dashed #1a3a6a", borderRadius: "14px" }}>
          <Inbox size={48} style={{ color: "#1a3a6a", margin: "0 auto 0.75rem" }} />
          <p style={{ color: "#4a7acc" }}>Encara no hi ha equips. Crea el primer!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Capçalera de la taula */}
          <div style={{
            display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 100px 120px",
            gap: "0.75rem", padding: "0.5rem 1.25rem",
            fontSize: "0.65rem", color: "#3a6acc", fontWeight: "700",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <div>Logo</div><div>Nom</div><div>Codi</div><div>Grup</div><div>País</div>
            <div style={{ textAlign: "right" }}>Accions</div>
          </div>

          {teams.map((team) => (
            <div key={team.id} className="cl-card" style={{
              display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 100px 120px",
              gap: "0.75rem", padding: "0.85rem 1.25rem", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {team.logo ? (
                  <img src={team.logo} alt={team.name} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#002255", border: "1px solid #1a4a88", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: "800", color: "#4a7acc" }}>
                    {team.shortName.slice(0, 3)}
                  </div>
                )}
              </div>
              <span style={{ fontWeight: "700", color: "#c8daff", fontSize: "0.875rem" }}>{team.name}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#7aadff", background: "#001a4a", border: "1px solid #1a3a6a", padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em", display: "inline-block" }}>{team.shortName}</span>
              <span style={{ fontSize: "0.8rem", color: team.group ? "#c89b3c" : "#2a4a6a" }}>{team.group ? `Grup ${team.group}` : "—"}</span>
              <span style={{ fontSize: "0.78rem", color: "#4a6a99" }}>{team.country}</span>

              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                <button onClick={() => startEdit(team)} style={{ background: "#002255", border: "1px solid #1a4a88", color: "#7aadff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Pencil size={12} /> Editar
                </button>
                {deleteConfirm === team.id ? (
                  <>
                    <button onClick={() => handleDelete(team.id)} style={{ background: "#aa0000", border: "1px solid #cc0000", color: "#ffaaaa", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700" }}>Confirmar</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid #2a4a6a", color: "#4a7acc", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(team.id)} style={{ background: "#300000", border: "1px solid #aa000044", color: "#cc5555", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Trash2 size={12} /> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
