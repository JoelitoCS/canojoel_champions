"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TeamShield } from "@/components/TeamShield";

interface Team { id: string; name: string; shortName: string; logo: string | null; }
interface Match {
  id: string;
  homeTeam: Team; awayTeam: Team;
  homeScore: number | null; awayScore: number | null;
  matchDate: string; stage: string; status: string; venue: string | null;
}
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

const stageLabel: Record<string, string> = {
  GROUP: "Fase de Grups", ROUND_OF_16: "Vuitens de Final",
  QUARTER_FINAL: "Quarts de Final", SEMI_FINAL: "Semifinals", FINAL: "Gran Final",
};
const statusLabel: Record<string, string> = {
  SCHEDULED: "Programat", LIVE: "En Joc", FINISHED: "Finalitzat", CANCELLED: "Cancel·lat",
};
const statusColor: Record<string, string> = {
  SCHEDULED: "#64b5f6", LIVE: "#00e676", FINISHED: "#ce93d8", CANCELLED: "#f48fb1",
};

export default function PartitDetallPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMatch = useCallback(async () => {
    const res = await fetch("/api/matches");
    if (res.ok) {
      const all: Match[] = await res.json();
      const found = all.find((m) => m.id === id);
      if (!found) { router.push("/partits"); return; }
      setMatch(found);
    }
    setLoadingMatch(false);
  }, [id, router]);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/matches/${id}/comments`);
    if (res.ok) setComments(await res.json());
  }, [id]);

  useEffect(() => { fetchMatch(); fetchComments(); }, [fetchMatch, fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/matches/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSubmitting(false);
    if (res.ok) {
      setContent("");
      fetchComments();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error en enviar el comentari");
    }
  }

  async function handleDelete(commentId: string) {
    const res = await fetch(`/api/matches/${id}/comments?commentId=${commentId}`, { method: "DELETE" });
    if (res.ok) fetchComments();
  }

  if (loadingMatch) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#4a7acc" }}>Carregant partit...</p>
    </div>
  );

  if (!match) return null;

  const isPlayed = match.status === "FINISHED" || match.status === "LIVE";
  const color = statusColor[match.status] ?? "#64b5f6";

  return (
    <div style={{ maxWidth: "750px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Enrere */}
      <Link href="/partits" style={{ fontSize: "0.8rem", color: "#4a7acc", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "2rem" }}>
        ← Tornar a Partits
      </Link>

      {/* Targeta del partit */}
      <div className="cl-card" style={{ padding: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {/* Equip local */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "120px" }}>
            <TeamShield name={match.homeTeam.name} shortName={match.homeTeam.shortName} logo={match.homeTeam.logo} size={64} />
            <span style={{ fontSize: "1rem", fontWeight: "800", color: "#c8daff" }}>{match.homeTeam.name}</span>
          </div>

          {/* Marcador / VS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            {isPlayed ? (
              <div style={{ fontSize: "3rem", fontWeight: "900", color: "#ffffff", lineHeight: 1 }}>
                {match.homeScore} — {match.awayScore}
              </div>
            ) : (
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#1565c0" }}>VS</div>
            )}
            <span style={{ fontSize: "0.65rem", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.08em", textTransform: "uppercase", color, background: `${color}22`, border: `1px solid ${color}44` }}>
              {match.status === "LIVE" && "● "}{statusLabel[match.status]}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#3a6acc" }}>
              {new Date(match.matchDate).toLocaleDateString("ca-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
            {match.venue && <span style={{ fontSize: "0.72rem", color: "#2a5a88" }}>📍 {match.venue}</span>}
            <span style={{ fontSize: "0.65rem", color: "#1a4a7a", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {stageLabel[match.stage]}
            </span>
          </div>

          {/* Equip visitant */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "120px" }}>
            <TeamShield name={match.awayTeam.name} shortName={match.awayTeam.shortName} logo={match.awayTeam.logo} size={64} />
            <span style={{ fontSize: "1rem", fontWeight: "800", color: "#c8daff" }}>{match.awayTeam.name}</span>
          </div>
        </div>
      </div>

      {/* Comentaris */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#7aadff", marginBottom: "1.25rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          💬 Comentaris ({comments.length})
        </h2>

        {/* Formulari */}
        {session ? (
          <div className="cl-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Escriu un comentari sobre aquest partit..."
                style={{
                  width: "100%", background: "#001a4a", border: "1px solid #1a4a88",
                  borderRadius: "10px", padding: "0.75rem 1rem", color: "#c8daff",
                  fontSize: "0.875rem", outline: "none", resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              {error && <p style={{ fontSize: "0.8rem", color: "#ff7777" }}>⚠️ {error}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#2a4a6a" }}>{content.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="cl-btn-gold"
                  style={{ padding: "0.45rem 1.25rem", fontSize: "0.85rem", cursor: "pointer", borderRadius: "8px" }}
                >
                  {submitting ? "Enviant..." : "💬 Comentar"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, #001a4a44, #001028aa)", border: "1px solid #1a3a6a44", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "#4a7acc", fontSize: "0.875rem" }}>
              <Link href="/auth/login" style={{ color: "#00b4d8", fontWeight: "700" }}>Inicia sessió</Link> per deixar un comentari.
            </p>
          </div>
        )}

        {/* Llista de comentaris */}
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "#2a4a6a", fontSize: "0.875rem" }}>
            Encara no hi ha comentaris. Sigues el primer!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {comments.map((c) => {
              const isMe = c.user.id === session?.user?.id;
              const isAdmin = session?.user?.role === "ADMIN";
              const initials = (c.user.name ?? "U")[0].toUpperCase();
              return (
                <div key={c.id} className="cl-card" style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    {/* Avatar */}
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      background: c.user.image ? "transparent" : "linear-gradient(135deg, #1565c0, #00b4d8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: "800", color: "#fff", overflow: "hidden", position: "relative",
                    }}>
                      {c.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : initials}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#c8daff" }}>
                          {c.user.name ?? "Usuari"}
                        </span>
                        {isMe && <span style={{ fontSize: "0.6rem", color: "#c89b3c", fontWeight: "700" }}>(tu)</span>}
                        <span style={{ fontSize: "0.7rem", color: "#2a4a6a", marginLeft: "auto" }}>
                          {new Date(c.createdAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#8aaad8", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
                    </div>

                    {/* Eliminar (owner o admin) */}
                    {(isMe || isAdmin) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ background: "transparent", border: "none", color: "#cc3333", cursor: "pointer", fontSize: "0.75rem", padding: "2px 4px", flexShrink: 0 }}
                        title="Eliminar comentari"
                      >🗑️</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
