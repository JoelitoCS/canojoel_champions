"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, Inbox, Pencil, Trash2 } from "lucide-react";

interface Team { id: string; name: string; shortName: string; logo: string | null; }
interface Match {
  id: string;
  homeTeam: Team; awayTeam: Team;
  homeScore: number | null; awayScore: number | null;
  matchDate: string; stage: string; status: string; venue: string | null;
}

const STAGES = [
  { value: "GROUP", label: "Fase de Grups" },
  { value: "ROUND_OF_16", label: "Vuitens de Final" },
  { value: "QUARTER_FINAL", label: "Quarts de Final" },
  { value: "SEMI_FINAL", label: "Semifinals" },
  { value: "FINAL", label: "Gran Final" },
];
const STATUSES = [
  { value: "SCHEDULED", label: "Programat" },
  { value: "LIVE", label: "En Joc" },
  { value: "FINISHED", label: "Finalitzat" },
  { value: "CANCELLED", label: "Cancel·lat" },
];
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#4a7acc", LIVE: "#4daa66", FINISHED: "#7a7acc", CANCELLED: "#cc5555",
};

const EMPTY_FORM = {
  homeTeamId: "", awayTeamId: "", matchDate: "",
  stage: "GROUP", status: "SCHEDULED",
  homeScore: "", awayScore: "", venue: "",
};

const inputStyle = {
  width: "100%", background: "#001a4a", border: "1px solid #1a4a88",
  borderRadius: "8px", padding: "0.55rem 0.9rem", color: "#c8daff",
  fontSize: "0.875rem", outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.7rem", color: "#7aadff", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminPartitsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [mRes, tRes] = await Promise.all([fetch("/api/matches"), fetch("/api/teams")]);
    if (mRes.ok) setMatches(await mRes.json());
    if (tRes.ok) setTeams(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function startEdit(match: Match) {
    const d = new Date(match.matchDate);
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      homeTeamId: match.homeTeam.id, awayTeamId: match.awayTeam.id,
      matchDate: localDate, stage: match.stage, status: match.status,
      homeScore: match.homeScore?.toString() ?? "",
      awayScore: match.awayScore?.toString() ?? "",
      venue: match.venue ?? "",
    });
    setEditId(match.id);
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setForm(EMPTY_FORM); setEditId(null); setShowForm(false); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.homeTeamId === form.awayTeamId) { setError("L'equip local i visitant no poden ser el mateix"); return; }
    setSaving(true); setError("");
    const payload = {
      homeTeamId: form.homeTeamId, awayTeamId: form.awayTeamId,
      matchDate: new Date(form.matchDate).toISOString(),
      stage: form.stage, status: form.status,
      homeScore: form.homeScore !== "" ? parseInt(form.homeScore) : null,
      awayScore: form.awayScore !== "" ? parseInt(form.awayScore) : null,
      venue: form.venue || null,
    };
    const url = editId ? `/api/matches/${editId}` : "/api/matches";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(typeof d.error === "string" ? d.error : "Error en guardar"); }
    else { cancelForm(); fetchAll(); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
    if (res.ok) { setDeleteConfirm(null); fetchAll(); }
  }

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "#c89b3c", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase" }}>Admin</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Swords size={22} style={{ color: "#00b4d8" }} />
            <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#e0eaff", margin: 0 }}>Gestió de Partits</h1>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} className="cl-btn-gold" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
            + Nou Partit
          </button>
        )}
      </div>

      {showForm && (
        <div className="cl-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#e0eaff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            {editId ? <><Pencil size={17} /> Editar Partit</> : <><Swords size={17} /> Nou Partit</>}
          </h2>
          {error && (
            <div style={{ background: "#aa000022", border: "1px solid #cc000044", color: "#ff7777", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Equip Local *">
              <select required style={{ ...inputStyle, cursor: "pointer" }} value={form.homeTeamId}
                onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}>
                <option value="">Selecciona equip...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Equip Visitant *">
              <select required style={{ ...inputStyle, cursor: "pointer" }} value={form.awayTeamId}
                onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}>
                <option value="">Selecciona equip...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Data i Hora *">
              <input type="datetime-local" required style={inputStyle} value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })} />
            </Field>
            <Field label="Fase">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Estat">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Estadi">
              <input style={inputStyle} value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Camp Nou, Barcelona" />
            </Field>
            <Field label="Gols Local">
              <input type="number" min="0" style={inputStyle} value={form.homeScore}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                placeholder="—" />
            </Field>
            <Field label="Gols Visitant">
              <input type="number" min="0" style={inputStyle} value={form.awayScore}
                onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
                placeholder="—" />
            </Field>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={cancelForm} className="cl-btn-outline" style={{ cursor: "pointer", fontSize: "0.875rem" }}>Cancel·lar</button>
              <button type="submit" disabled={saving} className="cl-btn-gold" style={{ cursor: "pointer", fontSize: "0.875rem" }}>
                {saving ? "Guardant..." : editId ? "Actualitzar" : "Crear Partit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#3a6acc" }}>Carregant partits...</div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "linear-gradient(135deg, #001a4a44, #00102844)", border: "1px dashed #1a3a6a", borderRadius: "14px" }}>
          <Inbox size={48} style={{ color: "#1a3a6a", margin: "0 auto 0.75rem" }} />
          <p style={{ color: "#4a7acc" }}>Encara no hi ha partits. Crea el primer!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {matches.map((match) => (
            <div key={match.id} className="cl-card" style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                {/* Equips i marcador */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {match.homeTeam.logo && <img src={match.homeTeam.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}
                    <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#c8daff" }}>{match.homeTeam.shortName}</span>
                  </div>
                  <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#ffffff", padding: "0 0.5rem" }}>
                    {match.homeScore !== null ? match.homeScore : "·"} — {match.awayScore !== null ? match.awayScore : "·"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#c8daff" }}>{match.awayTeam.shortName}</span>
                    {match.awayTeam.logo && <img src={match.awayTeam.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}
                  </div>
                </div>

                {/* Metadades */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px",
                    color: STATUS_COLORS[match.status] ?? "#7aadff",
                    background: `${STATUS_COLORS[match.status] ?? "#4a7acc"}22`,
                    border: `1px solid ${STATUS_COLORS[match.status] ?? "#4a7acc"}44`,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{match.status}</span>
                  <span style={{ fontSize: "0.75rem", color: "#3a6acc" }}>
                    {new Date(match.matchDate).toLocaleDateString("ca-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Botons */}
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button onClick={() => startEdit(match)} style={{ background: "#002255", border: "1px solid #1a4a88", color: "#7aadff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Pencil size={12} /> Editar
                  </button>
                  {deleteConfirm === match.id ? (
                    <>
                      <button onClick={() => handleDelete(match.id)} style={{ background: "#aa0000", border: "1px solid #cc0000", color: "#ffaaaa", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700" }}>Confirmar</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid #2a4a6a", color: "#4a7acc", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(match.id)} style={{ background: "#300000", border: "1px solid #aa000044", color: "#cc5555", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Trash2 size={12} /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
